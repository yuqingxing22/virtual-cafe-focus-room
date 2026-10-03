# 音频来源和授权

网站和仓库都是公开的，所以每个音频文件都需要一个允许公开网站使用的来源。这张表由用户填写：Claude 不知道这些文件是从哪里下载的。填完后在 `docs/progress.md` 的上线运维第 2 项标为完成。

怎么填：「来源」写网站和作者，「许可」写许可名称（例如 Pixabay Content License、CC0、CC BY 4.0、自己录制），「链接」贴原始页面。如果某个文件查不到来源，或者许可不允许公开使用或要求署名而我们没署，在备注里写明，再决定换掉还是补署名。

需要署名的许可（例如 CC BY）还要在网站上露出署名，可以加在 `public/privacy.html` 末尾。

## 环境音（循环播放）

| 文件 | 内容 | 来源 | 许可 | 链接 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `cafe-ambience.mp3` | 咖啡厅人声底噪，约 60 分钟 | | | | |
| `rain.mp3` | 雨声，约 61 分钟 | | | | |
| `typing.mp3` | 键盘声，约 43 分钟 | | | | |
| `coffee-stir.mp3` | 杯子和搅拌声 | | | | |
| `light-traffic.m4a` | 轻街声，2 分钟 | | | | |
| `heavy-traffic.m4a` | 重交通，2 分钟 | | | | |
| `back-counter-coffee.mp3` | 后厨做咖啡，1 分钟 | | | | |

## 提示音（一次性）

| 文件 | 内容 | 来源 | 许可 | 链接 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `steps-to-cafe.mp3` | 走向咖啡店的脚步 | | | | |
| `door-open.mp3` | 木门打开 | | | | |
| `door-bell.mp3` | 门铃 | | | | |
| `espresso.mp3` | 意式咖啡机 | | | | |
| `drip-coffee.mp3` | 手冲滴滤 | | | | |
| `cup-set-down.mp3` | 杯子放到桌上 | | | | |

## 爵士歌单

音乐的授权通常比音效严格，这一组最需要仔细核对。

| 文件 | 来源 | 许可 | 链接 | 备注 |
| --- | --- | --- | --- | --- |
| `jazz/cafe/01-jazz-cafe.mp3` | | | | |
| `jazz/cafe/02-jazz-elegant.mp3` | | | | |
| `jazz/cafe/03-jazz-4.mp3` | | | | |
| `jazz/swing/01-jazz-cafe-2.mp3` | | | | |
| `jazz/swing/02-jazz-music-3.mp3` | | | | |
| `jazz/swing/03-jazz.mp3` | | | | |
| `jazz/swing/04-jazz-2.mp3` | | | | |
| `jazz/swing/05-jazz-music-2.mp3` | | | | |
| `jazz/club/01-jazz-club.mp3` | | | | |
| `jazz/club/02-west-coast-jazz.mp3` | | | | |
| `jazz/club/03-jazz-4.mp3` | | | | |

## 图片

场景图和角色设定图由用户用即梦生成，规范见 `docs/visual-asset-guidelines.md`。公开使用前确认即梦对生成图的商用和公开展示条款。

## YouTube 电台

电台是嵌入 YouTube 的官方播放器，内容由各频道在 YouTube 上提供，不由本站托管，适用 YouTube 的条款。预设列表在 `src/lib/youtube.js`。
