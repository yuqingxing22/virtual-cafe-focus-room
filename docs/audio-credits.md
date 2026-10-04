# 音频来源和授权

网站和仓库都是公开的，所以每个音频文件都需要一个允许公开网站使用的来源。这张表记录线上实际播放的每个文件从哪里来、是什么许可。

2026-10-04 更新：原来有 5 条环境音是从 YouTube 视频里抓的，没有授权，已经全部换成 Freesound 和 Pixabay 上有明确许可的录音，并且加了早晨、白天、夜晚三个时间档。现在线上的 28 个文件都可以公开使用，而且都不要求署名。隐私页末尾仍然列了作者表示感谢。

## 怎么核对的

- macOS 会把下载网址存在文件属性里：`mdls -name kMDItemWhereFroms <文件>`。
- Freesound 的许可在每个声音的页面上，地址是 `https://freesound.org/s/<编号>/`。2026-10-04 逐个打开核对过。
- 原始下载文件在本机的 `freesound/` 和 `pixabay/` 文件夹（不进 git），每个文件夹里有 `SOURCES.md` 记着作者和原始文件名。没用上的候选在各自的 `archive/` 里。
- 线上文件由 `python3 scripts/process-ambience.py` 从原始文件生成：裁掉首尾、按固定增益把响度调到和被替换的录音一致、把开头几秒叠进结尾做无缝循环、编码成 128 kbps MP3。具体的裁剪点和增益写在脚本里。

## 环境音（按时间档）

