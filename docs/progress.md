# 进度日志

这是多个 session 之间的交接文件。开始工作前先读完整份，完成一项后更新「改动日志」和「待办」两节。原始评审保存在根目录 `to-do.md`，那份不要改。

## 当前状态（更新于 2026-10-02）

- **线上**：https://cafe.tempomyplanner.com/ ，已公开给真实用户。GitHub Pages 托管，自定义域名在 `public/CNAME`。`main` 有分支保护，只能通过 PR 合并；合并到 `main` 触发 `.github/workflows/pages.yml`，构建后强推到 `gh-pages` 分支，再由 GitHub 的 `pages build and deployment` 发布。两个加起来约一分半。
- **音频**：Cloudflare R2 bucket `virtual-cafe-focus-room-audio`，自定义域名 https://audio.tempomyplanner.com/ ，24 个文件全部在线，对象 key 以 `audio/` 开头。GitHub 仓库变量 `VITE_AUDIO_BASE_URL` 指向这个域名，构建时写进代码。本地开发不设这个变量，回落到 `public/audio/`。
- **代码结构**（2026-10-03 拆分后）：`src/App.jsx` 只剩状态和五个场景的 JSX（约 770 行）；`src/data/` 放饮品、座位、场景图、文案；`src/lib/` 放路径、localStorage、集点卡、音乐槽位、YouTube 工具和格式化；`src/audio/` 放音轨表和 `useAmbientAudio`；`src/components/` 放背景图、集点卡、YouTube 播放器、滑块。样式仍在 `src/styles.css`。React 19、Vite 8、lucide-react 图标。没有测试；lint 用 scratchpad 里临时装的 ESLint 8 跑 `no-undef` 检查。
- **浏览器验证方式**：`npm run build` 后 `npx vite preview --port 4173 --strictPort`，用 Playwright 或 Chrome 打开 http://localhost:4173/ 。之前的 session 用 `page.evaluate` 里按按钮文字点击的方式走完整流程，用覆盖 `Date.now` 的办法快进倒计时。

## 工作约定

- 一次只做一项，开分支、开 PR、CI 通过后合并，不直接推 `main`（流程见 `AGENTS.md`）。
- 提交信息用英文，结尾按当前 session 的 attribution 提示加 `Co-Authored-By` 行。
- 文档用中文，markdown 不硬换行，每段一行。
- 产品语气是「轻、不责备、把人带回任务」，新文案要跟这个调子，中英文都要写（`COPY` 对象）。
- 用户的本地偏好（语言、爵士模式、电台、集点卡）都存 localStorage，读写要包 try/catch，key 以 `cafe-focus-` 开头。
- 替换已有音频文件要改文件名，因为 R2 上设了一年不可变缓存。
- 这台机器的网络上传到约 15 MB 时 TLS 连接会被破坏（wrangler 报 fetch failed，curl 报 bad record mac），限速也没用。新的大文件用 Cloudflare 控制台网页上传。只改已有对象的元数据不需要重传：部署一个带 R2 绑定的临时 Worker，`get` 再 `put` 同一个 key 并带上新的 `httpMetadata`，用返回的 etag 对比本地 md5，做完删掉 Worker。
- 音乐只有一个槽位：爵士和 YouTube 电台互斥，`updateLayer` 里处理。新增别的音乐源也要遵守这条。
- 改动日志写 PR 号，日志和代码放在同一个 PR 里。2026-10-03 及之前的条目是直接推 main 时期留下的 commit 号。
- YouTube 预设电台必须在嵌入播放器里实际播一下才算可用。oembed 返回 200 不代表能嵌入，error 150 表示作者禁止外站播放。直播 ID 会随频道重开直播而变。

## 回滚

线上出问题时先回滚，再查原因。两种办法，从快到慢：

