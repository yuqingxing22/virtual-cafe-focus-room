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

## 爵士歌单（旧的三个歌单，2026-10-08 起界面不再使用）

全部来自 Pixabay，适用 Pixabay Content License。2026-10-08 起混音器不再提供这三个歌单，音乐改由下面的六个电台提供；文件仍在 R2 和代码里（`JAZZ_PLAYLISTS`），按用户的规则没有删。

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

## 爵士电台（2026-10-08 起，播放器用）

专注页播放器里的六个爵士电台，44 首，全部来自 Pixabay，适用 Pixabay Content License。线上是 128 kbps 的版本（用户听过对比后定的），256 kbps 原版在本机 `jazz-music/<电台>/`，整理记录在 `jazz-music/SOURCES.md`。文件名里的 px 号就是 Pixabay 编号；「原文件名」是下载时的名字。有 11 首和上面旧歌单里的录音是同一首，线上是不同的 key，旧文件没有删。

作者（Pixabay 用户名）：alex-morgan、andriih、atlasaudio、aurec、freemusicforvideo、leberch、lnplusmusic、ornave、paoloargento、starostin、tatamusic、the_mountain、tunetank、velariomusic、waveloom、zephiramusic。

| 线上文件 | 原文件名 | 作者 | Pixabay 编号 |
| --- | --- | --- | --- |
| `jazz/piano-corner/jazz-coffee-shop-px556234.mp3` | alex-morgan-jazz-coffee-shop-music-556234.mp3 | alex-morgan | 556234 |
| `jazz/piano-corner/jazz-piano-restaurant-px564275.mp3` | alex-morgan-jazz-piano-restaurant-music-564275.mp3 | alex-morgan | 564275 |
| `jazz/piano-corner/jazz-rainy-night-keys-px567549.mp3` | alex-morgan-saxophone-jazz-rainy-night-567549.mp3 | alex-morgan | 567549 |
| `jazz/piano-corner/jazz-vibes-background-px556245.mp3` | alex-morgan-jazz-corporate-background-music-556245.mp3 | alex-morgan | 556245 |
| `jazz/piano-corner/jazz-piano-px584847.mp3` | aurec-jazz-584847.mp3 | aurec | 584847 |
| `jazz/piano-corner/jazz-bar-piano-px592657.mp3` | aurec-jazz-bar-592657.mp3 | aurec | 592657 |
| `jazz/piano-corner/jazz-waltz-px602643.mp3` | aurec-jazz-waltz-602643.mp3 | aurec | 602643 |
| `jazz/piano-corner/jazz-solo-piano-px578722.mp3` | leberch-jazz-piano-578722.mp3 | leberch | 578722 |
| `jazz/piano-corner/jazz-piano-trio-px611049.mp3` | lnplusmusic-jazz-jazz-music-611049.mp3 | lnplusmusic | 611049 |
| `jazz/piano-corner/jazz-mallets-px519632.mp3` | jazz4 2.mp3 | atlasaudio | 519632（旧歌单里也有） |
| `jazz/mellow-sax/jazz-cafe-morning-px556238.mp3` | alex-morgan-jazz-cafe-morning-music-556238.mp3 | alex-morgan | 556238 |
| `jazz/mellow-sax/jazz-cocktail-lounge-px556246.mp3` | alex-morgan-jazz-cocktail-lounge-music-556246.mp3 | alex-morgan | 556246 |
| `jazz/mellow-sax/jazz-rainy-night-px556239.mp3` | alex-morgan-jazz-rainy-night-music-556239.mp3 | alex-morgan | 556239 |
| `jazz/mellow-sax/jazz-restaurant-px556244.mp3` | alex-morgan-jazz-restaurant-music-556244.mp3 | alex-morgan | 556244 |
| `jazz/mellow-sax/jazz-relaxing-px588904.mp3` | aurec-relaxing-jazz-588904.mp3 | aurec | 588904 |
| `jazz/mellow-sax/jazz-cool-px598432.mp3` | aurec-cool-jazz-598432.mp3 | aurec | 598432 |
| `jazz/mellow-sax/jazz-elegant-px525518.mp3` | jazz-elegant.mp3 | waveloom | 525518（旧歌单里也有） |
| `jazz/mellow-sax/jazz-west-coast-cafe-px348267.mp3` | West Coast Jazz.mp3 | tunetank | 348267（旧歌单里也有） |
| `jazz/cocktail-hour/jazz-cocktail-bar-px556247.mp3` | alex-morgan-jazz-cocktail-bar-music-556247.mp3 | alex-morgan | 556247 |
| `jazz/cocktail-hour/jazz-midnight-club-px563583.mp3` | alex-morgan-jazz-midnight-club-music-563583.mp3 | alex-morgan | 563583 |
| `jazz/cocktail-hour/jazz-rainy-lounge-brass-px556235.mp3` | alex-morgan-jazz-rainy-lounge-music-556235.mp3 | alex-morgan | 556235 |
| `jazz/cocktail-hour/jazz-rainy-night-px563584.mp3` | alex-morgan-jazz-rainy-night-music-563584.mp3 | alex-morgan | 563584 |
| `jazz/cocktail-hour/jazz-restaurant-px563578.mp3` | alex-morgan-jazz-restaurant-music-563578.mp3 | alex-morgan | 563578 |
| `jazz/cocktail-hour/jazz-study-px563581.mp3` | alex-morgan-jazz-study-music-563581.mp3 | alex-morgan | 563581 |
| `jazz/cocktail-hour/jazz-smooth-coffee-shop-px568173.mp3` | alex-morgan-smooth-jazz-coffee-shop-568173.mp3 | alex-morgan | 568173 |
| `jazz/lofi-jazz/jazz-lofi-px587555.mp3` | aurec-jazz-lofi-587555.mp3 | aurec | 587555 |
| `jazz/lofi-jazz/jazz-lofi-px596980.mp3` | velariomusic-lofi-jazz-596980.mp3 | velariomusic | 596980 |
| `jazz/lofi-jazz/jazz-lofi-px582886.mp3` | zephiramusic-lofi-jazz-582886.mp3 | zephiramusic | 582886 |
| `jazz/lofi-jazz/jazz-lounge-beat-px589986.mp3` | atlasaudio-jazz-lounge-589986.mp3 | atlasaudio | 589986 |
| `jazz/lofi-jazz/jazz-smooth-beat-px589997.mp3` | atlasaudio-smooth-jazz-589997.mp3 | atlasaudio | 589997 |
| `jazz/lofi-jazz/jazz-light-tread-px594985.mp3` | ornave-jazz-light-tread-594985.mp3 | ornave | 594985 |
| `jazz/lofi-jazz/jazz-beat-px490623.mp3` | jazz.mp3 | atlasaudio | 490623（旧歌单里也有） |
| `jazz/lofi-jazz/jazz-sunny-cafe-nu-jazz-px587413.mp3` | alex-morgan-jazz-song-sunny-cafe-nu-jazz-587413.mp3 | alex-morgan | 587413 |
| `jazz/guitar-patio/jazz-guitar-px576304.mp3` | andriih-jazz-jazz-music-576304.mp3 | andriih | 576304 |
| `jazz/guitar-patio/jazz-coffee-guitar-px593167.mp3` | aurec-coffee-jazz-593167.mp3 | aurec | 593167 |
| `jazz/guitar-patio/jazz-cafe-guitar-px585969.mp3` | aurec-jazz-cafe-585969.mp3 | aurec | 585969 |
| `jazz/guitar-patio/jazz-guitar-drums-px495626.mp3` | jazz2.mp3 | freemusicforvideo | 495626（旧歌单里也有） |
| `jazz/guitar-patio/jazz-cafe-guitar-px496552.mp3` | jazz-cafe2.mp3 | the_mountain | 496552（旧歌单里也有） |
| `jazz/swing-time/jazz-swing-study-session-px568162.mp3` | alex-morgan-swing-jazz-study-session-568162.mp3 | alex-morgan | 568162 |
| `jazz/swing-time/jazz-upbeat-px589698.mp3` | aurec-upbeat-jazz-589698.mp3 | aurec | 589698 |
| `jazz/swing-time/jazz-brass-band-px485401.mp3` | jazz-jazz-music3.mp3 | tatamusic | 485401（旧歌单里也有） |
| `jazz/swing-time/jazz-old-time-px515630.mp3` | jazz-jazz-music2.mp3 | starostin | 515630（旧歌单里也有） |
| `jazz/swing-time/jazz-busy-cafe-px516774.mp3` | jazz-cafe.mp3 | waveloom | 516774（旧歌单里也有） |
| `jazz/swing-time/jazz-new-orleans-club-px164472.mp3` | jazz-club.mp3 | paoloargento | 164472（旧歌单里也有） |