| 线上文件 | 用在 | 原始录音 | 作者 | 来源 | 许可 |
| --- | --- | --- | --- | --- | --- |
| `cafe-morning.mp3` | 咖啡厅交谈，早晨 | Coffee Shop Sounds 2，从第 4 秒起 | buzzatsea | [Freesound 562863](https://freesound.org/s/562863/) | CC0 |
| `cafe-day.mp3` | 咖啡厅交谈，白天 | Cafe ambience in Seoul，去掉开头 8 秒和结尾 30 秒 | naotokui | [Freesound 770433](https://freesound.org/s/770433/) | CC0 |
| `cafe-night.mp3` | 咖啡厅交谈，夜晚 | Cafe Ambience | bittermelonheart | [Freesound 732984](https://freesound.org/s/732984/) | CC0 |
| `rain-day.mp3` | 雨，白天 | Under Tree In Rain | causative | [Freesound 102674](https://freesound.org/s/102674/) | CC0 |
| `rain-light.mp3` | 雨，早晨和夜晚 | Relaxing rain，取 1:11 到 11:40 | dragon-studio | Pixabay 444802 | Pixabay Content License |
| `street-day.mp3` | 街道，白天 | Busy street ambience | aatreya_v | Pixabay 195884 | Pixabay Content License |
| `street-light.mp3` | 街道，早晨和夜晚 | 3*morning - 21.01.2024，取前 20 分钟 | twiciasty | [Freesound 720042](https://freesound.org/s/720042/) | CC0 |
| `birds-morning.mp3` | 鸟叫，只在早晨 | A beautiful morning concert by birds，取前 45 分钟 | danfloyd | [Freesound 839784](https://freesound.org/s/839784/) | CC0 |
| `typing-keys.mp3` | 键盘，三档共用 | Typing.wav | Dustin_Davis | [Freesound 399603](https://freesound.org/s/399603/) | CC0 |

## 其他循环音

| 线上文件 | 内容 | 作者 | 来源 | 许可 |
| --- | --- | --- | --- | --- |
| `coffee-stir.mp3` | 杯子和搅拌声 | strachszydlo | Pixabay 468336 | Pixabay Content License |
| `back-counter-coffee.mp3` | 后厨做咖啡 | Great Sounds | [YouTube 视频](https://www.youtube.com/watch?v=BUoUxAT-lrs)，简介里声明 CC0 | CC0 |

`back-counter-coffee.mp3` 的许可依据是视频简介原文：“All sounds are recorded by myself and available to download and use for free as you wish with creative commons 0 license”。

## 提示音（一次性）

全部来自 Pixabay，适用 Pixabay Content License。

| 线上文件 | 内容 | 作者 | Pixabay 编号 |
| --- | --- | --- | --- |
| `steps-to-cafe.mp3` | 木地板上的脚步 | freesound_community | 32056 |
| `door-open.mp3` | 木门打开 | freesound_community | 102413 |
| `door-bell.mp3` | 门铃 | daviddumaisaudio | 188054 |
| `espresso.mp3` | 意式咖啡机 | freesound_community | 78082 |
| `drip-coffee.mp3` | 手冲滴滤 | freesound_community | 33785 |
| `cup-set-down.mp3` | 杯子放到桌上 | freesound_community | 106992 |

## 爵士歌单

全部来自 Pixabay，适用 Pixabay Content License。

| 线上文件 | Pixabay 上的曲名 | 作者 | Pixabay 编号 |
| --- | --- | --- | --- |
| `jazz/cafe/01-jazz-cafe.mp3` | Jazz Cafe | waveloom | 516774 |
| `jazz/cafe/02-jazz-elegant.mp3` | No Copyright Jazz Elegant | waveloom | 525518 |
| `jazz/cafe/03-jazz-4.mp3` | Jazz | atlasaudio | 519632 |
| `jazz/swing/01-jazz-cafe-2.mp3` | Jazz Cafe | the_mountain | 496552 |
| `jazz/swing/02-jazz-music-3.mp3` | Jazz Jazz Music | tatamusic | 485401 |
| `jazz/swing/03-jazz.mp3` | Jazz | atlasaudio | 490623 |
| `jazz/swing/04-jazz-2.mp3` | Jazz Jazz Music | freemusicforvideo | 495626 |
| `jazz/swing/05-jazz-music-2.mp3` | Jazz Jazz Music | starostin | 515630 |
| `jazz/club/01-jazz-club.mp3` | The Best Jazz Club in New Orleans | paoloargento | 164472 |
| `jazz/club/02-west-coast-jazz.mp3` | Jazz Cafe Music | tunetank | 348267 |
| `jazz/club/03-jazz-4.mp3` | Jazz（和 `jazz/cafe/03-jazz-4.mp3` 是同一个文件） | atlasaudio | 519632 |

## 许可的要点

- **CC0**：公共领域，可以自由使用、修改，不需要署名。
- **Pixabay Content License**：可以免费用于商业和非商业用途，不要求署名。不能把文件原样单独转售或当成素材库再分发；作为网站体验的一部分播放没有问题。
- 以后如果用到 **CC BY** 的录音（例如备选里 klankbeeld 的几条），必须在网站上署名：作者、作品名、来源链接、许可名称，加在 `public/privacy.html` 的声音致谢里。**CC BY-SA** 还要求处理后的文件用同样的许可公开，尽量不用。

## 已经撤下的文件（2026-10-04）

这 5 个文件是用下载工具从标准许可的 YouTube 视频里抓的，没有再使用的授权，已从 R2 删除，代码不再引用：`cafe-ambience.mp3`、`rain.mp3`、`typing.mp3`、`light-traffic.m4a`、`heavy-traffic.m4a`。来源视频分别属于 Leontube、輕音樂 放鬆 Soothing Relaxation、HANBINI STUDYLOG、Midnight ASMR、Walking Around Taiwan。

这些文件在 2026-10-03 之前的 git 历史里仍然存在（2026-10-03 起 `public/audio/` 已不进 git）。要彻底清除需要重写仓库历史，见 `docs/progress.md`。

## 图片

场景图和角色设定图由用户用即梦生成，规范见 `docs/visual-asset-guidelines.md`。公开使用前确认即梦对生成图的公开展示和商用条款。这一项 Claude 没有核对。

## YouTube 电台

电台是嵌入 YouTube 的官方播放器，内容由各频道在 YouTube 上提供，不由本站托管，适用 YouTube 的条款。这和上面“抓取音频再自己托管”是两回事：嵌入播放器是 YouTube 允许的用法。预设列表在 `src/lib/youtube.js`。
