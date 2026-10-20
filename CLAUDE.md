# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- 不要删掉旧的三个爵士歌单（cafe、swing、club）的代码和文件。它们藏在 `src/lib/music.js` 的 `JAZZ_ENABLED = false` 后面，这个开关只管旧的内置歌单引擎；线上的爵士是播放器（`MusicPlayer.jsx`）里的六个电台。爵士和 YouTube 共用一个音乐槽位，互斥，不是替代关系，这是用户定的。
- 不要改 `to-do.md`，那是用户自己保存的原始评审。
- `public/audio/` 已经不在 git 里（2026-10-03 起），本地开发需要自己放一份，见 `docs/cloudflare-pages-r2.md`。除此之外不要重命名或删除任何已有文件，包括 `public/` 里的 PNG 母版，除非用户同意。
- 不要把 R2 的上传脚本改回 `--force`，wrangler 4 不认识这个参数。
- 不要引入会把用户数据发到服务器的东西，除非用户同意并同步更新 `public/privacy.html`。
- 不要公开用户的个人邮箱；反馈入口是 GitHub Issues。

## 常用命令

- `npm run dev`：本地开发，音频直接读 `public/audio/`，不需要 R2。没有 npm 时用 `./scripts/dev.sh`，它把 Node 22 下到 `.local/` 再起 http://127.0.0.1:5173/ 。
- `npm run build`：CI 唯一的检查。线上用的是 `npm run build:external-audio`：必须带 `VITE_AUDIO_BASE_URL`（缺了故意报错），构建后由 `scripts/prune-external-audio.mjs` 删掉 `dist/audio`。
- `npx vite preview --port 4173 --strictPort`：合并前在浏览器里走一遍。快进倒计时可以覆盖 `Date.now`。
- 没有单元测试，项目里也没有 lint 配置。查未定义和未使用的变量用 scratchpad 里临时装的 ESLint 8（只开 `no-undef`、`no-unused-vars`）。
- 冒烟测试 `scripts/smoke-test/smoke.mjs`：每次部署后对线上跑一遍，也可以 `node smoke.mjs http://localhost:4173/` 跑本地预览。`playwright-core` 不是项目依赖，在 scratchpad 里装，把脚本复制过去运行，见同目录 README。它自己起无头 Chrome，别的 session 占着 MCP 浏览器时也能跑。故意改了文案或结构时，同一个 PR 里改对应检查。
- 不改行为的重构用 `scripts/visual-check/`（`walk.mjs` 在三种宽度、中英文下走 29 个状态，`compare.mjs` 对比两份构建），步骤在 `docs/progress.md` 的工作约定里。
- 场景图：PNG 母版放进 `public/assets/scenes/<场景>/`，跑 `python3 scripts/convert-images.py` 生成 WebP；`vite.config.js` 构建时会把 PNG 从 `dist/` 删掉。

## 架构

- 访问是一条线：entrance → order → seat → setup → focus → complete。`src/App.jsx` 只管当前场景和访客的选择，用 Motion 的 `AnimatePresence` 切场景；各场景界面在 `src/scenes/`。
- 状态逻辑在 `src/hooks/`：`useFocusSession`（倒计时、暂停、休息、快捷键、刷新后恢复、集点）、`useSoundscape`（混音、时间档、音乐源、静音）、`useLanguage`。
- 声音：音轨表 `src/audio/tracks.js`，引擎 `src/audio/useAmbientAudio.js`；座位预设乘以 `src/lib/timeSlot.js` 的时间档系数。爵士电台由 `MusicPlayer.jsx`、`src/components/IPod/useStationPlayer.js`、`src/data/jazzStations.js` 播，它的音量就是 `layerMix.jazz`，和 YouTube 的互斥在 `useSoundscape` 里处理，新增音乐源也要走这个槽位。浏览器要求第一次出声发生在点击里，所以 `ensureAudio()` 在点击处理函数里调用，不要挪进 effect。
- 音频地址都经过 `src/lib/paths.js` 的 `audioPath()`：有 `VITE_AUDIO_BASE_URL` 就指向 R2，否则回落到 `public/`。
- 文案在 `src/data/copy.js`（中英文都要写，语气「轻、不责备、把人带回任务」），饮品、座位、时长在 `src/data/catalog.js`，场景图映射在 `src/data/media.js`。
- 样式：`src/styles.css` 只是按顺序 `@import` `src/styles/` 下的文件，顺序就是层叠顺序，新文件要加进列表；断点 980px、640px 写在各文件末尾。
- `backdrop-filter`、`filter`、`transform` 会让元素成为里面 `position: fixed` 元素的包含块。手机底栏踩过两次（PR #27、#29），场景过渡只动透明度也是这个原因。改了手机布局要量底栏的 `getBoundingClientRect().top`，别只看截图。
- Cloudflare Web Analytics（`VITE_CF_ANALYTICS_TOKEN`）和 Sentry（`VITE_SENTRY_DSN`）只在生产构建且提供了值时由 `src/main.jsx` 加载；`src/lib/errorReporting.js` 去掉了记录访客操作的集成，这是 `public/privacy.html` 的承诺。
- localStorage 的 key 以 `cafe-focus-` 开头，读写走 `src/lib/storage.js`（已包 try/catch）。
- 动画：界面动效用 Motion（`src/motion/`），画面里会动的东西用 PixiJS（`src/canvas/`），见 `docs/animation.md`。

