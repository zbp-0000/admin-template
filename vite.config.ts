import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path"; //这个path用到了上面安装的@types/node
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import viteCompression from "vite-plugin-compression";
import { wrapperEnv } from "./build/getEnv";

// https://vitejs.dev/config/
export default ({ mode }) => {
  // console.log('mode', loadEnv(mode, process.cwd()).VITE_BASE_URL);//使用loadEnv在vite.config.ts中读取环境变量
  const baseUrl = loadEnv(mode, process.cwd()).VITE_BASE_URL;
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);
  return defineConfig({
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      {
        ...viteCompression(),
        apply: "build"
      }
    ],
    server: {
      host: "0.0.0.0",
      port: 8080,
      open: true,
      https: false,
      proxy: {
        "/api": {
          target: baseUrl,
          changeOrigin: true,
          ws: true,
          rewrite: (path: string) => path.replace(/^\/api/, "")
        }
      }
    },
    //这里进行配置别名
    resolve: {
      alias: {
        "@": path.resolve("./src"), // @代替src
        "#": path.resolve("./types") // #代替types
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/index.scss";'
        }
      }
    },
    esbuild: {
      pure: viteEnv.VITE_DROP_CONSOLE ? ["console.log", "debugger"] : []
    },
    build: {
      outDir: "dist",
      // esbuild 打包更快，但是不能去除 console.log，terser打包慢，但能去除 console.log
      minify: "esbuild",
      sourcemap: false,
      // 禁用 gzip 压缩大小报告，可略微减少打包时间
      reportCompressedSize: false,
      // 规定触发警告的 chunk 大小
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          manualChunks: {
            vue: ["vue", "pinia", "vue-router"],
            elementIcons: ["@element-plus/icons-vue"]
          }
        }
      }
    }
  });
};
