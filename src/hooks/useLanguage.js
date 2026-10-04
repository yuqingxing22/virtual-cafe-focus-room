import { useEffect, useState } from "react";
import { COPY } from "../data/copy.js";

// Interface language: saved choice first, then the browser's language. Keeps <html lang>
// and the tab title in step.
export function useLanguage() {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("cafe-focus-language");
    if (saved === "en" || saved === "zh") return saved;
    return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  });
  const copy = COPY[lang];

  useEffect(() => {
    window.localStorage.setItem("cafe-focus-language", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = copy.appName;
  }, [copy.appName, lang]);

  return { lang, setLang, copy };
}
