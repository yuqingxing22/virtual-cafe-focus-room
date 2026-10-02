# 进度日志

这是多个 session 之间的交接文件。开始工作前先读完整份，完成一项后更新「改动日志」和「待办」两节。原始评审保存在根目录 `to-do.md`，那份不要改。

## 当前状态（更新于 2026-10-02）

- **线上**：https://cafe.tempomyplanner.com/ ，GitHub Pages 托管，自定义域名在 `public/CNAME`。推 `main` 触发 `.github/workflows/pages.yml`，构建后强推到 `gh-pages` 分支，再由 GitHub 的 `pages build and deployment` 发布。两个加起来约一分半。
- **音频**：Cloudflare R2 bucket `virtual-cafe-focus-room-audio`，自定义域名 https://audio.tempomyplanner.com/ ，24 个文件全部在线，对象 key 以 `audio/` 开头。GitHub 仓库变量 `VITE_AUDIO_BASE_URL` 指向这个域名，构建时写进代码。本地开发不设这个变量，回落到 `public/audio/`。
- **代码**：几乎全部在 `src/App.jsx`（约 1600 行）和 `src/styles.css`。React 19、Vite 8、lucide-react 图标。没有测试和 lint。
- **浏览器验证方式**：`npm run build` 后 `npx vite preview --port 4173 --strictPort`，用 Playwright 或 Chrome 打开 http://localhost:4173/ 。之前的 session 用 `page.evaluate` 里按按钮文字点击的方式走完整流程，用覆盖 `Date.now` 的办法快进倒计时。

## 工作约定

- 一次只做一项，做完就提交推送，不攒。
- 提交信息用英文，结尾按当前 session 的 attribution 提示加 `Co-Authored-By` 行。
- 文档用中文，markdown 不硬换行，每段一行。
- 产品语气是「轻、不责备、把人带回任务」，新文案要跟这个调子，中英文都要写（`COPY` 对象）。
- 用户的本地偏好（语言、爵士模式、电台、集点卡）都存 localStorage，读写要包 try/catch，key 以 `cafe-focus-` 开头。
- 替换已有音频文件要改文件名，因为 R2 上设了一年不可变缓存。
- 大于 30 MB 的文件用 wrangler 命令行传 R2 会在几秒内断线，改用 Cloudflare 控制台网页上传。
- YouTube 预设电台必须在嵌入播放器里实际播一下才算可用。oembed 返回 200 不代表能嵌入，error 150 表示作者禁止外站播放。直播 ID 会随频道重开直播而变。

## 改动日志

### 2026-10-02

- `1b1ed2b` Serve audio from Cloudflare R2 and fix focus timer。计时器改为结束时间戳，后台标签页不再漂；倒计时自然结束时停环境音并放门铃；音轨音量大于 0 才加载，为 0 暂停；超过 5 分钟的录音随机起点播放；标签页标题显示倒计时；自定义时长低于 5 分钟忽略；Actions 改用 `build:external-audio` 和 `VITE_AUDIO_BASE_URL`；上传脚本去掉 `--force`；新增 `scripts/r2-cors.json`；重写 `docs/cloudflare-pages-r2.md`；README 部署一节同步。
- `6ff422c` Add YouTube station as a fourth music option。爵士模式加第四个选项 YouTube，四个预设直播电台加粘贴链接输入框，音量跟随爵士滑块（上限 55），模式和电台存 localStorage，播放器按 YouTube 条款保持 200px 高可见。
- `3dc3d4a` Replace YouTube stations that block embedding。两个 Lofi Girl 电台 error 150，换成可嵌入的源；旧 ID 自动迁移；播放失败显示提示。
- `05e3d06` Add a stamp card that remembers visits。每次满 1 分钟的专注记入 `cafe-focus-visits`；完成或满 10 分钟盖章，10 章一张卡；入口页回访显示第几次来和当前卡，完成页显示新章动画，尊重 prefers-reduced-motion。
- 代码之外：建 R2 bucket、上传 24 个音频（3 个大文件走网页上传，缓存头只有 4 小时）、设 CORS、绑域名、设 GitHub 仓库变量。

### 2026-10-01

- 评审线上站点和代码，产出 `to-do.md`。

## 待办

按顺序做。「下一步」里的几项都不大，先做完再碰后面大的。

### 下一步

1. **刷新页面不丢会话**。进行中的 focus 会话（结束时间戳、任务、座位、饮品、时长、暂停时的剩余秒数、混音）存 localStorage；加载时如果有未过期的会话，直接恢复到 focus 场景；如果结束时间已过，进完成页并盖章。
2. **推门进入时环境音就响起来**。点「推门进入」已经满足自动播放条件，不必等到专注页再手动开。点单、选座阶段用较低音量的咖啡厅底噪。
3. **手机端专注页收抽屉**。390px 宽下整页 1200 多像素，加了 YouTube 卡片后更长。默认只露计时器、任务名、暂停和结束，混音器放进可展开的抽屉。
4. **休息允许**。专注 25 分钟后的「要不要再加点热水」提示和短休息场景，文案和触发条件见 `docs/interaction-roadmap.md`。

### 之后

5. 小细节：入口页「Virtual Café Focus Room」出现三遍；杯子声和后厨声的滑块图标仍是咖啡杯；空格暂停、Esc 结束快捷键。
6. 无障碍：进度点 aria-label 读出来是原始场景 id；街声强度按钮缺 `aria-pressed`；滑块缺 `aria-valuetext`；`prefers-reduced-motion` 下关掉背景 12 秒缓慢缩放（集点卡动画已处理）。
7. manifest，让手机能「添加到主屏幕」。
8. 场景图转 WebP。每张约 2 MB，dist 共 76 MB，转成 1280 宽 WebP 每张 150 KB 左右。
9. 拆分 `App.jsx`：数据（饮品、座位、文案）、音频 hook、各场景组件、集点卡、YouTube 播放器分文件。

### 需要用户决定

- `public/audio/` 是否停止 git 跟踪。音频已在 R2，停止跟踪后 clone 快很多，本地文件不会删。
- 三个网页上传的大音频（rain、cafe-ambience、typing）缓存头只有 4 小时，网络稳定时用命令行覆盖一次补成一年。

### 已完成（对应 to-do.md）

- 音频切到 R2（保留完整录音，没有压缩）
- 计时器改时间戳
- 倒计时结束停音加提示音
- 自定义时长下限
- 爵士滑块图标换成音符
- 集点卡
- YouTube 电台（用户后来提的需求，不在原评审里）
