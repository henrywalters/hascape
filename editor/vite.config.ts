import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname) + "/src",
  server: {
    port: 3000
  },
  resolve: {

  },
  build: {
    sourcemap: true
  },
  esbuild: {
    target: 'es2022'
    // Remove the experimentalDecorators from tsconfigRaw
  }
});