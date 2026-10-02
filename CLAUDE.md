# Virtual Café Focus Room

每个 session 开始前先读 `docs/progress.md`：里面有当前状态、工作约定、改动日志和按顺序排好的待办。做完一项就更新它，这是多个 session 之间唯一的交接文件。

## 开工前

- 先 `git pull`，再看 `git status`。可能有别的 session 在同一个仓库工作，不要在有未提交改动的文件上叠加修改。
- 一次只做 `docs/progress.md` 待办里的一项，做完再领下一项。

## 每一项的完成标准

1. `npm run build` 通过。
2. `npx vite preview --port 4173` 起本地预览，用浏览器实际走一遍相关流程，不只看代码。
3. commit 并 push 到 `main`，确认 GitHub Actions 的两个 workflow 都成功（`Deploy to GitHub Pages` 和 `pages build and deployment`）。
4. 在 `docs/progress.md` 的改动日志加一条，待办里把这项标为完成。

## 不要做的事

- 不要压缩、裁剪或替换音频文件。用户要保留完整的真实录音，哪怕一小时 90 MB。
- 不要删掉现有的三个爵士歌单。YouTube 电台是第四个选项，不是替代品。
- 不要改 `to-do.md`，那是用户自己保存的原始评审。
- 不要在没问用户的情况下停止跟踪或删除 `public/audio/`，也不要重命名或删除任何已有文件。
- 不要把 R2 的上传脚本改回 `--force`，wrangler 4 不认识这个参数。

## 部署和音频

- 线上地址 https://cafe.tempomyplanner.com/ ，GitHub Pages，推 `main` 自动部署，约一分半。
- 音频在 Cloudflare R2，域名 https://audio.tempomyplanner.com/ ，流程见 `docs/cloudflare-pages-r2.md`。
- 本地开发 `npm run dev` 直接用 `public/audio/`，不需要 R2。