## 许可的要点

- **CC0**：公共领域，可以自由使用、修改，不需要署名。
- **Pixabay Content License**：可以免费用于商业和非商业用途，不要求署名。不能把文件原样单独转售或当成素材库再分发；作为网站体验的一部分播放没有问题。
- 以后如果用到 **CC BY** 的录音（例如备选里 klankbeeld 的几条），必须在网站上署名：作者、作品名、来源链接、许可名称，加在 `public/privacy.html` 的声音致谢里。**CC BY-SA** 还要求处理后的文件用同样的许可公开，尽量不用。

## 已经撤下的文件（2026-10-04）

这 5 个文件是用下载工具从标准许可的 YouTube 视频里抓的，没有再使用的授权，已从 R2 删除，代码不再引用：`cafe-ambience.mp3`、`rain.mp3`、`typing.mp3`、`light-traffic.m4a`、`heavy-traffic.m4a`。来源视频分别属于 Leontube、輕音樂 放鬆 Soothing Relaxation、HANBINI STUDYLOG、Midnight ASMR、Walking Around Taiwan。

这些文件曾留在 2026-10-03 之前的 git 历史里（2026-10-03 起 `public/audio/` 已不进 git）。2026-10-04 重写了仓库历史，把 `public/audio/` 从所有提交里去掉，`main` 的历史和新的 clone 里都不再有它们。GitHub 上旧提交暂时还能通过提交号直链和旧 PR 的引用访问，彻底清除要等 GitHub Support 处理，见 `docs/progress.md`。

## 图片

场景图和角色设定图由用户用即梦生成，规范见 `docs/visual-asset-guidelines.md`。公开使用前确认即梦对生成图的公开展示和商用条款。这一项 Claude 没有核对。

## YouTube 电台

电台是嵌入 YouTube 的官方播放器，内容由各频道在 YouTube 上提供，不由本站托管，适用 YouTube 的条款。这和上面“抓取音频再自己托管”是两回事：嵌入播放器是 YouTube 允许的用法。预设列表在 `src/lib/youtube.js`。
