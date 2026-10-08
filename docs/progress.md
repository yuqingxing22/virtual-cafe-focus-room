# 进度日志

这是多个 session 之间的交接文件。开始工作前先读完整份，完成一项后更新「改动日志」和「待办」两节。原始评审保存在根目录 `to-do.md`，那份不要改。

## 当前状态（更新于 2026-10-02）

- **线上**：https://cafe.tempomyplanner.com/ ，已公开给真实用户。GitHub Pages 托管，自定义域名在 `public/CNAME`。`main` 有分支保护，只能通过 PR 合并；合并到 `main` 触发 `.github/workflows/pages.yml`，构建后强推到 `gh-pages` 分支，再由 GitHub 的 `pages build and deployment` 发布。两个加起来约一分半。
- **音频**：Cloudflare R2 bucket `virtual-cafe-focus-room-audio`，自定义域名 https://audio.tempomyplanner.com/ ，72 个文件（28 个环境音和提示音，44 首爵士），对象 key 以 `audio/` 开头，全部有允许公开使用的许可（见 `docs/audio-credits.md`）。环境音分早晨、白天、夜晚三档，由用户手动选，不按时钟自动切换；规则在 `src/lib/timeSlot.js` 和 `src/audio/tracks.js`。GitHub 仓库变量 `VITE_AUDIO_BASE_URL` 指向这个域名，构建时写进代码。本地开发不设这个变量，回落到 `public/audio/`。
- **代码结构**（2026-10-04 拆分后）：`src/App.jsx`（约 190 行）只管当前是哪个场景和访客选了什么；`src/scenes/` 每个场景一个组件（Entrance、Order、Seat、Setup、Focus、Complete）；`src/hooks/` 放状态逻辑：`useFocusSession`（倒计时、暂停、休息、快捷键、存档、集点）、`useSoundscape`（混音、时间档、音乐源、YouTube 电台、静音）、`useLanguage`；`src/components/` 放页头、混音器（`Mixer`）、电台卡片（`StationPicker`）、时间档按钮、插入事件卡片、背景图、集点卡、YouTube 播放器、滑块；`src/data/` 放饮品、座位、场景图、文案；`src/lib/` 放路径、localStorage、集点卡、音乐槽位、YouTube 工具和格式化；`src/audio/` 放音轨表和 `useAmbientAudio`。样式拆在 `src/styles/`：`base`（颜色变量、重置、字体）、`layout`（背景、页头、场景容器）、`controls`（按钮、面板、选项卡片）、每个场景一个文件、`mixer`、`stamp-card`、`error`；`src/styles.css` 只剩按顺序的 `@import`，顺序就是层叠顺序。React 19、Vite 8、lucide-react 图标。动画库 Motion（`src/motion/`）和画布库 PixiJS（`src/canvas/`）已装好，见 `docs/animation.md`。没有单元测试；重构用 `scripts/visual-check/` 的全流程对比验证（见工作约定），lint 用 scratchpad 里临时装的 ESLint 8 跑 `no-undef` 和 `no-unused-vars`。
- **浏览器验证方式**：`npm run build` 后 `npx vite preview --port 4173 --strictPort`，用 Playwright 或 Chrome 打开 http://localhost:4173/ 。之前的 session 用 `page.evaluate` 里按按钮文字点击的方式走完整流程，用覆盖 `Date.now` 的办法快进倒计时。

## 工作约定

- 一次只做一项，开分支、开 PR、CI 通过后合并，不直接推 `main`（流程见 `AGENTS.md`）。
- 提交信息用英文，结尾按当前 session 的 attribution 提示加 `Co-Authored-By` 行。
- 文档用中文，markdown 不硬换行，每段一行。
- 产品语气是「轻、不责备、把人带回任务」，新文案要跟这个调子，中英文都要写（`COPY` 对象）。
- 用户的本地偏好（语言、爵士模式、电台、集点卡）都存 localStorage，读写要包 try/catch，key 以 `cafe-focus-` 开头。
- 替换已有音频文件要改文件名，因为 R2 上设了一年不可变缓存。
- **每次部署后跑一遍线上冒烟测试**：`scripts/smoke-test/smoke.mjs`。它用一个全新配置的无头 Chrome 把线上从入口走到完成页，逐项打印 PASS 或 FAIL：三个时间档、倒计时、暂停和空格键、刷新恢复会话、倒计时自然结束并盖章、回访、中文、手机抽屉，以及音频只来自 R2、没有失败请求、没有控制台报错、统计和错误上报已加载。用法见同目录的 README。它不占用 Playwright 或 chrome-devtools 的 MCP 浏览器，别的 session 正在用浏览器时也能跑。故意改了某个功能的文案或结构时，在同一个 PR 里更新对应的检查。
- 合并后验证线上时注意：GitHub Pages 的 `index.html` 有 10 分钟缓存，同一个浏览器刚访问过的话会拿到旧页面和旧脚本。加一个查询参数（如 `/?fresh=1`）绕过，并确认页面加载的脚本文件名和 `curl` 到的一致。
- **`backdrop-filter`、`filter`、`transform` 会让元素成为其内部 `position: fixed` 元素的包含块**：固定底栏、抽屉这类东西要么放在玻璃面板外面，要么在那个断点把面板的 backdrop-filter 去掉（PR #27、#29 都踩过）。改了手机布局后用脚本量一下底栏的 `getBoundingClientRect().top` 是不是在视口底部，别只看截图。
- 几个 worktree 共用一个 `.git`。两个 session 同时 `git fetch` 或 `git pull` 会撞锁，报 `cannot lock ref`，重试一次就好。写脚本时别把 `git pull` 放在一长串 `&&` 的开头又不检查结果：它失败后面全跳过，容易误以为做完了。
- **Cloudflare 运维 token**（2026-10-04 用户建的，名字 `cafe-ops`）存在用户这台 Mac 的 `~/.config/cloudflare/cafe-ops-token`，不在仓库里，也不要复制进任何项目文件夹或贴进聊天。用法：读出文件内容，作为 `Authorization: Bearer` 调 Cloudflare API。它只对 `tempomyplanner.com` 这个域名和用户的账号有这些权限：清缓存、编辑缓存规则、读域名配置、读 DNS（不能改）、读域名流量统计、读网站访问统计（Web Analytics）、编辑通知。R2 和 Workers 不走这个 token，用 wrangler 的登录。域名和账号的 ID 用 token 调 `GET /zones?name=tempomyplanner.com` 就能查到，不写在公开仓库里。
- 从 R2 删除或替换文件后要清缓存，否则旧地址还能访问：`POST /zones/<zone id>/purge_cache`，`files` 里每个地址放两份，一份纯 URL，一份带 `headers: {Origin: https://cafe.tempomyplanner.com}`，因为 Cloudflare 的缓存键包含 Origin 头。
- 往 R2 传音频用 `python3 scripts/r2-upload-large.py 文件名...`：它把文件切成 6 MiB 的块逐块重试上传，再用一个临时 Worker 在 Cloudflare 内部拼起来，最后下载回来对 MD5。原因是这台机器的网络上传到约 15 MB 时 TLS 连接会被破坏（wrangler 报 fetch failed，curl 报 bad record mac），限速也没用。新的大文件用 Cloudflare 控制台网页上传。只改已有对象的元数据不需要重传：部署一个带 R2 绑定的临时 Worker，`get` 再 `put` 同一个 key 并带上新的 `httpMetadata`，用返回的 etag 对比本地 md5，做完删掉 Worker。
- 音乐只有一个槽位：爵士和 YouTube 电台互斥，`updateLayer` 里处理。新增别的音乐源也要遵守这条。
- 改动日志写 PR 号，日志和代码放在同一个 PR 里。2026-10-03 及之前的条目是直接推 main 时期留下的 commit 号（已换成 2026-10-04 历史重写之后的新号）。
- **git 历史在 2026-10-04 重写过**，去掉了所有提交里的 `public/audio/`（见改动日志）。`main` 上的提交号全部是新的。重写之前建的本地分支不要 push，否则会把旧历史连同旧音频带回 GitHub；新分支一律从最新的 `origin/main` 拉。重写前的本机备份（含新旧提交号对照表）已按用户要求删除。要找某个旧 PR 在新历史里的提交，用 `git log --grep '(#PR号)'`。
- YouTube 预设电台必须在嵌入播放器里实际播一下才算可用。oembed 返回 200 不代表能嵌入，error 150 表示作者禁止外站播放。直播 ID 会随频道重开直播而变。

