# 交互原型

`index.html` 是按 `docs/hci-design.md` 做的可点击原型：入口、点单、选座、设定、专注、完成六页，桌面和手机两种布局，中英文可切换。它是单个 HTML 文件，没有依赖，背景图直接读 `public/assets/scenes/` 里的 WebP，所以在本机 clone 里用浏览器打开这个文件就能用；把窗口拉到 640 像素以下就是手机布局。

它不是网站代码，只用来确认布局、交互和文案。实现时照它对：专注页左上角的「演示」菜单可以直接触发休息提议、暂停提醒、刷新恢复、快进和界面退后。音乐播放器没有真的声音，进度是模拟的。

新的中英文文案都在文件里的 `COPY` 对象，实现时搬进 `src/data/copy.js` 和 `src/data/catalog.js`。

线上可看的副本（用户的 Claude 账号里，需要分享才能打开）：https://claude.ai/artifact/JTi4rRuZe6c1gzGJayKcJN
