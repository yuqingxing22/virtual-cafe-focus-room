import { Component } from "react";

const TEXT = {
  en: {
    title: "Something spilled.",
    body: "The page hit an error. Your stamp card and any session in progress are saved in this browser, so reloading brings you back to your table.",
    reload: "Reload",
  },
  zh: {
    title: "这里出了点状况。",
    body: "页面遇到了错误。集点卡和进行中的专注都保存在这个浏览器里，重新加载就能回到座位。",
    reload: "重新加载",
  },
};

const currentLang = () => {
  try {
    const saved = window.localStorage.getItem("cafe-focus-language");
    if (saved === "en" || saved === "zh") return saved;
  } catch {
    // Fall through to the browser language.
  }
  return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
};

// Last line of defence: a render error shows a way back instead of a blank page.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("Café focus room crashed:", error, info?.componentStack);
    const extra = { componentStack: info?.componentStack };
    if (window.__cafeReportError) {
      window.__cafeReportError(error, extra);
    } else {
      // The reporting chunk may still be loading (or disabled); it drains this queue on init.
      (window.__cafePendingErrors ??= []).push({ error, extra });
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const text = TEXT[currentLang()];
    return (
      <main className="error-fallback" role="alert">
        <h1>{text.title}</h1>
        <p>{text.body}</p>
        <button className="primary-action" type="button" onClick={() => window.location.reload()}>
          {text.reload}
        </button>
      </main>
    );
  }
}

export default ErrorBoundary;
