# 音频托管：GitHub Pages 站点 + Cloudflare R2 音频

网站本身继续由 GitHub Pages 托管在 `https://cafe.tempomyplanner.com/`，音频文件单独放在 Cloudflare R2，通过 `https://audio.tempomyplanner.com/` 提供。这样做的原因见下面「为什么分开」。

## 为什么分开

- GitHub Pages 每月 100 GB 的软性流量上限，按现在的录音体积一个用户听一小时约 200 MB，很快会碰到。R2 出站流量免费、无上限，10 GB 以内存储也免费。
- GitHub 单文件硬上限 100 MB，`rain.mp3` 已经 90 MB，以后换更长的录音会推不上去。
- 部署流程不再每次把 250 MB 音频推到 `gh-pages`，改文案也能几秒钟发布。
- R2 上可以给音频设一年的不可变缓存，GitHub Pages 固定只给 10 分钟。

## 一次性设置（在本机完成）

前提：Cloudflare 账号，`tempomyplanner.com` 的 DNS 由 Cloudflare 管理。所有命令在项目根目录运行，`npx wrangler` 会自动下载 wrangler，不需要全局安装。

1. 登录 wrangler，会打开浏览器授权：

   ```bash
   npx wrangler login
   ```

2. 建 bucket：

   ```bash
   npx wrangler r2 bucket create virtual-cafe-focus-room-audio
   ```

3. 上传 `public/audio/` 下全部文件，保持 `audio/...` 的 key 不变。约 250 MB，几分钟：

   ```bash
   npm run upload:audio:r2 -- virtual-cafe-focus-room-audio
   ```

4. 设置 CORS。`<audio>` 标签播放本身不需要，但以后改用 Web Audio 做无缝衔接时需要，现在设好省得回头找：

   ```bash
   npx wrangler r2 bucket cors set virtual-cafe-focus-room-audio --file scripts/r2-cors.json
   ```

5. 绑自定义域名。在 Cloudflare 控制台：R2 → 进入 bucket → Settings → Custom Domains → Connect Domain，填 `audio.tempomyplanner.com`。因为 DNS 就在 Cloudflare，记录会自动创建，等状态变成 Active（通常一两分钟）。不要用 `r2.dev` 那个公开地址，它有限速，只适合测试。

6. 验证。三个文件都应该返回 200，并且带 `accept-ranges: bytes` 和 `cache-control: public, max-age=31536000, immutable`：

   ```bash
   curl -sI https://audio.tempomyplanner.com/audio/rain.mp3 | grep -iE "^(HTTP|accept-ranges|cache-control|content-type)"
   curl -sI https://audio.tempomyplanner.com/audio/cafe-ambience.mp3 | head -1
   curl -sI https://audio.tempomyplanner.com/audio/jazz/cafe/01-jazz-cafe.mp3 | head -1
   ```

7. 发布站点。GitHub 仓库变量 `VITE_AUDIO_BASE_URL` 已经设为 `https://audio.tempomyplanner.com/`（可用 `gh variable list` 确认）。把 `.github/workflows/pages.yml` 的改动推到 `main`，Actions 会用 `npm run build:external-audio` 构建，产物里不再包含 `audio/`。部署完成后打开网站，专注页点「开启环境音」，在浏览器开发者工具的 Network 里确认音频请求指向 `audio.tempomyplanner.com`。

## 日常维护

- **更新或新增音频**：把文件放进 `public/audio/`，重新跑第 3 步的上传命令即可，脚本会覆盖同名对象。因为缓存头是一年不可变，替换已有文件时最好改文件名（比如 `rain-v2.mp3`）并同步改 `src/App.jsx` 里的路径，否则老用户会一直听到旧版本。
- **本地开发**不受影响：没有设置 `VITE_AUDIO_BASE_URL` 时，应用回落到本地 `public/audio/`。
- **构建保护**：`scripts/prune-external-audio.mjs` 在变量缺失时会直接报错，所以如果哪天仓库变量被误删，部署会失败而不是悄悄把 250 MB 音频又推上 GitHub Pages。

## 可选：把音频移出 git

音频现在仍然在 git 里跟踪。搬到 R2 之后可以停止跟踪，仓库 clone 会快很多（历史里的旧文件不会自动消失，需要重写历史才能瘦身，不急可以不做）：

```bash
echo "public/audio/" >> .gitignore
git rm -r --cached public/audio
git commit -m "Stop tracking audio; served from R2"
```

本地文件不会被删除，开发仍然能用。新机器 clone 后要本地开发音频，需要从 R2 或 `sound-effect/` 原始录音重新放一份到 `public/audio/`。

## 排错

- `curl` 返回 404：key 不对。R2 里的对象 key 必须以 `audio/` 开头，和 `public/audio/` 下的相对路径一致。
- `curl` 返回 522 或 530：自定义域名还没 Active，等几分钟再试。
- 网站能开但没声音，Network 里音频请求是 CORS 错误：只有改用 Web Audio 之后才会碰到，检查 `scripts/r2-cors.json` 的 `AllowedOrigins` 是否包含当前站点域名，再跑一次第 4 步。
- Actions 构建失败并提示 `VITE_AUDIO_BASE_URL is required`：仓库变量丢了，`gh variable set VITE_AUDIO_BASE_URL --body "https://audio.tempomyplanner.com/"` 重新设置。
