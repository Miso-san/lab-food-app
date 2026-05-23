import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/lab-food-app/",
});

// GitHub Pages の場合は base を '/リポジトリ名/' に変更してください
// 例: base: '/lab-food-app/'
// Cloudflare Pages の場合は base: '/' のままでOKです