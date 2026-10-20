# Virtual Café Focus Room：给所有 AI 助手的规则

这个网站已经公开上线（https://cafe.tempomyplanner.com/），有真实用户。合并到 `main` 的任何东西会在一分半钟内自动部署。请把 `main` 当成生产环境。

多个助手在同一个仓库工作：Claude 负责运维和功能，ChatGPT 负责设计。ChatGPT 做界面和交互设计时可以改任何代码、样式、文案和页面结构（用户 2026-10-04 说的），下面的流程和「不要做的事」仍然适用。交接文件是 `docs/progress.md`，开工前先读，做完更新。`CLAUDE.md` 里是同一套规则，改规则时两个文件一起改。

## 工作流程：分支加 PR，不直接推 main

`main` 有分支保护，直接 push 会被拒绝。每项改动这样做：

1. 从最新的 `origin/main` 开分支 `<类型>/<简短描述>`，例如 `design/entrance-typography`、`ops/uptime-notes`。共用文件夹里有别的助手时用下面的 worktree 办法，不要在共用文件夹里切分支。
2. 改动，`npm run build` 必须通过。
3. `npx vite preview --port 4173` 起本地预览，在浏览器里实际走一遍相关流程。设计改动要在桌面宽度和 390px 手机宽度各看一遍。
4. commit，`git push -u origin <分支>`，`gh pr create` 开 PR，说明改了什么、怎么验证的。
5. 等 CI 的 `build` 检查通过后 `gh pr merge --squash --delete-branch`。
6. 合并后确认两个部署 workflow 成功（`Deploy to GitHub Pages` 和 `pages build and deployment`），再打开线上地址看一眼。
7. 在 `docs/progress.md` 的改动日志加一条。日志可以放在同一个 PR 里。

一次只做一件事，PR 保持小。不要在别人未合并的分支上叠加修改。

本机上可能有几个助手同时打开同一个文件夹。在里面切分支或 `git stash` 会把别人的未提交改动一起带走，所以每个助手在自己的 worktree 里工作（`git worktree add ../virtual_cafe_focus_room-<简称> -b <分支> origin/main`），不要改共用文件夹当前的分支。

## 不要做的事

- 不要自己压缩、裁剪或替换音频文件。用户要的是完整的真实录音。线上的环境音由 `scripts/process-ambience.py` 按用户确认过的方案生成，换素材或改裁剪点要先问用户，并更新 `docs/audio-credits.md`。新素材必须有允许公开网站使用的许可，不能从 YouTube 抓。
- 不要删掉旧的三个爵士歌单（cafe、swing、club）的代码和文件。它们藏在 `src/lib/music.js` 的 `JAZZ_ENABLED = false` 后面，这个开关只管旧的内置歌单引擎；线上的爵士是播放器（`MusicPlayer.jsx`）里的六个电台。爵士和 YouTube 共用一个音乐槽位，互斥，不是替代关系，这是用户定的。
- 不要改 `to-do.md`，那是用户自己保存的原始评审。
- 不要重命名或删除已有文件（包括 `public/` 里的 PNG 母版），除非用户同意。
- 不要引入会把用户数据发到服务器的东西。访客的设置和记录只存在浏览器本地；发出去的只有不用 cookie 的访问统计（Cloudflare Web Analytics）、不含访客操作的错误报告（Sentry），以及访客自己打开 YouTube 电台时从 youtube-nocookie.com 加载的播放器，`public/privacy.html` 里是这样承诺的。要再加统计、字体 CDN、第三方脚本之前先问用户，并同步更新隐私说明。
- 不要提交任何密钥。Cloudflare 和 GitHub 的凭据都在用户本机，不进仓库。

## 常用命令

- `npm run dev` 本地开发，音频读 `public/audio/`（不在 git 里，本地要自己放一份）。没有 npm 时用 `./scripts/dev.sh`。
- `npm run build` 是 CI 唯一的检查；`npx vite preview --port 4173 --strictPort` 预览构建结果。
- 没有单元测试和 lint 配置。验证靠浏览器走流程，加上 `scripts/smoke-test/smoke.mjs`（部署后对线上跑，也能对本地预览跑，用法见同目录 README）。改了冒烟测试依赖的文案或结构，同一个 PR 里改对应检查。
- 不改外观和行为的重构用 `scripts/visual-check/` 对比前后两份构建，见 `docs/progress.md` 的工作约定。

## 设计改动要知道的

- 每一页的布局和交互规格在 `docs/hci-design.md`，用户认可的可点击原型在 `docs/prototype/index.html`，新的中英文文案在原型的 `COPY` 对象里；改页面照这两份做。
- 开始做设计前先读 `docs/design-suggestions.md`：Claude 写的沉浸感建议、iPod 播放器在哪里，以及改动时要保住的东西（冒烟测试依赖的文字和类名、第一次出声必须在点击里等）。
- 样式在 `src/styles/`，按用途分文件：`base.css`（颜色变量在开头的 `:root`，还有字体）、`layout.css`（背景、页头）、`controls.css`（按钮、面板、选项卡片）、每个场景一个文件（`entrance`、`order`、`seat`、`setup`、`focus`、`complete`）、`mixer.css`、`stamp-card.css`。`src/styles.css` 只是按顺序 `@import` 它们，顺序就是层叠顺序：后面的文件在优先级相同时覆盖前面的，新文件要加进这个列表。响应式规则（980px、640px）写在各自文件末尾的 `@media` 里。文案在 `src/data/copy.js`，中英文都要写。
- 每个场景的页面结构在 `src/scenes/`（入口、点单、选座、设定、专注、完成各一个文件），页头、混音器等在 `src/components/`。状态和计时逻辑在 `src/hooks/`，改外观一般不需要动它。
- 场景背景图在 `public/assets/scenes/<场景>/01-03.webp`，由 PNG 母版用 `python3 scripts/convert-images.py` 生成。换图时放 PNG 再跑脚本，视觉规范见 `docs/visual-asset-guidelines.md`。
- 产品语气是「轻、不责备、把人带回任务」，见 `docs/interaction-roadmap.md`。
- 动画：界面动效用 Motion（`src/motion/`），画面里会动的东西用 PixiJS 画布（`src/canvas/`）。怎么选、怎么用见 `docs/animation.md`。
- 窄屏（980px 以下）专注页的混音器是抽屉；系统设置了「减少动态效果」时不要有位移动画。
- 无障碍属性（`aria-pressed`、`aria-valuetext`、进度点的场景名）是特意加的，改组件时保留。

## 出问题时

回滚方法写在 `docs/progress.md` 的「回滚」一节。线上坏了先回滚，再查原因。部署、R2 音频、Cloudflare 和监控由 Claude 负责，要点在 `CLAUDE.md` 的「部署和运维」一节。