1. **重新部署上一个好版本（约一分半，不改代码）**。找到上一次成功的部署，重跑它，它会用那个提交重新构建并发布：

   ```bash
   gh run list --workflow pages.yml --limit 5
   gh run rerun <上一个好版本的 run id>
   ```

   这只是把线上换回旧版本，`main` 上的坏提交还在，下一次合并又会把它带上线，所以之后要做第 2 步。

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

### 2026-10-04

- PR #3 Error reporting and long cache headers。接入 Sentry 错误上报：`src/lib/errorReporting.js` 作为独立 chunk 懒加载（gzip 约 31 KB），没有 DSN 时完全不进包；去掉了 Breadcrumbs 和 BrowserSession 两个集成，不带用户信息，URL 去掉 query 和 hash；错误边界捕获的错误会排队，等上报模块加载后补发；`vite.config.js` 打开 source map；部署 workflow 传入 `VITE_SENTRY_DSN` 和 `VITE_APP_VERSION`（提交 sha）；隐私页加了错误报告一条。用假 DSN 指向本地抓包服务验证过：边界错误和未捕获错误各上报一次，没有面包屑和会话。另外把 rain、cafe-ambience、typing 三个对象的缓存头从 4 小时改成一年：没有重传，在用户的 Cloudflare 账号里临时部署了 Worker `cafe-audio-meta-fix` 在 R2 内部复制，三个文件的大小和 md5 与本地一致，Worker 已删除。Cloudflare 边缘缓存里的旧响应头最多 4 小时后过期。
- PR #2 日志更新。用户完成了三项控制台操作：Cloudflare Web Analytics 的 token（第一次误填了占位文字，重设后重新部署，线上上报返回 204）；UptimeRobot 两个监控；`audio.tempomyplanner.com` 的缓存规则（m4a 街声从 DYNAMIC 变 HIT）。上线运维还剩：音频来源表（等用户给来源）、三个大音频的一年缓存头（等稳定网络）、是否接远程错误上报（等用户决定）。
- PR #1 Launch prep。YouTube 嵌入改用 `youtube-nocookie.com`；入口页加一行「记录只存在这个浏览器里」和隐私说明、反馈链接，新增 `public/privacy.html`；`ErrorBoundary` 在渲染出错时显示重新加载页；可选的 Cloudflare Web Analytics，只有构建时设了 `VITE_CF_ANALYTICS_TOKEN` 才加载；Open Graph 和 Twitter 标签加 `og-image.jpg`；`404.html` 和 `robots.txt`；`ci.yml` 给每个 PR 跑构建；`AGENTS.md` 和新版 `CLAUDE.md` 规定分支加 PR 的流程；`docs/audio-credits.md` 等用户填。
- 合并 PR #1 之后给 `main` 打开分支保护：必须走 PR、必须通过 `build` 检查、对管理员同样生效、不要求审批人数。命令：`gh api -X PUT repos/yuqingxing22/virtual-cafe-focus-room/branches/main/protection --input scripts/branch-protection.json`。

### 2026-10-03