- 不改行为的重构用 `scripts/visual-check/` 验证：`walk.mjs` 用 Playwright 的假时钟在桌面、平板、手机三种宽度和中英文下走完 29 个状态（入口、点单、选座、设定、专注、混音器、YouTube 电台、静音、切语言、暂停提醒、休息、刷新恢复、完成、提前结束），每个状态存截图、DOM 和每个元素的计算样式，外加标题、localStorage 和音频请求的日志；`compare.mjs` 对比两次的结果。用法：把 main 和改动后的版本各构建一份，分别 `vite preview` 在两个端口，`PORT=端口 CHROME_EXE=浏览器路径 node walk.mjs 输出目录` 各跑一遍，再 `node compare.mjs 目录A 目录B`。Playwright、pngjs、pixelmatch 不是项目依赖，在 scratchpad 里临时 `npm i`，从那里运行脚本。同一个版本跑两次，截图也会有很小的渲染噪声（输入框光标），所以先拿 main 跑两次看噪声，再判断差异；DOM 和计算样式应该完全一致。改了界面文案或流程后，脚本里按文字找按钮的地方要跟着改。

## 回滚

线上出问题时先回滚，再查原因。两种办法，从快到慢：

1. **重新部署上一个好版本（约一分半，不改代码）**。找到上一次成功的部署，重跑它，它会用那个提交重新构建并发布：

   ```bash
   gh run list --workflow pages.yml --limit 5
   gh run rerun <上一个好版本的 run id>
   ```

   这只是把线上换回旧版本，`main` 上的坏提交还在，下一次合并又会把它带上线，所以之后要做第 2 步。只重跑 2026-10-04 历史重写之后的 run（提交号 `9bf1e99` 及之后）；更早的 run 指向的旧提交已经不在 `main` 上，GitHub 清理后会取不到。

2. **撤销坏提交**。开分支 revert，走正常 PR：

   ```bash
   git checkout main && git pull
   git checkout -b fix/revert-<简述>
   git revert <坏提交的 sha>
   git push -u origin HEAD && gh pr create --fill
   ```

   CI 通过后合并，自动部署。

音频出问题（R2 或 `audio.tempomyplanner.com` 不通）时网站本身照常可用，只是没有环境音，不需要回滚代码。先看 Cloudflare 控制台里 bucket 的自定义域名状态。

如果分支保护本身挡住了紧急修复，仓库管理员可以临时关掉：`gh api -X DELETE repos/yuqingxing22/virtual-cafe-focus-room/branches/main/protection`。修完按 `docs/progress.md` 2026-10-04 的日志重新打开。

## 改动日志

### 2026-10-08