## 部署和运维

细节和来龙去脉在 `docs/progress.md` 的工作约定和改动日志里，这里只列要点。

- 线上地址 https://cafe.tempomyplanner.com/ ，GitHub Pages。合并到 `main` 触发 `.github/workflows/pages.yml`：用仓库变量 `VITE_AUDIO_BASE_URL`、`VITE_CF_ANALYTICS_TOKEN`、`VITE_SENTRY_DSN` 跑 `build:external-audio`，强推到 `gh-pages`，再由 `pages build and deployment` 发布，共约一分半。只改了仓库变量时用 `gh workflow run pages.yml` 重新部署。
- 合并后验证：`index.html` 有 10 分钟缓存，打开 `/?fresh=1` 并确认页面加载的脚本文件名和 `curl` 到的一致，然后跑冒烟测试。
- 音频在 Cloudflare R2 bucket `virtual-cafe-focus-room-audio`，域名 https://audio.tempomyplanner.com/ ，对象 key 以 `audio/` 开头，一年不可变缓存，所以替换音频要换文件名。流程见 `docs/cloudflare-pages-r2.md`。音频源文件（`public/audio/`、`freesound/`、`pixabay/`、`jazz-music/`、`sound-effect/`）只在主文件夹，处理和上传在那里跑。
- 上传：小文件 `npm run upload:audio:r2 -- virtual-cafe-focus-room-audio` 或 `wrangler r2 object put --remote`；超过约 15 MB 用 `python3 scripts/r2-upload-large.py`（这台机器的网络在大文件上传时会断）。上传前不要先 HEAD 新地址，404 会被边缘缓存。
- 从 R2 删除或替换文件后要清 Cloudflare 缓存：`POST /zones/<zone id>/purge_cache`，每个地址放两份，一份纯 URL，一份带 `headers: {Origin: https://cafe.tempomyplanner.com}`。
- Cloudflare 运维 token 在用户本机 `~/.config/cloudflare/cafe-ops-token`，作为 `Authorization: Bearer` 调 API。不要复制进项目文件夹、不要贴进聊天；它能清缓存、改缓存规则、读 DNS 和统计、编辑通知，不能改 DNS。R2 和 Workers 用 wrangler 的登录，不走这个 token。zone id 用 token 调 `GET /zones?name=tempomyplanner.com` 查，不写进公开仓库。
- 监控：错误在 Sentry（https://virual-cafe.sentry.io/issues/ ，新问题发邮件给用户），访问量在 Cloudflare 控制台的 Web Analytics，在线监控是用户自己的 UptimeRobot（Claude 看不到），费用提醒有 1 美元和 10 美元两条。
- 出问题先回滚，方法见 `docs/progress.md` 的「回滚」一节：最快是 `gh run rerun` 上一个好的 `pages.yml` run（只重跑提交 `9bf1e99` 及之后的），再开 PR revert。只有音频挂了时网站照常可用，不需要回滚代码。分支保护挡住紧急修复时可以临时关掉，修完按 `scripts/branch-protection.json` 恢复。
- git 历史在 2026-10-04 重写过（去掉了 `public/audio/`）。重写之前建的本地分支不要 push；新分支一律从最新的 `origin/main` 拉。几个 worktree 同时 `git fetch` 会报 `cannot lock ref`，重试一次就好。
