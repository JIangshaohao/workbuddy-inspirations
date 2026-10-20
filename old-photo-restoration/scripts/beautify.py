#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
beautify.py — 老照片本地四步修复管线

设计目标：纯本地、无网络、无 API Key，参数可复现，输出无损 PNG。
四条处理链严格按顺序执行，每步参数与效果都会被记录，便于写修复说明文档。

管线：
  Step 1  去噪      非局部均值去噪 fastNlMeansDenoisingColored（保纹理，防塑料感）
  Step 2  亮度/对比度 线性增益 out = clip(alpha * src + beta)
  Step 3  色彩增强   HSV 空间提升 S 通道，修正泛黄偏色带来的低饱和
  Step 4  锐化       反锐化掩膜 Unsharp Mask，并对肤色区域降权避免白边伪影

用法：
  python beautify.py input.jpg -o output.png --denoise medium \\
      --brightness 1.15 --contrast 1.2 --saturation 1.4 --sharpness 1.3

依赖：opencv-python(-headless)、numpy
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time

import cv2
import numpy as np

# 去噪强度 -> 亮度噪声强度 h（hColor 会自动取略低值以保护肤色层次）
DENOISE_H = {"none": 0, "light": 5, "medium": 10, "strong": 15}


# ---------------------------------------------------------------- I/O 工具
def load_image(path: str) -> np.ndarray:
    """读取图片。使用 imdecode 以兼容中文路径与 Windows 反斜杠路径。"""
    if not os.path.isfile(path):
        raise FileNotFoundError(f"输入图片不存在：{path}")
    buf = np.fromfile(path, dtype=np.uint8)
    img = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"无法解码图片（格式不支持或文件损坏）：{path}")
    return img


def save_image(path: str, img: np.ndarray) -> None:
    """保存图片。使用 imencode + tofile 以兼容中文路径；PNG 为无损编码。"""
    ext = os.path.splitext(path)[1].lower() or ".png"
    params = []
    if ext in (".jpg", ".jpeg"):
        params = [cv2.IMWRITE_JPEG_QUALITY, 98]
    elif ext == ".png":
        params = [cv2.IMWRITE_PNG_COMPRESSION, 3]
    ok, buf = cv2.imencode(ext, img, params)
    if not ok:
        raise ValueError(f"图片编码失败：{ext}")
    buf.tofile(path)