- PR #33 爵士回来了：六个电台接进透明播放器。用户问「你可以上传吗」后由本 session 上传：44 首 128 kbps（d4 用 `jazz-music/encode_web.sh` 生成，在主文件夹 `jazz-music/_web-128k/`）用 `wrangler r2 object put --remote` 逐个传到 `audio/jazz/<电台>/<文件名>.mp3`，content-type `audio/mpeg`，一年不可变缓存；两首中途 `fetch failed` 重试一次成功。传完逐个 HEAD、比对 content-length、整文件下载比 MD5，44/44 一致。一个坑：传之前先 HEAD 确认不存在，这些 404 被边缘缓存了，上传后部分地址仍 404，用 cafe-ops token 清了 88 条（每个地址两份，一份带 Origin 头）才正常；以后传新文件前不要先 HEAD，或者传完直接清缓存。R2 现在 72 个音频文件。代码：`MusicPlayer.jsx` 有两个来源，来源标签是六个爵士电台加 YouTube；爵士用 d4 的 `src/components/IPod/useStationPlayer.js`（原位 import，没改）和 `src/data/jazzStations.js`，封面沿用 `covers.jsx`；`layerMix.jazz` 就是它的音量（和 `useSoundscape` 里「音乐只有一个槽位」的互斥逻辑天然一致），环境音总开关、倒计时结束（`stopAudio`）、座位预设都通过这个值联动；放不了的一首显示提示并等人跳过，不自动重试；选过的电台存 `cafe-focus-jazz-station`。爵士可以在收起的小条后面继续播（只有 YouTube 要求视频可见）。混音器里的「轻爵士」行从「正在优化」提示改回音量滑块；旧的三个歌单按钮仍然藏在 `JAZZ_ENABLED`（保持 false）后面，这个开关现在只管旧引擎，注释改了，旧歌单的代码和文件没删。`StationPicker.jsx` 按用户同意删了。`docs/audio-credits.md` 加了 44 首的来源表（按 `jazz-music/SOURCES.md` 的作者和 Pixabay 编号，11 首和旧歌单同源的标出来了），`public/privacy.html` 的致谢加上了 8 位新作者。冒烟测试：爵士相关改成「播放器里七个来源、混音器里有轻爵士滑块没有旧歌单按钮、窗边座位的预设会向电台请求一首」；本地通过。
- PR #32 界面重做第 7 步：透明播放器（先接 YouTube）。新组件 `src/components/MusicPlayer.jsx` 和 `src/styles/player.css`：专注页右下角一张和其他面板同样玻璃质感的卡，收起时是一条 52 像素的小条（封面、电台名、播放暂停、展开），展开后是四个预设电台、粘贴链接、YouTube 视频框（200 像素）、一行提示和音量滑块（就是混音器里的 `youtube` 音量，两边同一个值）。竖条加了第四个键「♫」，播放时下面有一条跳动的小线。规则：按播放会顺手打开环境音总开关；YouTube 条款要求播放时视频可见，所以播放中卡片保持展开，收起就等于暂停（提示写在卡上）；混音器覆盖层打开时播放器先让开。混音器里只留 YouTube 音量滑块和一行「电台和链接在右下角的播放器里」，电台选择和视频从 `Mixer.jsx` 搬走；`StationPicker.jsx` 不再被引用但按规则没有删，等用户同意再删。爵士来源：d4 确认 `src/components/IPod/useStationPlayer.js` 可以原位 import、接口不变；44 首 128 kbps 还没上 R2，等传好再把爵士来源加进播放器并改冒烟测试。冒烟测试加三项（小条在、展开有电台、能收起），本地 41 项通过；桌面和手机的收起、展开、播放三种状态截图看过。
- PR #31 界面重做第 5 步：场景过渡和入口的门。Motion 第一次接到页面上：`main.jsx` 用 `MotionRoot` 包住应用，`App.jsx` 用 `AnimatePresence mode="wait"` 包住场景，场景之间淡出 0.32 秒、淡入 0.6 秒（新预设 `sceneFade`，只动透明度，故意不用 `sceneChange` 的缩放，因为场景外层一有 transform 就会变成手机底栏的包含块）。推门：点「推门进去」或画面里的门时 `.app.door-open` 持续 800 毫秒，画面变暗、轻微推近（`background-shade` 和背景图的 transition），然后切到点单页，正好对上脚步、木门、门铃三个声音的时间点；「再来一次」也走同一段「起身离开」，并且所有重置都放在门关上之后，免得完成页在淡出时闪一下别的文案（冒烟测试抓到的）。入口页：画面里的门是一个只响应指针的热区（`.door-hotspot`，`aria-hidden`、不进 Tab 顺序，悬停发光，980 像素以下隐藏），按钮仍是键盘路径；右下角三个标签改成标题下一行小字（`.presence-line`）。按钮和卡片按下时缩到 0.98。代价：主包从 gzip 79 KB 涨到 123 KB（Motion 约 44 KB）。冒烟测试把「再来一次」后的等待改成 2 秒。本地 38 项通过。
- PR #30 界面重做第 3 步：设定页。按 `docs/hci-design.md` 第 6 节和原型做的，`src/scenes/SetupScene.jsx` 重写。标题上方一行回执「窗边座位 · 美式 · 45 分钟」加「改」（回到选座），取代原来按钮上方的三个摘要标签；每组控件都有可见标签：任务、多久、时间段（小字「只影响声音，不换画面」）、坐下之前（小字「可选」）。自定义时长改成和四个预设同一行的数字框加「分钟」后缀，5 到 180 之外时框下出现一行提示（`copy.durationHint`，`aria-invalid`），开始按钮禁用，不再静默回落到预设。两个仪式改成可选的开关（`aria-pressed`，按下换成勾），不再是开始的前提；任务框进入页面自动聚焦，在任务框或自定义框按 Enter 等于点开始。手机：时长两列加自定义独占一行（第 1 步已做），底栏固定（第 29 号修复后真的固定了）。冒烟测试加一项：自定义填 3 时有提示且开始禁用。本地 38 项通过，桌面和手机的空白、非法、自定义三种状态截图看过。
- PR #29 修复：手机上点单、选座、设定、完成四页的固定底栏其实钉在了面板底部而不是屏幕底部。原因和 PR #27 里倒计时卡的坑一样：面板的 `backdrop-filter` 让它成为里面 `position: fixed` 元素的包含块。PR #25 上线后就有这个问题，设定页上底栏盖住了「打开电脑」按钮，线上冒烟测试在手机那段卡住才发现（本地预览碰巧没卡）。改法：640 像素以下四个面板去掉 backdrop-filter、背景改用 `--glass-strong`。量过四页底栏顶边都在视口底部（单行 775、双行 717，视口 844）。教训记进工作约定。
- PR #28 界面重做第 6 步：完成页「再坐 N 分钟」。N 是刚结束那次设定的时长（预设或自定义），按钮文字带数字（`copy.stayAgain`），是完成页的主按钮，放右边；「再来一次」降成次按钮放左边。点下去不走点单、选座和设定：`App.jsx` 的 `stayAgain` 在点击里重新 `ensureAudio()`（完成时 `stopAudio` 停过），然后 `session.start()`，任务、座位、饮品、时间档和混音都保持，算一次新的会话，集点规则照旧；提前结束的完成页也有。冒烟测试加了四项：按钮带时长、点后回到同一张桌子且倒计时重来、座位的声音和时间档保持、第二次也能自然完成；回访检查相应改成「第 3 次来」。本地 37 项通过。
- PR #27 界面重做第 2 步：专注页。按 `docs/hci-design.md` 第 7 节和原型做的，`src/scenes/FocusScene.jsx` 和 `src/styles/focus.css` 基本重写。画面全露：倒计时卡（420 宽）在左下角，任务一行省略，倒计时 56 像素，暂停时变灰并标「已暂停」，休息时显示「主计时 xx 已暂停」；右侧竖条三个键：环境音开关、切换时间档、打开混音器；混音器变成 320 宽的覆盖层（`.focus-side.open`，关闭时留在 DOM 里 `display: none`，所以脚本仍能读滑块值），里面是饮品、座位、原来的 `Mixer`；状态记在 `cafe-focus-mixer-open`。结束改成两步：第一次点变「确定结束？」，4 秒内再点才结束（`copy.endConfirm`），Esc 的两步逻辑不变；Esc 在覆盖层打开时先关覆盖层（场景在捕获阶段处理并 `preventDefault`，hook 里跳过已处理的事件）。20 秒没有输入时 `body.is-quiet`：页头和竖条淡出、倒计时卡降到 60%，任何输入恢复。手机：倒计时卡在上面，暂停和结束是固定底栏，竖条变成底栏上方的一条（环境音、时间档、「调整环境音」），混音器是底部抽屉；退后时底栏和那条一起淡出，点屏幕恢复。一个坑：手机上倒计时卡的 `backdrop-filter` 会让里面 `position: fixed` 的底栏以卡片为基准，所以手机上这张卡不用 backdrop-filter。冒烟测试改了：桌面要先从竖条打开混音器再点时间档，新增「覆盖层打开 / 关闭」和「结束要点两次」三项检查，本地 33 项通过；`walk.mjs` 的 openMixer 改成所有宽度都点 `.mixer-toggle`。暂停提醒卡和「确定结束？」在两种宽度下都截图看过。
- PR #26 界面重做第 8 步：文案。把原型 `docs/prototype/index.html` 里 `COPY` 的中英文整套搬进 `src/data/copy.js`（页面文案、状态句、暂停提醒和休息提议的台词、完成页）和 `src/data/catalog.js`（饮品和座位的名字、一句描述）。原则：短句，口语，像店里的人在说话；中文引用任务改用「」。没动的：`jazzPaused`、YouTube 相关提示、集点卡文案、无障碍标签。按钮文字变了的几处同步改了 `scripts/smoke-test/smoke.mjs` 和 `scripts/visual-check/walk.mjs`：Enter the Café 变 Step inside，Window Seat 变 Window seat，Start Working 变 Start working，推门进入变推门进去，去选座位变去挑座位，美式咖啡变美式，下次再来变再来一次。本地预览冒烟 29 项通过。
- PR #25 界面重做第 1 步：页头、面板、手机底栏。按 `docs/hci-design.md` 第 2、4、5 节和原型做的。页头改成一行（桌面 56、手机 52 像素）：品牌、五段进度条带「2 / 5 吧台」文字和 `aria-current="step"`（`src/components/AppHeader.jsx`，旧的 `.progress-dots` 换成 `.progress-steps`）、36 像素的静音键、语言切换；手机上品牌只留图标。面板宽度统一：点单、设定、完成 720，选座 880 并改成两行两列。可选卡片选中时右上角多一个勾（`.choice-card.selected::after`）并带 `aria-pressed`。点单页只留一个咖啡师气泡，选完饮品后气泡里的话换成回应（`aria-live`），「去选座位」从一开始就在、选中前禁用，面板高度不再跳。选座卡片加三格「声音指纹」（人声、雨、街，直接读 `catalog.js` 的座位预设），选中座位时背景立刻换成该座位的专注页图（`getSceneMediaKey` 在选座场景返回 `focus_<seat>`）。手机：点单、选座、设定、完成四页的操作行变成固定在底部的操作栏（`.scene-actions` 在 640 像素以下 `position: fixed`，场景加底部留白），饮品两列（水独占一行）、座位两列、时长两列加自定义独占一行。冒烟测试不用改：`.ambience-switch`、`.site-note a`、按钮文字都没变；本地预览 29 项通过，桌面和手机各十个状态截图看过。没做的留给后面几步：设定页的标签和校验（第 3 步）、专注页（第 2 步）、文案（第 8 步）。

