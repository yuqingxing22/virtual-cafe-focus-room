# 音频来源和授权

网站和仓库都是公开的，所以每个音频文件都需要一个允许公开网站使用的来源。

这张表由 Claude 在 2026-10-04 根据文件的下载来源记录填写：macOS 会把下载网址存在文件属性里（`mdls -name kMDItemWhereFroms <文件>`），`sound-effect/` 里的原始文件和 `public/audio/` 里的副本都能查到。YouTube 来源的授权情况是当天打开视频页面核对的。

## 结论

| 状态 | 数量 | 文件 |
| --- | --- | --- |
| 可以公开使用 | 19 | 全部爵士（11 首）、全部提示音（6 个）、杯子搅拌声、后厨做咖啡 |
| 没有授权，需要用户决定怎么处理 | 5 | 咖啡厅底噪、雨声、键盘声、轻街声、重交通 |

5 个没有授权的文件是用下载工具从 YouTube 视频里抓的。这些视频是标准 YouTube 许可，没有标 Creative Commons，简介里也没有允许他人使用的说明，版权属于上传者。处理方案和进展记在 `docs/progress.md` 上线运维第 2 项。

## 没有授权的 5 个文件

| 文件 | 内容 | 来源视频 | 频道 | 授权 |
| --- | --- | --- | --- | --- |
| `cafe-ambience.mp3` | 咖啡厅人声底噪，60 分钟 | [ASMR Berlin Coffee shop 1hours](https://www.youtube.com/watch?v=PrtSR0AydXw) | 레온튜브Leontube | 标准 YouTube 许可，无再使用授权 |
| `rain.mp3` | 雨声，61 分钟 | [1小時最佳聽雨睡眠](https://www.youtube.com/watch?v=StV16WY5FiI) | 輕音樂 放鬆 Soothing Relaxation | 标准 YouTube 许可，无再使用授权 |
| `typing.mp3` | 键盘声，43 分钟 | [STUDY WITH ME : Keyboard typing ASMR](https://www.youtube.com/watch?v=srxRInikX30) | 한빈HANBINI STUDYLOG | 标准 YouTube 许可，无再使用授权 |
| `heavy-traffic.m4a` | 重交通，2 分钟片段 | [台北市中華路一段下班車流](https://www.youtube.com/watch?v=4zwyTtJ14KQ) | 台灣街道百景 Walking Around Taiwan | 标准 YouTube 许可，无再使用授权 |
| `light-traffic.m4a` | 轻街声，2 分钟片段 | [城市高架桥车流白噪音 1小时](https://www.youtube.com/watch?v=RKdmg6j_i_A) | Midnight ASMR | 标准 YouTube 许可，无再使用授权 |

`sound-effect/light-traffic-ambience.mp3`（774 MB，来自 [Nomadic Ambience 的 10 小时视频](https://www.youtube.com/watch?v=fh3EdeGNKus)）也是同样的情况，它没有被网站使用，只在本地。

## 可以公开使用：YouTube 上明确声明 CC0 的

| 文件 | 内容 | 来源 | 授权 |
| --- | --- | --- | --- |
| `back-counter-coffee.mp3` | 后厨做咖啡，1 分钟 | [Free Foley Sounds 8x Making Coffee sound effects](https://www.youtube.com/watch?v=BUoUxAT-lrs)，频道 Great Sounds | CC0。视频简介原文：“All sounds are recorded by myself and available to download and use for free as you wish with creative commons 0 license” |

## 可以公开使用：Pixabay

Pixabay Content License 允许免费用于商业和非商业用途，不要求署名。限制是不能把文件原样单独转售或当成素材库再分发；作为网站体验的一部分播放没有问题。「作者」是 Pixabay 上的用户名，「编号」是 Pixabay 的素材编号，在 pixabay.com 搜索编号可以找到原始页面。

### 提示音和循环音

| 文件 | 内容 | 作者 | 编号 |
| --- | --- | --- | --- |
| `coffee-stir.mp3` | 杯子和搅拌声 | strachszydlo | 468336 |
| `cup-set-down.mp3` | 杯子放到桌上 | freesound_community | 106992 |
| `door-bell.mp3` | 门铃 | daviddumaisaudio | 188054 |
| `door-open.mp3` | 木门打开 | freesound_community | 102413 |
| `drip-coffee.mp3` | 手冲滴滤 | freesound_community | 33785 |
| `espresso.mp3` | 意式咖啡机 | freesound_community | 78082 |
| `steps-to-cafe.mp3` | 木地板上的脚步 | freesound_community | 32056 |

### 爵士歌单

| 文件 | Pixabay 上的曲名 | 作者 | 编号 |
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

## 图片

场景图和角色设定图由用户用即梦生成，规范见 `docs/visual-asset-guidelines.md`。公开使用前确认即梦对生成图的公开展示和商用条款。这一项 Claude 没有核对。

## YouTube 电台

电台是嵌入 YouTube 的官方播放器，内容由各频道在 YouTube 上提供，不由本站托管，适用 YouTube 的条款。这和上面「抓取音频再自己托管」是两回事：嵌入播放器是 YouTube 允许的用法。预设列表在 `src/lib/youtube.js`。
