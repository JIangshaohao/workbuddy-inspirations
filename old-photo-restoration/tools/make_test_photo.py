#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成一张「仿真老照片」，供管线验收使用。

劣化项对应真实老照片特征，随机种子固定，结果可复现：
  1. 缩放 + 轻微高斯模糊（模拟扫描/翻拍失焦）
  2. 叠加高斯颗粒（模拟胶片颗粒）
  3. 泛黄偏色（R 提、B 降）
  4. 降饱和（模拟褪色）
  5. 随机亮斑（模拟霉点）

用法：
  python make_test_photo.py <源图> <输出路径> [边长]

依赖：opencv-python(-headless)、numpy
"""
import os
import sys

import cv2
import numpy as np


def degrade(src: str, dst: str, size: int = 720) -> None:
    buf = np.fromfile(src, dtype=np.uint8)
    img = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f"无法解码源图：{src}")

    img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
    img = cv2.GaussianBlur(img, (0, 0), 0.9)

    rng = np.random.default_rng(20261016)
    grain = rng.normal(0, 11.0, img.shape).astype(np.float32)
    img = np.clip(img.astype(np.float32) + grain, 0, 255)

    img[:, :, 2] *= 1.07   # BGR 中的 R
    img[:, :, 0] *= 0.88   # BGR 中的 B

    hsv = cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[:, :, 1] *= 0.72
    img = cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR)

    for _ in range(40):
        x, y = rng.integers(0, size, 2)
        cv2.circle(img, (int(x), int(y)), int(rng.integers(2, 6)), (215, 220, 228), -1)

    img = np.clip(img, 0, 255).astype(np.uint8)
    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    cv2.imencode(".png", img)[1].tofile(dst)
    print(f"WROTE {dst} {img.shape}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    degrade(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 720)