- `2f64fa8` Stop tracking public/audio; update handoff docs。`public/audio/` 进 `.gitignore` 并从索引移除，本地文件未动；R2 文档补了新 clone 如何取音频。至此 2026-10-01 评审清单全部完成。
- `776d09b` Add a web app manifest and ship scene images as WebP。`public/manifest.webmanifest` 加主题色和 Apple 的 meta，图标从 favicon 生成在 `public/icons/`，手机可以「添加到主屏幕」。场景图和兜底背景转成 1600 宽的 WebP（59 MB 变 3.4 MB），代码只引用 `.webp`；PNG 母版留在 `public/` 里方便改图，`vite.config.js` 里的小插件在构建后把它们从 dist 删掉，每次部署从约 76 MB 降到约 10 MB。重新生成用 `python3 scripts/convert-images.py`。
- `8521953` Offer a short break after 25 focused minutes。每次会话只提一次：专注满 25 分钟且剩余不少于 5 分钟时，出现座位相关的提示卡（`BREAK_INTERVENTIONS`），可选「休息 5 分钟」或「继续」。休息时主倒计时暂停，显示 5 分钟的休息倒数，到点自动回到任务并放一声杯子落桌的提示音，空格或 Esc 也能提前回来。休息时间不计入专注分钟。
- `eb86669` Collapse the mixer into a drawer on narrow screens。980px 以下侧栏只露饮品、座位氛围和「调整环境音」按钮，环境音开关和全部滑块收进抽屉；桌面端不变。390px 宽的专注页从约 1800px 高缩到约 900px。
- `9344d28` Polish: entrance title, mixer icons, shortcuts, a11y, reduced motion。入口页大标题改成「你的座位在等你。」不再和品牌名重复；街声、杯子、后厨滑块换成车、餐具、咖啡豆图标；空格暂停或继续，Esc 先暂停再按一次结束，鼠标设备上显示提示；进度点读出场景名（`copy.sceneNames`），街声按钮加 `aria-pressed`，滑块加百分比 `aria-valuetext`；`prefers-reduced-motion` 下关闭背景漂移和悬停上浮。
- `8f7ffae` Start the café ambience at the door。点「推门进入」时在点击事件里启动环境音，先用吧台预设 `COUNTER_LAYERS`，选座位后切成座位的混音；页头多了一个静音按钮（入口页不显示），专注页的开关共用同一个处理函数；静音偏好存 `cafe-focus-ambience`，静音过的人下次推门保持安静。
- `69361a0` Keep an in-progress focus session across refreshes。进行中的会话存 `cafe-focus-session`（任务、座位、饮品、时长、结束时间戳或暂停时的剩余秒数、混音、街声模式），加载时恢复到专注页并显示「座位一直给你留着」；结束时间已过的会话立即完成并盖章；12 小时以上的存档忽略。新文件 `src/lib/session.js`。
- `26a7add` Split App.jsx into data, lib, audio and component modules。纯重构，行为不变。App.jsx 从 1822 行减到 774 行，其余按「当前状态」里的目录拆开。用切行号的脚本完成，再用构建、ESLint `no-undef` 和浏览器全流程验证。

### 2026-10-02

- `1b1ed2b` Serve audio from Cloudflare R2 and fix focus timer。计时器改为结束时间戳，后台标签页不再漂；倒计时自然结束时停环境音并放门铃；音轨音量大于 0 才加载，为 0 暂停；超过 5 分钟的录音随机起点播放；标签页标题显示倒计时；自定义时长低于 5 分钟忽略；Actions 改用 `build:external-audio` 和 `VITE_AUDIO_BASE_URL`；上传脚本去掉 `--force`；新增 `scripts/r2-cors.json`；重写 `docs/cloudflare-pages-r2.md`；README 部署一节同步。
- `6ff422c` Add YouTube station as a fourth music option。爵士模式加第四个选项 YouTube，四个预设直播电台加粘贴链接输入框，音量跟随爵士滑块（上限 55），模式和电台存 localStorage，播放器按 YouTube 条款保持 200px 高可见。
- `3dc3d4a` Replace YouTube stations that block embedding。两个 Lofi Girl 电台 error 150，换成可嵌入的源；旧 ID 自动迁移；播放失败显示提示。
- `dd541df` Split jazz and YouTube station into two exclusive sliders。用户要求把爵士和 YouTube 分成两条独立滑块：轻爵士保留三个歌单，YouTube 电台有自己的音量，卡片只在音量大于 0 时显示；拉起一条另一条归零，爵士为 0 时点歌单按钮会把爵士开到 0.3；最后用的音源存 `cafe-focus-music-source`，换座位时预设的音乐音量落到这个音源上；旧版存成爵士模式的 `youtube` 自动迁移。
- `27b5da3` Add cross-session handoff: CLAUDE.md and docs/progress.md。
- `05e3d06` Add a stamp card that remembers visits。每次满 1 分钟的专注记入 `cafe-focus-visits`；完成或满 10 分钟盖章，10 章一张卡；入口页回访显示第几次来和当前卡，完成页显示新章动画，尊重 prefers-reduced-motion。
- 代码之外：建 R2 bucket、上传 24 个音频（3 个大文件走网页上传，缓存头只有 4 小时）、设 CORS、绑域名、设 GitHub 仓库变量。

