# Netlify + PostgreSQL 部署指南

本项目是静态站点 + Netlify Functions，不需要自行搭建服务器。以下步骤适合第一次部署的用户。菜单名称可能随 Netlify 更新略有变化。

## 1. 导入并部署

1. 将本仓库推送到自己的 GitHub 账号。在 [Netlify](https://app.netlify.com/) 登录，选择 **Add new project / Import an existing project**，连接 GitHub 并选择仓库。
2. 构建设置会从 `netlify.toml` 自动读取：构建命令 `npm run build`，发布目录 `build/client`，Node 22。点击 **Deploy**，等待部署完成。
3. 打开 `https://你的站点.netlify.app/adam`（`/admin` 也可）。还没有设置数据库时显示「预览模式」，用 **preview123** 可查看和编辑界面。预览修改只在当前页面内存在，刷新即消失，也不会更改首页。此密码是公开的，仅用于看界面，绝不是正式认证。

## 2. 创建数据库并启用正式管理

1. 在站点的 Netlify 控制台找到 **Extensions / Integrations** 中的 **Neon / Netlify DB**，按提示连接或创建 PostgreSQL 数据库，并关联到这个站点。如果当前账户没有该入口，也可以在 Neon 等 PostgreSQL 服务商创建数据库，取得连接字符串。
2. 进入站点的 **Project configuration → Environment variables**（旧界面可能叫 Site configuration）。Netlify DB 集成通常自动添加 `NETLIFY_DATABASE_URL`；如果没有，则手动添加 `DATABASE_URL`，值为服务商提供的完整 PostgreSQL 连接字符串（通常以 `postgresql://` 开头，推荐带 `?sslmode=require`）。不要把密码或连接字符串提交到 GitHub。两者同时存在时优先使用 `NETLIFY_DATABASE_URL`。
3. 同一页面添加 `ADMIN_PASSWORD`（自己设置的强随机密码，不能是 `preview123`）和 `SESSION_SECRET`（至少 32 个随机字符，与密码不同）。确保变量对 **Functions** 和所需部署环境（Production / Deploy Preview 等）可用。可在自己电脑的终端运行 `openssl rand -hex 32` 生成随机值。不要把这些值贴到公开聊天、仓库或截图里。
4. 环境变量改动后重新部署：进入 **Deploys → Trigger deploy → Deploy site**。打开 `/adam`，确认显示「PostgreSQL 已连接」，使用你设置的 `ADMIN_PASSWORD` 登录。首次成功连接时自动建表并导入当前五个真实 GitHub 项目作为初始内容；原有图片只是占位图，可在后台替换。
5. 编辑作品名称、开始日期、技术栈和图片链接，然后点击「保存更改」。刷新首页，作品从数据库读取。图片应使用可公开访问的 `https://` 链接或本站 `/images/...` 路径；本后台不提供文件上传。删除和新增也需点击保存。中英文当前共用后台编辑的名称与技术栈。

**安全与模式切换：** 只要设置了任一数据库连接变量，预览密码和预览编辑模式立即禁用；若连接失败、密码未设置或服务异常，页面显示错误，不会退回预览。数据库中的内容（包括空列表）为正式内容，不会混入预览数据。初次导入只执行一次，删除所有作品后不会重新导入。要撤销现有登录会话，请更换 `SESSION_SECRET` 并重新部署；会话最多有效 8 小时。请使用强密码，正式站点建议额外在 Netlify 配置访问限制或速率限制，避免密码暴力猜测。预览密码不能保护未配置数据库的页面。

## 3. 常见问题

- **显示服务不可用**：检查环境变量是否可供 Functions 使用、连接字符串和 SSL 设置是否正确、数据库是否允许外部连接。查看 Netlify **Logs → Functions**。设置了连接字符串但数据库连不上时，不会自动退回公开预览模式。
- **显示数据库已连接但无法登录**：检查 `ADMIN_PASSWORD`、至少 32 字符的 `SESSION_SECRET`，并重新部署。确认不是使用预览密码。
- **首页仍是旧内容**：强制刷新并检查 Functions 日志。API 不可用时首页会显示代码中的初始作品，以保持静态站点可浏览，并非数据库实时状态。
- **备份/迁移**：正式内容在数据库的 `portfolio_works` 表，使用服务商的 PostgreSQL 备份工具；`portfolio_meta` 记录初始导入状态。不要公开数据库备份。
- **本地预览**：`npm install && npm run dev` 可查看静态首页和 `/adam` 界面；单独运行 Vite 不提供数据库 API，后台仅用于界面预览。要测试完整后端，请使用 Netlify CLI 的 `netlify dev`，配置同样的环境变量（本地 `.env` 不提交）。正式登录 cookie 要求 HTTPS，建议在实际 Netlify HTTPS 部署上验证登录和保存。

## 初始作品数据来源

2026-10-29 查询 GitHub 公共 commit 搜索，按 `author:BrainEno`、2026-01-01 至 2026-10-29、每个公开仓库分别计数：lyric-forge-ktv 556、no-wave 541、remix-partfolio 277、ScribeForge 248、win7-book-management 218。开始日期采用 GitHub 仓库创建日期（UTC），不是首次 commit 日期。GitHub 搜索只反映可搜索的公开提交，数量会随时间和索引变化；私有仓库不在此统计。技术栈根据仓库语言及项目代码整理。
