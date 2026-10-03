import { rmSync } from "node:fs";
import { globSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The PNG scene masters stay in public/ for editing, but only the WebP copies ship.
const dropPngMasters = () => ({
  name: "drop-png-masters",
  apply: "build",
  closeBundle() {
    const files = [
      ...globSync("dist/assets/scenes/**/*.png"),
      ...globSync("dist/assets/cafe-room.png"),
    ];
    files.forEach((file) => rmSync(file, { force: true }));
    if (files.length) console.log(`Removed ${files.length} PNG masters from dist/assets`);
  },
});

export default defineConfig({
  base: "/",
  plugins: [react(), dropPngMasters()],
});