# ---------------------------------------------------------------- 质量指标
def metrics(img: np.ndarray) -> dict:
    """计算用于量化评估的指标，供修复说明文档引用。"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # 高频残差标准差 ≈ 颗粒/噪点强度
    noise = float(np.std(gray.astype(np.float32) - cv2.GaussianBlur(gray, (0, 0), 1.5)))
    # Laplacian 方差 ≈ 清晰度
    sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    # 整体色调倾向：B、R 通道均值之差，>0 表示偏暖（泛黄的典型特征）
    b, g, r = (float(img[:, :, i].mean()) for i in range(3))
    return {
        "brightness_mean": round(float(gray.mean()), 2),
        "saturation_mean": round(float(hsv[:, :, 1].mean()), 2),
        "noise_sigma": round(noise, 2),
        "sharpness_lapvar": round(sharp, 1),
        "warm_bias_r_minus_b": round(r - b, 2),
    }


# ---------------------------------------------------------------- 四步处理
def skin_mask(img: np.ndarray) -> np.ndarray:
    """肤色掩膜（YCrCb 阈值法），返回 0~1 的 float 权重图。用于面部保护。"""
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    mask = cv2.inRange(ycrcb, (40, 133, 77), (255, 173, 127))
    mask = cv2.GaussianBlur(mask, (0, 0), 3)
    return mask.astype(np.float32) / 255.0


def step_denoise(img: np.ndarray, level: str) -> tuple[np.ndarray, str]:
    h = DENOISE_H[level]
    if h == 0:
        return img, "跳过（--denoise none）"
    h_color = max(3, h - 3)
    out = cv2.fastNlMeansDenoisingColored(img, None, h, h_color, 7, 21)
    desc = (
        f"cv2.fastNlMeansDenoisingColored  h={h}（亮度噪声）, "
        f"hColor={h_color}（色度噪声，刻意低于 h 以保留肤色层次）, "
        f"templateWindowSize=7, searchWindowSize=21"
    )
    return out, desc


def step_brightness_contrast(img: np.ndarray, brightness: float, contrast: float) -> tuple[np.ndarray, str]:
    """亮度用 gamma 提亮，对比度用 smoothstep S 曲线。

    为什么不用 out = alpha*src + beta：
      实测线性方案会把通道值 >196 的像素全部并到 255，高光裁剪率高达 35%，
      亮部细节整片丢失，与"增强层次感"的目标直接冲突。
    gamma 提亮对暗部的抬升幅度大于亮部；S 曲线值域严格 [0,1]，两端渐近，不引入额外裁剪。
    """
    k = float(np.clip(2 * (contrast - 1), -1, 1))
    x = np.arange(256, dtype=np.float64) / 255.0
    s = x * x * (3 - 2 * x)                 # smoothstep
    t = np.clip(x + k * (s - x), 0, 1)      # lerp(x, s(x), k)
    v = 255.0 * np.power(t, 1.0 / brightness)
    lut = np.clip(np.round(v), 0, 255).astype(np.uint8)
    out = cv2.LUT(img, lut)
    desc = (
        f"亮度 gamma 提亮 γ=1/{brightness:.2f}；对比度 smoothstep S 曲线（k={k:.2f}，"
        f"中段斜率≈{1 + 0.5 * k:.2f}×），值域严格 [0,1] 无额外裁剪（256 级 LUT）"
    )
    return out, desc


def step_saturation(img: np.ndarray, saturation: float) -> tuple[np.ndarray, str]:
    """luma 保持式饱和度混合：out = Y + (C - Y) * saturation。

    为什么不用 HSV 的 S 通道增益：
      HSV 中保持 V（最大通道）不变而抬高 S，等价于压低最小通道；对暖色像素（R、G 高、B 低）
      会明显拉低加权亮度——实测整体平均亮度因此掉了约 9 个灰阶（159.2 -> 150.3），
      与"提亮"的目标互相打架。luma 保持式按定义不改变 Y，只改变色度，不存在该副作用。
    """
    x = img.astype(np.float32)
    # OpenCV 是 BGR 顺序
    b, g, r = x[:, :, 0], x[:, :, 1], x[:, :, 2]
    y = (0.299 * r + 0.587 * g + 0.114 * b)[:, :, None]
    out = np.clip(y + (x - y) * saturation, 0, 255).astype(np.uint8)
    desc = f"out = Y + (C - Y) * {saturation}，Y = 0.299R + 0.587G + 0.114B（饱和度 {(saturation - 1) * 100:+.0f}%，luma 保持）"
    return out, desc


def step_sharpen(img: np.ndarray, sharpness: float, protect_faces: bool) -> tuple[np.ndarray, str]:
    amount = max(0.0, sharpness - 1.0)
    if amount == 0:
        return img, "跳过（--sharpness 1.0）"
    blur = cv2.GaussianBlur(img, (0, 0), 1.2)
    src = img.astype(np.float32)
    sharpened = src + amount * (src - blur.astype(np.float32))
    desc = f"Unsharp Mask：img + {amount:.2f} × (img - GaussianBlur(σ=1.2))"
    if protect_faces:
        skin = skin_mask(img)[:, :, None]
        # 肤色区域锐化强度降到 35%，避免面部出现过度锐化的白边伪影
        factor = 1.0 - 0.65 * skin
        sharpened = src + amount * (src - blur.astype(np.float32)) * factor
        desc += "；肤色掩膜内锐化量降至 35%（面部保护）"
    out = np.clip(sharpened, 0, 255).astype(np.uint8)
    return out, desc


# ---------------------------------------------------------------- 主流程
def build_comparison(before: np.ndarray, after: np.ndarray, gap: int = 12) -> np.ndarray:
    """生成左右对比图：左=原图，右=修复后。高度不一致时按较小值缩放对齐。"""
    h = min(before.shape[0], after.shape[0])
    def fit(im):
        scale = h / im.shape[0]
        return cv2.resize(im, (max(1, int(im.shape[1] * scale)), h), interpolation=cv2.INTER_AREA)
    b, a = fit(before), fit(after)
    sep = np.full((h, gap, 3), 255, dtype=np.uint8)
    return np.hstack([b, sep, a])


def main() -> int:
    ap = argparse.ArgumentParser(description="老照片本地四步修复（去噪 / 亮度对比度 / 饱和度 / 锐化）")
    ap.add_argument("input", help="输入图片路径")
    ap.add_argument("-o", "--output", required=True, help="输出图片路径（建议 .png）")
    ap.add_argument("--denoise", choices=list(DENOISE_H.keys()), default="medium", help="去噪强度，默认 medium")
    ap.add_argument("--brightness", type=float, default=1.15, help="亮度系数，默认 1.15")
    ap.add_argument("--contrast", type=float, default=1.2, help="对比度系数，默认 1.2")
    ap.add_argument("--saturation", type=float, default=1.4, help="饱和度系数，默认 1.4")
    ap.add_argument("--sharpness", type=float, default=1.3, help="锐化系数，默认 1.3")
    ap.add_argument("--compare", default=None, help="可选：输出左右对比图的路径")
    ap.add_argument("--report", default=None, help="可选：输出 JSON 参数与指标报告的路径")
    ap.add_argument("--no-face-protect", action="store_true", help="关闭面部保护（不推荐）")
    args = ap.parse_args()

    t0 = time.time()
    original = load_image(args.input)
    protect = not args.no_face_protect

    before_m = metrics(original)
    steps = []

    img, d1 = step_denoise(original, args.denoise)
    steps.append({"step": 1, "name": "去噪", "params": {"denoise": args.denoise}, "detail": d1})

    img, d2 = step_brightness_contrast(img, args.brightness, args.contrast)
    steps.append({"step": 2, "name": "亮度与对比度增强",
                  "params": {"brightness": args.brightness, "contrast": args.contrast}, "detail": d2})

    img, d3 = step_saturation(img, args.saturation)
    steps.append({"step": 3, "name": "色彩增强（饱和度）",
                  "params": {"saturation": args.saturation}, "detail": d3})

    img, d4 = step_sharpen(img, args.sharpness, protect)
    steps.append({"step": 4, "name": "锐化增强",
                  "params": {"sharpness": args.sharpness, "face_protect": protect}, "detail": d4})

    save_image(args.output, img)
    after_m = metrics(img)

    if args.compare:
        save_image(args.compare, build_comparison(original, img))

    report = {
        "input": os.path.abspath(args.input),
        "output": os.path.abspath(args.output),
        "input_size_px": [int(original.shape[1]), int(original.shape[0])],
        "elapsed_sec": round(time.time() - t0, 2),
        "steps": steps,
        "metrics_before": before_m,
        "metrics_after": after_m,
    }
    if args.report:
        with open(args.report, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