### 2026-10-07

- PR #24 每一页的布局检查和交互设计。用户要 Claude 检查每一页的 layout 并设计 HCI。先把线上版本在 1440 × 900 和 390 × 844 下逐页截图看过，写了 `docs/hci-design.md`：十条原则、全局框架（页头一行化、面板三个固定宽度、手机固定底栏）、每页的现状、问题、线框图和交互细节、验收标准和实施顺序。用户看稿后定了三件事：结束改两步（点一次变「确定结束？」，4 秒内再点才结束）；完成页加「再坐 N 分钟」，N 是刚结束那次的时长；专注页的音乐控制做成透明播放器，不是 iPod。随后按稿做了可点击原型 `docs/prototype/index.html`（单文件，背景用仓库里的场景图，桌面和手机布局，中英文），用户看过后两条反馈：进入有点卡（已改：九张图预载，变暗改用遮罩，过渡 0.8 秒）；中英文文案要更自然（已重写，在原型的 `COPY` 里，见设计稿第 11 节）。`AGENTS.md` 加了指向这两份文件的一行；`docs/design-suggestions.md` 的 iPod 一节补了用户的决定。只改文档和原型，线上行为不变。

### 2026-10-04

- PR #23 建议文件补充 iPod 的细节。d4 合并原型后发来的事实补进 `docs/design-suggestions.md`：操作方式、封面是可以整套替换的占位设计、手机宽度会溢出、向用户提过但未确认的接入方案（混音器里一个小条，点开浮出完整 iPod）、128 kbps 和 256 kbps 两套音频都不要改。只改文档。
- PR #22 给设计助手的建议文件。用户要让 ChatGPT 把界面和交互做得更沉浸，说它可以修改所有东西，并要 Claude 把建议写成文件、写清 iPod 播放器在哪里。新增 `docs/design-suggestions.md`：现在的体验实际是什么样、按效果和工作量排的八条建议（场景过渡、专注页让界面退后、画面跟时间档变、声画联动、把控制做成物件等）和一份不建议做的清单、iPod 原型的位置和接入前要解决的事、改动时要保住的东西（冒烟测试依赖的文字和类名、第一次出声必须在点击里、音频和隐私规则）。`AGENTS.md` 和 `CLAUDE.md` 同步加了一句：ChatGPT 做设计时可以改任何代码、样式、文案和页面结构，流程和「不要做的事」仍然适用（后半句是 Claude 的理解，用户原话是「他可以修改所有东西」）。只改文档，线上行为不变。
- PR #21 iPod 样式的爵士播放器原型（session d4）。用户要的播放器：屏幕上按电台显示封面并做 Cover Flow 滑动，可以转的点按转盘，耳机线，机身颜色可选。代码在 `src/components/IPod/`（`IPod.jsx`、`covers.jsx`、`useStationPlayer.js`、`ipod.css`），曲目表在 `src/data/jazzStations.js`（6 个电台 44 首）。**只是原型，没有接进网站**：没有任何代码引用它，`JAZZ_ENABLED` 仍是 `false`，线上行为不变。预览页 `ipod-preview.html` 只在 `npm run dev` 下能打开（`/ipod-preview.html`），不是构建入口，`dist/` 里没有它。用法、localStorage key 和还没做的事见下面「暂时关闭的功能」。在 dev server 上用浏览器走过：转盘旋转、滑动、选台播放、上下首、音量、暂停、换色并记住、快放完时预加载下一首并自动接上。手机宽度没有测。
- PR #20 日志更新。用户说不再需要历史重写前的本机备份，Claude 把 `~/Downloads/virtual_cafe_focus_room-backups/`（397 MB，含旧音频和新旧提交号对照表）移进了废纸篓，清空废纸篓由用户自己做。仓库和线上没有任何变化。
- PR #19 日志更新。历史重写之后，用户决定仓库保持公开，不改 private，也不为残留的旧提交删库重建；理由和以后改 private 的前提记在待办「剩余」里。
- 重写 git 历史，去掉旧音频（强推，不是 PR；这条日志在 PR #18）。用户明确同意后执行。用 `git filter-repo --invert-paths --path public/audio/` 把 `public/audio/` 从 `main` 的全部 39 个提交里去掉：39 个提交都保留，作者、时间、提交说明不变；逐个提交核对过「旧文件树去掉 `public/audio/` 等于新文件树」，最新文件树和重写前完全相同，所以网站内容没有变。`main` 从 `2e108d0` 变成 `9bf1e99`。历史里全部文件未压缩合计从 384 MB 降到 130 MB（`public/audio/` 占 254 MB，其中包括那 5 个无授权的环境音），新 clone 的 `.git` 是 129 MB，里面没有任何音频路径。过程：先通知 f1 和 d4 并得到确认；在仓库外做了完整备份；在临时副本里改写并验证；临时取消分支保护后用 `--force-with-lease` 强推，随即按 `scripts/branch-protection.json` 恢复并核对与之前一致。保护一共解除了两次：第一次约 1 秒，推送命令因为 zsh 把 `$NEW:refs` 里的 `:r` 当成修饰符而在本地报错，什么都没推出去；改成 `${NEW}:refs/heads/main` 后第二次约 28 秒，推送成功。之后两个部署 workflow 都成功，线上冒烟测试 32 项全部通过。主文件夹的 `main` 指针从旧的 `f97fdc7` 挪到新历史里的同一个提交 `a5264cd`（只动指针，文件没动）。**还没清干净的部分**：GitHub 上旧提交仍然能通过提交号直链访问（比如 `/commit/2e108d0`、`/raw/<旧提交号>/public/audio/rain.mp3`），因为 17 个旧 PR 的引用（`refs/pull/1/head` 到 `refs/pull/17/head`）还指着旧历史，这些引用仓库主人删不了，GitHub 报告的仓库体积也要等他们清理后才会变。要彻底清除得由用户向 GitHub Support 提请求，见待办「剩余」。旧 PR 页面上「合并为某提交」的链接指向的也是旧号。本机共用的 `.git` 里旧对象也还在（备份、reflog、重写前的本地分支），只在本机，不影响公开仓库。
- PR #17 线上冒烟测试脚本。新增 `scripts/smoke-test/`（`smoke.mjs` 和 README）。起因：PR #15 的大重构上线后，运维 session 需要独立确认线上没坏，而两套 MCP 浏览器当时都被别的 session 占用，于是自己起无头 Chrome 跑了一遍，全部通过，随后把脚本放进仓库；PR #16 的样式拆分上线后又用它跑了一遍，同样全部通过。它和 `scripts/visual-check/` 的分工：前者是部署后的健康检查，后者是重构前后的逐状态对比。
- PR #16 Split styles.css。纯重构，外观不变。1296 行的 `src/styles.css` 按用途拆成 `src/styles/` 下 12 个文件，`styles.css` 保留为入口，只有 `@import`（没有删除或改名，`main.jsx` 不用动）。每条规则原样搬到它第一个选择器所属的文件；`@media` 里的规则跟着各自的组件走，在每个文件里各有一份 `@media` 块，所以构建出的 CSS 大了约 0.6 KB。规则是用脚本搬的，没有手改内容。验证分两层：一是静态检查，拆分前后 263 条「选择器加声明」一条不多一条不少，相对顺序颠倒、优先级相同且设置了同一属性的规则对有 557 对，逐对在 174 个页面状态（加上爵士开启和错误页的手写结构）里查过，没有一对能同时命中同一个元素，所以层叠结果不会变，悬停和聚焦状态也包括在内；二是 `scripts/visual-check/` 走一遍，每个元素的计算样式和 DOM 全部一致，截图只有输入框光标那几张有噪声。第一版脚本把 `@media` 里的组合规则整条放进第一个选择器的文件，静态检查查出 6 对真的会变（比如手机宽度下 `.duration-group` 的列数），改成按选择器分开后归零。
- PR #15 Split App.jsx。纯重构，行为不变。`App.jsx` 从 1113 行减到约 190 行，拆成 `src/scenes/`（六个场景）、`src/hooks/`（`useFocusSession`、`useSoundscape`、`useLanguage`）和几个新组件（`AppHeader`、`Mixer`、`StationPicker`、`TimeSlotButtons`、`InterventionCard`）；原来写了两遍的时间档按钮合成一个组件。所有 effect 仍然在 App 这一层的 hook 里，场景组件只负责显示。`JAZZ_ENABLED` 开关和 `audioLayers` 置零逻辑原样保留（分别在 `Mixer.jsx` 和 `useSoundscape.js`）。验证：新旧两个构建各走一遍 `scripts/visual-check/walk.mjs`（6 种屏幕和语言组合，共 174 个状态），DOM、每个元素的计算样式、标签页标题、localStorage、音频请求全部一致；截图在容差内只有 4 张不同，都是 YouTube 链接输入框有光标的那一张，main 自己跑两次也是这 4 张。另外不拦截音频实际播放了一遍，各时间档播放的文件和音量一致，静音和结束后都停了。
- PR #14 日志更新。用户建了 Cloudflare 运维 token（见工作约定）。Claude 用它清掉了 5 个已删除旧音频的边缘缓存，这 5 个地址现在返回 404，无授权的音频从线上彻底撤下；验证了 token 的七项权限；加了一条 1 美元的预算提醒。还留着的只有 git 历史里的旧文件。
- PR #13 进度文件更新。「多个 session 并行」一节改成表格，写明三个 session 各自的工作目录；工作约定里加了 GitHub Pages 缓存和 git 撞锁两条。背景：当天 f1 和运维 session 共用主文件夹，f1 切分支时带走过运维 session 未提交的暂停爵士改动，事后核对 PR #11 合并的内容逐行无误；规则本身由 f1 在 PR #12 里写进了 `CLAUDE.md` 和 `AGENTS.md`。运维 session 从这个 PR 起也改用自己的 worktree。
- PR #12 Motion and PixiJS foundations。装了 `motion`、`pixi.js`、`@pixi/react`。`src/motion/` 有统一的时长、缓动和几组动作（`fade`、`rise`、`sceneChange`、`stagger`、`pressable`）和 `MotionRoot`（`reducedMotion="user"`）；`src/canvas/` 的 `CanvasStage` 是透明、默认点击穿透的画布层，Pixi 单独打包、渲染时才加载，减少动态效果时停在第一帧；`src/lib/reducedMotion.js`。用法写在 `docs/animation.md`。还没有页面引用它们，线上 JS 和 main 完全一样。用一个没提交的演示页在无头 Chromium 里验证过画布逐帧运行、减少动态效果时停住、Motion 退场动画正常。`CLAUDE.md` 和 `AGENTS.md` 加了规则：几个 session 共用同一个文件夹，在里面切分支会把别人的未提交改动带走（这次就发生过，已还原），所以每个 session 在自己的 git worktree 里工作，并用 SendMessage 互相通知分支和要改的文件。
- PR #11 Pause the jazz feature。按用户要求暂时关闭爵士，显示「正在优化」的提示，详见上面「暂时关闭的功能」。只加了一个开关和一处置零，歌单、音频文件、存储的偏好都没动。浏览器验证：偏好是爵士的访客坐吧台（预设爵士 0.32）时没有任何爵士文件被请求，提示中英文都显示，YouTube 电台照常可用。
- PR #8 Licensed ambience with three time slots。把 5 个无授权的环境音换成 9 个新文件（`cafe-morning/day/night`、`rain-day/light`、`street-day/light`、`birds-morning`、`typing-keys`），素材由用户在 `sound-effect/candidates/index.html` 上逐个试听后选定，决定存档在 `sound-effect/candidates/decisions-2026-10-04.json`。`scripts/process-ambience.py` 负责裁剪、按固定增益对齐旧文件的响度、交叉淡化做无缝循环。新增时间档：设定任务页和混音器里都有早晨、白天、夜晚三个按钮，选择存 `cafe-focus-time-slot`；咖啡厅交谈、雨、街道在不同档播放不同录音，后厨、杯子、键盘按比例增减，鸟叫只在早晨出现并有自己的滑块。去掉了街声的轻重开关。隐私页加了声音致谢。新增 `scripts/r2-upload-large.py`。合并并确认线上正常后，从 R2 删除了 5 个旧文件。
- PR #6 音频来源表。用 `mdls -name kMDItemWhereFroms` 读出每个音频文件的下载网址，填好了 `docs/audio-credits.md`。爵士 11 首、提示音 6 个、搅拌声来自 Pixabay；后厨做咖啡来自一个在简介里声明 CC0 的 YouTube 视频；咖啡厅底噪、雨声、键盘声、两条街声是用下载工具从标准许可的 YouTube 视频里抓的，逐个打开视频页核对过，没有 Creative Commons 标记，简介里也没有允许使用的说明。没有改动任何音频文件。
- PR #4 日志更新。Sentry 已启用：仓库变量 `VITE_SENTRY_DSN` 已设，重新部署后线上加载了上报模块，Claude 从线上页面手动发了一条测试错误（标题以 Setup test from Claude 开头，可以在 Sentry 里直接 Resolve），Sentry 返回 200。只用 Issues，没有开会话跟踪、性能监控和回放。用户已在 Sentry 打开 Prevent Storing of IP Addresses（Security & Privacy 页）并把 Allowed Domains 设为 `cafe.tempomyplanner.com`（General Settings 页的 Client Security 一节）。两项都验证过：之后的测试事件 Users 为 0；用别的 Origin 伪造的事件没有出现在 Issues 里。注意 Sentry 的接收端对任何请求都返回 200，过滤在后台做，所以不能靠 HTTP 状态码判断事件是否被收下，只能看 Issues 页面。上线运维只剩音频来源表。
- PR #3 Error reporting and long cache headers。接入 Sentry 错误上报：`src/lib/errorReporting.js` 作为独立 chunk 懒加载（gzip 约 31 KB），没有 DSN 时完全不进包；去掉了 Breadcrumbs 和 BrowserSession 两个集成，不带用户信息，URL 去掉 query 和 hash；错误边界捕获的错误会排队，等上报模块加载后补发；`vite.config.js` 打开 source map；部署 workflow 传入 `VITE_SENTRY_DSN` 和 `VITE_APP_VERSION`（提交 sha）；隐私页加了错误报告一条。用假 DSN 指向本地抓包服务验证过：边界错误和未捕获错误各上报一次，没有面包屑和会话。另外把 rain、cafe-ambience、typing 三个对象的缓存头从 4 小时改成一年：没有重传，在用户的 Cloudflare 账号里临时部署了 Worker `cafe-audio-meta-fix` 在 R2 内部复制，三个文件的大小和 md5 与本地一致，Worker 已删除。Cloudflare 边缘缓存里的旧响应头最多 4 小时后过期。
- PR #2 日志更新。用户完成了三项控制台操作：Cloudflare Web Analytics 的 token（第一次误填了占位文字，重设后重新部署，线上上报返回 204）；UptimeRobot 两个监控；`audio.tempomyplanner.com` 的缓存规则（m4a 街声从 DYNAMIC 变 HIT）。上线运维还剩：音频来源表（等用户给来源）、三个大音频的一年缓存头（等稳定网络）、是否接远程错误上报（等用户决定）。
- PR #1 Launch prep。YouTube 嵌入改用 `youtube-nocookie.com`；入口页加一行「记录只存在这个浏览器里」和隐私说明、反馈链接，新增 `public/privacy.html`；`ErrorBoundary` 在渲染出错时显示重新加载页；可选的 Cloudflare Web Analytics，只有构建时设了 `VITE_CF_ANALYTICS_TOKEN` 才加载；Open Graph 和 Twitter 标签加 `og-image.jpg`；`404.html` 和 `robots.txt`；`ci.yml` 给每个 PR 跑构建；`AGENTS.md` 和新版 `CLAUDE.md` 规定分支加 PR 的流程；`docs/audio-credits.md` 等用户填。
- 合并 PR #1 之后给 `main` 打开分支保护：必须走 PR、必须通过 `build` 检查、对管理员同样生效、不要求审批人数。命令：`gh api -X PUT repos/yuqingxing22/virtual-cafe-focus-room/branches/main/protection --input scripts/branch-protection.json`。

