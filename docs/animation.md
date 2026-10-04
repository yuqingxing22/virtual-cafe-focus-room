# 动画和画布

网站有两套动画工具，分工不同。2026-10-03 装好，基础模块已建，还没有接到任何页面上。在页面里第一次用到之前，它们不会被打进线上包。

## 选哪一个

| 想做的效果 | 用 | 位置 |
| --- | --- | --- |
| 按钮、卡片、面板、对话框的出现和消失，悬停和按下的反馈，场景之间的过渡，列表依次出现 | Motion（`motion` 包） | `src/motion/` |
| 画面里的东西在动：咖啡冒热气、窗上的雨、人物走动或眨眼、光影变化、可以点的物品 | PixiJS（`pixi.js` 加 `@pixi/react`） | `src/canvas/` |

简单的颜色或透明度变化继续用 CSS `transition` 就行，不需要这两个库。

## Motion：界面动效

从 `src/motion/index.js` 引入，不要直接从 `motion/react` 引入，这样时长、缓动和「减少动态效果」的规则都在一处。

```jsx
import { AnimatePresence, motion, pressable, rise, stagger } from "./motion/index.js";

<motion.div className="choice-grid" variants={stagger()} initial="hidden" animate="shown">
  {DRINKS.map((item) => (
    <motion.button key={item.id} variants={rise} {...pressable}>…</motion.button>
  ))}
</motion.div>
```

- `presets.js` 里有统一的时长（`DURATION`）、缓动（`EASE`）、弹簧（`SPRING`）和几组现成的动作：`fade`、`rise`、`sceneChange`、`stagger()`、`pressable`。新动效优先用这些，需要新的就加到这个文件里，不要在组件里各写各的数字。
- 第一次在页面里用 Motion 时，在 `src/main.jsx` 里用 `<MotionRoot>` 包住 `<App />`。它设了 `reducedMotion="user"`：系统开了「减少动态效果」时，Motion 自动去掉位移和缩放，只保留淡入淡出。
- 元素被移除时要播放退场动画，外面要包 `<AnimatePresence>`。
- 包大小：Motion 约 35 KB（gzip），会进主包。

## PixiJS：场景画布

从 `src/canvas/index.js` 引入 `CanvasStage`，里面放 `@pixi/react` 的元素。

```jsx
import { CanvasStage, useTick } from "./canvas/index.js";

function Steam() {
  const [t, setT] = useState(0);
  useTick((ticker) => setT((v) => v + ticker.deltaTime));
  return <pixiGraphics draw={(g) => { g.clear(); /* 按 t 画 */ }} />;
}

<div className="scene-art" style={{ position: "relative" }}>
  <CanvasStage fallback={<img src="…静态图…" alt="" />}>
    <Steam />
  </CanvasStage>
</div>
```

- `CanvasStage` 是一层透明画布，铺满最近的定位父元素。默认不接收点击（点击穿透到下面的页面），需要可点的物品时传 `interactive`。
- Pixi 较大（约 200 KB gzip），所以单独打包、懒加载：只有渲染了 `CanvasStage` 的页面才会下载。加载过程中和加载失败时显示 `fallback`，建议放静态图。
- 能用的 Pixi 类在 `src/canvas/PixiStage.jsx` 的 `extend({...})` 里注册，目前有 `Container`、`Sprite`、`AnimatedSprite`、`Graphics`、`Text`，写成 `<pixiSprite>`、`<pixiContainer>` 等。要用别的类先在那里加。
- 系统开了「减少动态效果」时，画布只画第一帧然后停止。做循环效果的组件也应该用 `usePrefersReducedMotion()`（`src/lib/reducedMotion.js`）判断，直接显示静止状态。
- 素材（序列帧、精灵图）放 `public/assets/` 下，用 Pixi 的 `Assets.load` 加载。不要从第三方网站加载，隐私页承诺了不向别的服务器发请求。

## 共同规则

- 动画只为「把人带回任务」服务，专注页上要安静：不要循环抢眼的动画，不要闪烁。
- 每个新动效都在「减少动态效果」打开时检查一遍（Chrome 开发者工具 Rendering 面板里可以模拟）。
- 手机（390px 宽）上也要看一遍，画布在手机上注意性能，分辨率最多 2 倍。
