import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import IPod from "./components/IPod/IPod.jsx";
import "./styles.css";

// Development-only page for trying the iPod player on its own: open /ipod-preview.html.
function Preview() {
  const [lang, setLang] = useState("zh");
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: "24px 16px 40px",
        background:
          "linear-gradient(rgba(24, 18, 14, 0.72), rgba(24, 18, 14, 0.82)), url(/assets/cafe-room.webp) center / cover",
      }}
    >
      <button
        type="button"
        onClick={() => setLang(lang === "zh" ? "en" : "zh")}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          padding: "6px 12px",
          border: "1px solid var(--line)",
          borderRadius: 999,
          background: "var(--glass)",
          color: "var(--cream)",
        }}
      >
        {lang === "zh" ? "EN" : "中文"}
      </button>
      <IPod lang={lang} />
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