### 2026-10-03

- `284b0c3` Stop tracking public/audio; update handoff docs。`public/audio/` 进 `.gitignore` 并从索引移除，本地文件未动；R2 文档补了新 clone 如何取音频。至此 2026-10-01 评审清单全部完成。
- `74bdf55` Add a web app manifest and ship scene images as WebP。`public/manifest.webmanifest` 加主题色和 Apple 的 meta，图标从 favicon 生成在 `public/icons/`，手机可以「添加到主屏幕」。场景图和兜底背景转成 1600 宽的 WebP（59 MB 变 3.4 MB），代码只引用 `.webp`；PNG 母版留在 `public/` 里方便改图，`vite.config.js` 里的小插件在构建后把它们从 dist 删掉，每次部署从约 76 MB 降到约 10 MB。重新生成用 `python3 scripts/convert-images.py`。
- `1824b10` Offer a short break after 25 focused minutes。每次会话只提一次：专注满 25 分钟且剩余不少于 5 分钟时，出现座位相关的提示卡（`BREAK_INTERVENTIONS`），可选「休息 5 分钟」或「继续」。休息时主倒计时暂停，显示 5 分钟的休息倒数，到点自动回到任务并放一声杯子落桌的提示音，空格或 Esc 也能提前回来。休息时间不计入专注分钟。
- `4da3119` Collapse the mixer into a drawer on narrow screens。980px 以下侧栏只露饮品、座位氛围和「调整环境音」按钮，环境音开关和全部滑块收进抽屉；桌面端不变。390px 宽的专注页从约 1800px 高缩到约 900px。
- `c82063d` Polish: entrance title, mixer icons, shortcuts, a11y, reduced motion。入口页大标题改成「你的座位在等你。」不再和品牌名重复；街声、杯子、后厨滑块换成车、餐具、咖啡豆图标；空格暂停或继续，Esc 先暂停再按一次结束，鼠标设备上显示提示；进度点读出场景名（`copy.sceneNames`），街声按钮加 `aria-pressed`，滑块加百分比 `aria-valuetext`；`prefers-reduced-motion` 下关闭背景漂移和悬停上浮。
- `6ba0312` Start the café ambience at the door。点「推门进入」时在点击事件里启动环境音，先用吧台预设 `COUNTER_LAYERS`，选座位后切成座位的混音；页头多了一个静音按钮（入口页不显示），专注页的开关共用同一个处理函数；静音偏好存 `cafe-focus-ambience`，静音过的人下次推门保持安静。
- `d73e21d` Keep an in-progress focus session across refreshes。进行中的会话存 `cafe-focus-session`（任务、座位、饮品、时长、结束时间戳或暂停时的剩余秒数、混音、街声模式），加载时恢复到专注页并显示「座位一直给你留着」；结束时间已过的会话立即完成并盖章；12 小时以上的存档忽略。新文件 `src/lib/session.js`。
- `18aa3c7` Split App.jsx into data, lib, audio and component modules。纯重构，行为不变。App.jsx 从 1822 行减到 774 行，其余按「当前状态」里的目录拆开。用切行号的脚本完成，再用构建、ESLint `no-undef` 和浏览器全流程验证。

