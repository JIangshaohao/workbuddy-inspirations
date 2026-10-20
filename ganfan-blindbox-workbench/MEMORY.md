# MEMORY.md — 吃了吗您 · 干饭盲盒工作台

## 长期上下文

本灵感是「一键做同款」复制产物，不是从零手写。原页面由社区作者创作，本账号只做了
**数据表迁移 + databaseId 重映射**，未改动任何一行业务代码。

### 关键 ID（本账号）

| 对象 | ID | 链接 |
| --- | --- | --- |
| 页面节点 | `fuLFSrmasJFqEEiSjogVYZ` | https://www.workbuddy.cn/space/d/fuLFSrmasJFqEEiSjogVYZ |
| 菜品池（29 行） | `komd1ZY7LY1QI8JfhST0zr` | 挂在该页面节点下 |
| 吃饭记录（0 行） | `IkagYbTEezIbu7PgapjVnX` | 挂在该页面节点下 |

### 源对象（他人，只读）

| 对象 | ID | 说明 |
| --- | --- | --- |
| 源页面 | `KfgpS3ldDwiAc9BkbAbEvf` | 位于空间 `FuaObIhkGQm9ZSuX6Pz45S`，非本账号空间 |
| 源菜品池 | `RPfUnLq4ELSgS59AS26l99` | 31 行（29 默认池 + 2 源作者自己加） |
| 源吃饭记录 | `hxinlq6S5u6UPnjLAHbP3E` | 22 行源作者个人记录 |

本账号个人空间：`GIbaXrzL2yyx5QhfaqSJsL`。

---

## 架构决策

- **决策**：走 clone-flow 的 Branch B（数据页复制），而非 Branch A（纯 HTML）或从零新建。
  - 原因：本地扫描源 HTML 的 Tier 1 命中两个 `databaseId` 字面量，Tier 2 命中
    `__SMART_PAGE__ / .query / .addRecord / .deleteRecord` —— 双证据链表明这是数据页。
  - 影响：必须「先建表 → 重映射 ID → 再导入页面」，顺序反了页面就会读空表。
- **决策**：`吃饭记录` 只复制表结构，建成 0 行空表。
  - 原因：源表是源作者本人的 2026-09/10 真实用餐记录，属个人业务数据；跨账号复制无必要且有隐私风险。
    复制链路的默认规则即「结构复制、数据不复制」。
  - 影响：新页面首次打开记录页为空，抽一次卡才有数据。交付时须主动说明，否则用户会误判为"坏了"。
- **决策**：`菜品池` 只保留 29 条 `来源=默认池`，剔除源作者自己加的 2 条（茶叶蛋、鲍鱼）。
  - 原因：用户规格明确写了「内置 29 道演示菜品」；用户显式指令优先于"等价复制"的默认语义。
  - 影响：`来源=自己加` 的那 2 条属源作者个人偏好，剔除后不影响抽卡逻辑（页面本身支持用户自己再加）。
- **决策**：页面保持草稿态，不调用 `publish_page`。
  - 原因：复制链路的硬性规定——未获用户明确"发布上线"指令时不得发布。
  - 影响：当前只给编辑态链接；需要对外分享时须单独走发布流程（需空间管理员权限）。

---

## 踩坑记录

- **`page_database_relation.py --action list` 对他人页面返回 `12607 permission denied`**，
  但 `space.workspace.node-info` 对同一批表**能正常返回 title**。
  - 根因：页面↔数据表的**关系记录**受页面所有权保护，而表节点本身的读权限是另一套（按分享设置）。
  - 解决：不要因为关系查询被拒就判定"数据不可迁移"。关系未知时，直接从 HTML 里 grep `databaseId`
    拿 `db_old_set`，这才是 clone-flow 的正规取证路径。
- **判断是不是数据页不能只看一处**：源 HTML 里 `databaseId` 字面量每个只出现 **1 次**
  （集中在配置区），其余全靠 `__SMART_PAGE__` 运行时注入。只看字面量会低估依赖数量。
  - 做法：Tier 1 + Tier 2 两轮 grep **都必须带 `-a`**，否则含特殊字节的 HTML 会被 grep 当二进制跳过，
    直接漏判成 Branch A，结果就是导入一个读不到数据的空壳页面。
- **`get_database_content.py` 的输出是 JSON 包了一层**：形如
  `{"database_id":...,"content":"<原始 CSV>"}`。必须取 `content` 字段再写盘，
  整包重定向会把 JSON 当 CSV 传上去，表头错位、数据全废。
- **页面标题有两个**：页面节点 title 是「吃了吗您 · 干饭盲盒工作台」，
  而 HTML 内部 `<title>` 是「吃了吗您 · 干饭盲盒 v6」。`--file-name` 用**节点 title**，
  保证资料库里"同款同名"。

---

## 用户纠正 / 偏好

- 用户明确要求：「优先走一键做同款的链路；若没有能力，则按以下方式搭建」——
  即用户同时给了主链路和兜底规格。本次主链路可用，因此**未启用兜底规格**，
  也未在过程中回头追问（规格已在手，追问是多余的）。
- 用户对数据的要求集中在「在线存储 + 双向同步」，交付物形态为**资料库在线工作台**，不是本地 HTML 文件。

---

## 外部资源

- 源发布态产物：https://static.workbuddy.cn/community/creation/cnb-chilema-nin-workbench/artifact/output.html
- 资料库技能路径：`E:/WorkSoft/WorkBuddy/resources/app.asar.unpacked/resources/plugins/workbuddy-builtin/skills/library`
- 复制链路规范：`page/clone-flow.md`（§3 依赖探针 / §3.5 兜底闸门 / §5 Branch B）