### 2026-10-01

- 评审线上站点和代码，产出 `to-do.md`。

## 待办

2026-10-01 评审清单已在 2026-10-03 全部完成（见最下面「已完成」）。现在的待办是上线运维。

### 上线运维（2026-10-04 起）

背景：用户准备把网站公开给别人用，同时让 ChatGPT 在同一个仓库做设计改动。Claude 这边负责运维。状态用「待做 / 进行中 / 完成 / 等用户」标注。

必须先处理：

1. **保护 main，改成分支加 PR 的流程**。main 一推就上线，两个 AI 同时推风险太大。加 CI 构建检查、分支保护、给 ChatGPT 看的 `AGENTS.md`。状态：完成（PR #1，2026-10-04）。
2. **确认音频和爵士乐的授权**。仓库和网站都是公开的，每个音频来源要允许公开网站使用，记在 `docs/audio-credits.md`。Claude 建好表格，来源只有用户能填。状态：等用户。
3. **隐私说明**。YouTube 嵌入换成 youtube-nocookie.com；入口页加一句数据只存本地，详细说明在 `public/privacy.html`。状态：完成（PR #1）。

上线后立刻需要：

4. **访问统计**。Cloudflare Web Analytics，免费、不用 cookie。代码读 `VITE_CF_ANALYTICS_TOKEN`，token 要用户在 Cloudflare 控制台生成。状态：完成（2026-10-04）。用户在 Cloudflare 建了站点并设了仓库变量 `VITE_CF_ANALYTICS_TOKEN`；线上已验证上报请求返回 204。数据在 Cloudflare 控制台的 Web Analytics 里看。改了变量之后要 `gh workflow run pages.yml` 重新部署才生效。
5. **错误兜底和监控**。先加 React 错误边界，页面崩了显示「重新加载」而不是白屏；远程上报用 Sentry。状态：错误边界完成（PR #1）；Sentry 代码完成（PR #3，2026-10-04），只有设了仓库变量 `VITE_SENTRY_DSN` 才加载，等用户注册 Sentry 并提供 DSN。
6. **反馈入口**。入口页链接到 GitHub Issues，不公开用户的个人邮箱。状态：完成（PR #1）。
7. **在线监控**。UptimeRobot 免费档监控 `https://cafe.tempomyplanner.com/` 和 `https://audio.tempomyplanner.com/audio/door-bell.mp3`，挂了发邮件给用户。状态：用户说已设好（2026-10-04），Claude 看不到那个账号，无法独立确认。
8. **R2 用量**。两条 `.m4a` 街声没有走 Cloudflare 缓存（`cf-cache-status: DYNAMIC`），mp3 是走的。状态：缓存规则完成（2026-10-04，用户加了 `Cache audio` 规则，主机名等于 `audio.tempomyplanner.com` 时可缓存；已验证两条 m4a 返回 HIT）。用量通知是可选项，还没设。

收尾：

9. **分享预览**。Open Graph 和 Twitter 标签，1200x630 预览图。状态：完成（PR #1）。
10. **404 页面和 robots.txt**。状态：完成（PR #1）。
11. **回滚预案**。见上面「回滚」一节。状态：完成（PR #1）。
12. **三个大音频补一年缓存头**。状态：完成（2026-10-04，没有重传，用临时 Worker 在 R2 内部复制，见改动日志）。

### 剩余

- 音频来源表 `docs/audio-credits.md` 等用户给来源。
- Sentry 的 DSN 等用户提供，设为仓库变量 `VITE_SENTRY_DSN` 后跑 `gh workflow run pages.yml`。
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