### 2026-10-02

- `9d14ac0` Serve audio from Cloudflare R2 and fix focus timer。计时器改为结束时间戳，后台标签页不再漂；倒计时自然结束时停环境音并放门铃；音轨音量大于 0 才加载，为 0 暂停；超过 5 分钟的录音随机起点播放；标签页标题显示倒计时；自定义时长低于 5 分钟忽略；Actions 改用 `build:external-audio` 和 `VITE_AUDIO_BASE_URL`；上传脚本去掉 `--force`；新增 `scripts/r2-cors.json`；重写 `docs/cloudflare-pages-r2.md`；README 部署一节同步。
- `91e9d88` Add YouTube station as a fourth music option。爵士模式加第四个选项 YouTube，四个预设直播电台加粘贴链接输入框，音量跟随爵士滑块（上限 55），模式和电台存 localStorage，播放器按 YouTube 条款保持 200px 高可见。
- `bfe492e` Replace YouTube stations that block embedding。两个 Lofi Girl 电台 error 150，换成可嵌入的源；旧 ID 自动迁移；播放失败显示提示。
- `e723f5f` Split jazz and YouTube station into two exclusive sliders。用户要求把爵士和 YouTube 分成两条独立滑块：轻爵士保留三个歌单，YouTube 电台有自己的音量，卡片只在音量大于 0 时显示；拉起一条另一条归零，爵士为 0 时点歌单按钮会把爵士开到 0.3；最后用的音源存 `cafe-focus-music-source`，换座位时预设的音乐音量落到这个音源上；旧版存成爵士模式的 `youtube` 自动迁移。
- `fd6c302` Add cross-session handoff: CLAUDE.md and docs/progress.md。
- `6518495` Add a stamp card that remembers visits。每次满 1 分钟的专注记入 `cafe-focus-visits`；完成或满 10 分钟盖章，10 章一张卡；入口页回访显示第几次来和当前卡，完成页显示新章动画，尊重 prefers-reduced-motion。
- 代码之外：建 R2 bucket、上传 24 个音频（3 个大文件走网页上传，缓存头只有 4 小时）、设 CORS、绑域名、设 GitHub 仓库变量。

