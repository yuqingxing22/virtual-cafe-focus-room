# Virtual Café Focus Room

网站已经公开上线，有真实用户。每个 session 开始前先读 `docs/progress.md`：里面有当前状态、工作约定、改动日志、待办和回滚方法。做完一项就更新它，这是多个 session 之间唯一的交接文件。

`AGENTS.md` 是给所有 AI 助手（包括 ChatGPT）看的同一套规则，改规则时两个文件一起改。分工：Claude 负责运维和功能，ChatGPT 负责设计。ChatGPT 做界面和交互设计时可以改任何代码、样式、文案和页面结构（用户 2026-10-04 说的）；Claude 给它的建议和交接写在 `docs/design-suggestions.md`。

## 开工前

- 先 `git fetch`，再看 `git status` 和 `gh pr list`。可能有别的 session 或 ChatGPT 在同一个仓库工作，不要在有未提交改动的文件上叠加修改，也不要动别人未合并的分支。
- 多个 session 打开的是同一个文件夹，在里面 `git checkout` 或 `git stash` 会把别人的分支和未提交改动一起切走。要改代码就开自己的 worktree：`git worktree add ../virtual_cafe_focus_room-<简称> -b <分支> origin/main`，在那里工作，共用文件夹的分支不要动。worktree 里本地开发需要声音的话，把 `public/audio` 软链接到主文件夹的那份。
- 开工时用 ListAgents 看还有哪些咖啡店 session 在跑，用 SendMessage 告诉它们你的分支和要改的文件；开 PR、合并、改共用的东西（音频、R2、`docs/progress.md`、规则文件）时也通知一声。
- 一次只做 `docs/progress.md` 待办里的一项。

## 工作流程：分支加 PR，不直接推 main

`main` 有分支保护（2026-10-04 起），直接 push 会被拒绝，管理员也一样。

1. 从最新的 `main` 开分支：`ops/...`、`feat/...`、`fix/...`、`design/...`。
2. `npm run build` 通过。
3. `npx vite preview --port 4173` 起本地预览，用浏览器实际走一遍相关流程，不只看代码。
4. commit，push 分支，`gh pr create`。
5. CI 的 `build` 检查通过后 `gh pr merge --squash --delete-branch`。
6. 确认两个部署 workflow 都成功（`Deploy to GitHub Pages` 和 `pages build and deployment`），并检查线上。
7. 在 `docs/progress.md` 的改动日志加一条，待办里更新状态。日志可以放在同一个 PR 里。

## 不要做的事

- 不要自己压缩、裁剪或替换音频文件。用户要的是完整的真实录音。线上的环境音由 `scripts/process-ambience.py` 按用户确认过的方案生成，换素材或改裁剪点要先问用户，并更新 `docs/audio-credits.md`。新素材必须有允许公开网站使用的许可，不能从 YouTube 抓。
- 不要删掉现有的三个爵士歌单。爵士和 YouTube 电台是两条互斥的滑块，不是替代关系。
- 不要改 `to-do.md`，那是用户自己保存的原始评审。
- `public/audio/` 已经不在 git 里（2026-10-03 起），本地开发需要自己放一份，见 `docs/cloudflare-pages-r2.md`。除此之外不要重命名或删除任何已有文件，包括 `public/` 里的 PNG 母版，除非用户同意。
- 不要把 R2 的上传脚本改回 `--force`，wrangler 4 不认识这个参数。
- 不要引入会把用户数据发到服务器的东西，除非用户同意并同步更新 `public/privacy.html`。
- 不要公开用户的个人邮箱；反馈入口是 GitHub Issues。

## 部署和音频

- 线上地址 https://cafe.tempomyplanner.com/ ，GitHub Pages，合并到 `main` 自动部署，约一分半。
- 音频在 Cloudflare R2，域名 https://audio.tempomyplanner.com/ ，流程见 `docs/cloudflare-pages-r2.md`。
- 本地开发 `npm run dev` 直接用 `public/audio/`，不需要 R2。
- 出问题先回滚，方法见 `docs/progress.md` 的「回滚」一节。
