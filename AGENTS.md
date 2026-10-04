# Virtual Café Focus Room：给所有 AI 助手的规则

这个网站已经公开上线（https://cafe.tempomyplanner.com/），有真实用户。合并到 `main` 的任何东西会在一分半钟内自动部署。请把 `main` 当成生产环境。

多个助手在同一个仓库工作：Claude 负责运维和功能，ChatGPT 负责设计。交接文件是 `docs/progress.md`，开工前先读，做完更新。`CLAUDE.md` 里是同一套规则，改规则时两个文件一起改。

## 工作流程：分支加 PR，不直接推 main

`main` 有分支保护，直接 push 会被拒绝。每项改动这样做：

1. `git checkout main && git pull`，再 `git checkout -b <类型>/<简短描述>`，例如 `design/entrance-typography`、`ops/uptime-notes`。
2. 改动，`npm run build` 必须通过。
3. `npx vite preview --port 4173` 起本地预览，在浏览器里实际走一遍相关流程。设计改动要在桌面宽度和 390px 手机宽度各看一遍。
4. commit，`git push -u origin <分支>`，`gh pr create` 开 PR，说明改了什么、怎么验证的。
5. 等 CI 的 `build` 检查通过后 `gh pr merge --squash --delete-branch`。
6. 合并后确认两个部署 workflow 成功（`Deploy to GitHub Pages` 和 `pages build and deployment`），再打开线上地址看一眼。
7. 在 `docs/progress.md` 的改动日志加一条。日志可以放在同一个 PR 里。

一次只做一件事，PR 保持小。不要在别人未合并的分支上叠加修改。

## 不要做的事

- 不要自己压缩、裁剪或替换音频文件。用户要的是完整的真实录音。线上的环境音由 `scripts/process-ambience.py` 按用户确认过的方案生成，换素材或改裁剪点要先问用户，并更新 `docs/audio-credits.md`。新素材必须有允许公开网站使用的许可，不能从 YouTube 抓。
- 不要删掉三个爵士歌单；爵士和 YouTube 电台是两条互斥的滑块，这是用户定的。
- 不要改 `to-do.md`，那是用户自己保存的原始评审。
- 不要重命名或删除已有文件（包括 `public/` 里的 PNG 母版），除非用户同意。
- 不要引入会把用户数据发到服务器的东西。现在所有数据只存在浏览器本地，`public/privacy.html` 里是这样承诺的。要加统计、字体 CDN、第三方脚本之前先问用户，并同步更新隐私说明。
- 不要提交任何密钥。Cloudflare 和 GitHub 的凭据都在用户本机，不进仓库。

## 设计改动要知道的

- 样式在 `src/styles.css`，颜色变量在文件开头的 `:root`。文案在 `src/data/copy.js`，中英文都要写。
- 场景背景图在 `public/assets/scenes/<场景>/01-03.webp`，由 PNG 母版用 `python3 scripts/convert-images.py` 生成。换图时放 PNG 再跑脚本，视觉规范见 `docs/visual-asset-guidelines.md`。
- 产品语气是「轻、不责备、把人带回任务」，见 `docs/interaction-roadmap.md`。
- 窄屏（980px 以下）专注页的混音器是抽屉；系统设置了「减少动态效果」时不要有位移动画。
- 无障碍属性（`aria-pressed`、`aria-valuetext`、进度点的场景名）是特意加的，改组件时保留。

## 出问题时

回滚方法写在 `docs/progress.md` 的「回滚」一节。线上坏了先回滚，再查原因。