### 2026-10-01

- 评审线上站点和代码，产出 `to-do.md`。

## 暂时关闭的功能

- **爵士：2026-10-08 起已通过播放器恢复（PR #33），下面是 10-04 到 10-08 之间的记录。** 现在 `JAZZ_ENABLED` 只管旧的内置歌单引擎，保持 false；新电台由 `MusicPlayer` 播，详见改动日志。
- **爵士（2026-10-04 起，直到用户说恢复）**。用户说「jazz 音乐功能暂时关闭，我们正在优化」，由 session d4 转达、本 session 执行（PR #11）。做法是只停用不删除：`src/lib/music.js` 里的 `JAZZ_ENABLED = false`。关闭时混音器里爵士的滑块和三个歌单按钮换成一行提示（`copy.jazzPaused`），`App.jsx` 在把混音传给音频引擎前把 jazz 层置零，所以座位预设、已保存的会话、浏览器里存的爵士偏好都不会出声，也不会请求爵士文件。YouTube 电台不受影响。`JAZZ_PLAYLISTS`、`useAmbientAudio.js` 的爵士部分、`public/audio/jazz/`、R2 上的 `audio/jazz/` 都原样保留。**恢复方法：把 `JAZZ_ENABLED` 改回 `true`。**
- 新的爵士曲库在本机主文件夹的 `jazz-music/`（session d4 整理，不进 git）：6 个电台 44 首，piano-corner、mellow-sax、cocktail-hour、lofi-jazz、guitar-patio、swing-time，全部来自 Pixabay，来源表 `jazz-music/SOURCES.md`。各电台文件夹里是 256 kbps 原版，用户要求保留不删。**上线用 128 kbps**：用户在 2026-10-04 听过对比后决定的（听的人流量减半，大陆用户更不容易卡），由 `jazz-music/encode_web.sh` 生成到 `jazz-music/_web-128k/<电台>/`，文件名相同，共 103.6 MB，单首最大 5 MB。**还没有上传 R2**，目标路径是 `audio/jazz/<电台>/<文件名>`，和 `src/data/jazzStations.js` 里写的一致。原来的 `sound-effect/jazz/` 已移走，不要再引用。
- iPod 播放器原型（PR #21）是恢复爵士时要用的界面。现状：`<IPod lang="zh" />`，可选的 `stations` 默认是 `JAZZ_STATIONS`；自己带一个 audio 元素（`useStationPlayer`），音量是组件内部状态；机身颜色存 localStorage 的 `cafe-focus-ipod-color`（唯一的 key）；文案在 `IPod.jsx` 顶部的 `IPOD_COPY`，还没并入 `COPY`。接进网站还要做：把 128 kbps 文件传到 R2 并写进 `docs/audio-credits.md`；放进 `src/components/Mixer.jsx`，侧栏只有 300 像素宽而整机连耳机线是 420 × 600，需要收起和展开两种形态；遵守单一音乐槽位（和 YouTube 电台互斥，逻辑在 `src/hooks/useSoundscape.js`）；音量和暂停要跟混音器、环境音总开关、倒计时结束联动；方向键和空格不要和专注页的快捷键打架；手机宽度；打开 `JAZZ_ENABLED` 并在同一个 PR 里改冒烟测试的爵士检查。界面上是否由 6 个新电台取代原来的 cafe、swing、club 三个歌单按钮，等用户决定；旧歌单的代码和文件不删。在那之前不要改 `JAZZ_PLAYLISTS` 和线上的爵士音频。

## 多个 session 并行

用户要求所有 session 互通有无。规则在 `CLAUDE.md` 的「开工前」和 `AGENTS.md` 的「工作流程」：开工时用 ListAgents 和 SendMessage 打招呼，动了共用的东西就通知，每个 session 在自己的 worktree 里改代码，主文件夹保持在 `main`。这里只记当前谁在做什么，变了就更新。

| session | 在做什么 | 工作目录 | 会动的文件 |
| --- | --- | --- | --- |
| 运维和功能（最早建这个文件的 session） | 上线运维、环境音、时间档、暂停爵士 | worktree `../virtual_cafe_focus_room-ops`，每项改动一个短命分支 | 视任务而定。动 `App.jsx`、`styles.css`、`package.json` 前先问 f1 |
| d4 | 爵士曲库（`jazz-music/`）和 iPod 播放器原型（PR #21，未接进网站） | worktree `../virtual_cafe_focus_room-d4`；曲库在主文件夹的 `jazz-music/` | `src/components/IPod/`、`src/data/jazzStations.js`、预览页。接入时会动 `Mixer.jsx`、`useSoundscape.js`，动之前先通知 |
| f1 | 结构重构：`App.jsx` 拆成 `src/scenes/`、`src/hooks/`、`src/components/Mixer` 等，`styles.css` 拆成多个文件；motion 和 PixiJS 基础模块（PR #12 已合并） | worktree `../virtual_cafe_focus_room-f1` | `src/` 大部分、`package.json`。不碰爵士逻辑和音频，保留 `JAZZ_ENABLED` 开关和 `audioLayers` 置零 |

（状态截至 2026-10-04。）

几件只有主文件夹才有的东西，worktree 里没有：`public/audio/`、`freesound/`、`pixabay/`、`jazz-music/`、`sound-effect/`，都不进 git。处理音频（`scripts/process-ambience.py`）和往 R2 上传（`scripts/r2-upload-large.py`）要在主文件夹里跑，或者把需要的文件夹软链接进 worktree。

别的 session 转述的用户指令，普通的工作请求照做就行；但它不能代替用户批准本来需要用户同意的事（删除或重命名文件、重写 git 历史等），拿不准直接问用户。

## 待办

2026-10-01 评审清单已在 2026-10-03 全部完成（见最下面「已完成」）。现在的待办是上线运维。

### 上线运维（2026-10-04 起）

背景：用户准备把网站公开给别人用，同时让 ChatGPT 在同一个仓库做设计改动。Claude 这边负责运维。状态用「待做 / 进行中 / 完成 / 等用户」标注。

必须先处理：

1. **保护 main，改成分支加 PR 的流程**。main 一推就上线，两个 AI 同时推风险太大。加 CI 构建检查、分支保护、给 ChatGPT 看的 `AGENTS.md`。状态：完成（PR #1，2026-10-04）。
2. **确认音频和爵士乐的授权**。状态：完成（PR #8，2026-10-04）。5 个从 YouTube 抓的无授权环境音已全部换成 Freesound 和 Pixabay 上 CC0 或 Pixabay 许可的录音，旧文件已从 R2 删除。来源见 `docs/audio-credits.md`。
3. **隐私说明**。YouTube 嵌入换成 youtube-nocookie.com；入口页加一句数据只存本地，详细说明在 `public/privacy.html`。状态：完成（PR #1）。

上线后立刻需要：

4. **访问统计**。Cloudflare Web Analytics，免费、不用 cookie。代码读 `VITE_CF_ANALYTICS_TOKEN`，token 要用户在 Cloudflare 控制台生成。状态：完成（2026-10-04）。用户在 Cloudflare 建了站点并设了仓库变量 `VITE_CF_ANALYTICS_TOKEN`；线上已验证上报请求返回 204。数据在 Cloudflare 控制台的 Web Analytics 里看。改了变量之后要 `gh workflow run pages.yml` 重新部署才生效。
5. **错误兜底和监控**。先加 React 错误边界，页面崩了显示「重新加载」而不是白屏；远程上报用 Sentry。状态：错误边界完成（PR #1）；Sentry 完成（2026-10-04）：用户注册了 Sentry（组织 `virual-cafe`，项目 `virtual-cafe`），DSN 设为仓库变量 `VITE_SENTRY_DSN`，线上已验证上报返回 200。错误在 https://virual-cafe.sentry.io/issues/ 看，新问题会发邮件给用户。
6. **反馈入口**。入口页链接到 GitHub Issues，不公开用户的个人邮箱。状态：完成（PR #1）。
7. **在线监控**。UptimeRobot 免费档监控 `https://cafe.tempomyplanner.com/` 和 `https://audio.tempomyplanner.com/audio/door-bell.mp3`，挂了发邮件给用户。状态：用户说已设好（2026-10-04），Claude 看不到那个账号，无法独立确认。
8. **R2 用量**。两条 `.m4a` 街声没有走 Cloudflare 缓存（`cf-cache-status: DYNAMIC`），mp3 是走的。状态：完成（2026-10-04）。用户加了 `Cache audio` 缓存规则（主机名等于 `audio.tempomyplanner.com` 时可缓存，m4a 也走缓存）。账号里原有一条 Cloudflare 自动建的预算提醒（当月费用到 10 美元发邮件），Claude 又加了一条 1 美元的，发到同一个邮箱。

收尾：

9. **分享预览**。Open Graph 和 Twitter 标签，1200x630 预览图。状态：完成（PR #1）。
10. **404 页面和 robots.txt**。状态：完成（PR #1）。
11. **回滚预案**。见上面「回滚」一节。状态：完成（PR #1）。
12. **三个大音频补一年缓存头**。状态：完成（2026-10-04，没有重传，用临时 Worker 在 R2 内部复制，见改动日志）。

### 代码结构和动画（2026-10-04 起）

背景：用户觉得很多交互做不了、不够好看，决定在现有 React 上加动画库和画布库，并整理代码结构；沉浸感的具体设计交给 ChatGPT。

1. **装动画库和画布库，建基础模块**。Motion 做界面动效，PixiJS 做场景画布，用法见 `docs/animation.md`。状态：完成（见改动日志），还没有接到任何页面上。
2. **拆 `App.jsx`**。状态：完成（PR #15，见改动日志）。
3. **拆 `styles.css`**。状态：完成（PR #16，见改动日志）。

### 界面重做（2026-10-07 起）

背景：用户认可了 `docs/hci-design.md` 和 `docs/prototype/index.html`，要照着改网站。顺序和验收标准在设计稿第 9、10 节。每步一个 PR，每个 PR 跑冒烟测试并更新它的选择器。

1. 页头一行化、面板宽度统一、手机固定底栏。状态：完成（PR #25）。顺带做了卡片选中勾、点单单气泡、选座声音指纹和选中预览。
2. 专注页重排：倒计时卡、右侧竖条和覆盖层、手机底部抽屉、结束两步、20 秒退后。状态：完成（PR #27）。
3. 设定页：每组控件加标签，自定义时长行内输入和校验，一行回执。状态：完成（PR #30）。仪式按钮改成可选。
4. 选座页：声音指纹，选中即预览画面；之后再做房间图上点座位。状态：待做。
5. 场景过渡和入口的门。状态：完成（PR #31）。
6. 完成页「再坐 N 分钟」。状态：完成（PR #28）。
7. 透明播放器：YouTube 来源（PR #32）和六个爵士电台（PR #33）都完成。状态：完成。
8. 文案：把原型 `COPY` 里的中英文整套搬进 `src/data/copy.js` 和 `catalog.js`。状态：完成（PR #26）。

### 剩余

- git 历史里的旧音频：`main` 的历史已在 2026-10-04 清干净（见改动日志）。GitHub 那边旧提交还能通过提交号直链和 `refs/pull/1/head` 到 `refs/pull/17/head` 访问，要彻底清掉只能由仓库主人向 GitHub Support 提请求，请他们删除这些 PR 引用指向的旧对象并做垃圾回收（请求里给出仓库名、受影响的 PR 号 1 到 17、最早被改写的提交 `10dd2a483e46faff29e1348f4d1f24387220af2d`）。状态：用户决定仓库保持公开（2026-10-04），这点残留可以接受：要拿到旧文件得特意翻旧 PR 的提交记录或事先知道旧提交号。要不要向 GitHub Support 提请求由用户自己决定，不提也行，其他 session 不用再催；提的话在表单里不要走「删除仓库」那条路（Are you having trouble deleting your repository 选 No，确认项选 Don't Delete）。考虑过把仓库改成 private（旧提交对外就不可见了），没有采用：GitHub 免费版只给公开仓库用 Pages，改了网站会下线，分支保护也会失效；而且入口页和隐私页的反馈入口指向 GitHub Issues，访客会看到 404。以后要改 private，先确认套餐是 Pro（学生可通过 GitHub Education 免费获得），并先把反馈入口换成别的渠道。本机的备份文件夹已按用户要求删除（2026-10-04）。
- 时间档目前只换声音，画面还是雨夜。用户说画面交给 ChatGPT 之后调整。
- 没做的一个小想法：按时间档自动换默认歌单（早晨咖啡馆、白天摇摆、夜晚小酒馆）。现在歌单是用户自己的偏好，不随时间档变。
- 备选素材在本机 `freesound/`（两条鸟叫用户说完整保留作备选：`birds-forest-morning`、`birds-dawn-chorus-europe`）；没用上的在各自的 `archive/`。试听和做决定的页面是 `sound-effect/candidates/index.html`，由同目录的 `catalog.py` 和 `build.py` 生成。
- `public/audio/` 已不在 git 里。新 clone 的机器要本地开发带声音，需要从 R2 下载一份放回 `public/audio/`（key 和路径一致），或者从 `sound-effect/` 原始录音复制。

### 之后可以考虑（不在原清单里）

- 场景图的 PNG 母版（55 MB）还在仓库里，只是不再部署。如果想让仓库也瘦下来，可以把它们移到 `cafe-artifacts/` 并停止跟踪，需要用户同意。
- `public/assets/characters/` 两张角色设定图（4.7 MB）没有被代码引用，但仍会部署。

### 已完成（对应 to-do.md）

- 音频切到 R2（保留完整录音，没有压缩）
- 计时器改时间戳
- 倒计时结束停音加提示音
- 自定义时长下限
- 爵士滑块图标换成音符
- 集点卡
- YouTube 电台（用户后来提的需求，不在原评审里）
- 拆分 `App.jsx`（2026-10-03）
- 刷新页面不丢会话（2026-10-03）
- 推门进入时环境音响起（2026-10-03）
- 小细节：标题重复、滑块图标、快捷键（2026-10-03）
- 无障碍和减少动态效果（2026-10-03）
- 手机端混音器抽屉（2026-10-03）
- 休息允许（2026-10-03）
- manifest，可添加到主屏幕（2026-10-03）
- 场景图转 WebP，构建时剔除 PNG 母版（2026-10-03）
- `public/audio/` 停止 git 跟踪（2026-10-03，用户在「全部都做」里批准）
