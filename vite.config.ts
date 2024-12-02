import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'



export default defineConfig({
  base: '/ai_code_games/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // 使用 esbuild 压缩
    minify: 'esbuild',
    // 代码分割配置
    rollupOptions: {
      output: {
        // 手动配置代码分割策略
        manualChunks(id) {
          // React 相关库打包到一起
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router')) {
            return 'vendor-react'
          }
          // 游戏相关的依赖打包到一起
          if (id.includes('node_modules')) {
            return 'vendor-deps'
          }
          // 各个游戏单独打包
          if (id.includes('/games/2048/')) {
            return '2048-game'
          }
          if (id.includes('/games/tetris/')) {
            return 'tetris-game'
          }
          if (id.includes('/games/pacman/')) {
            return 'pacman-game'
          }
          if (id.includes('/games/maze/')) {
            return 'maze-game'
          }
        },
        // 配置chunk文件输出格式
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // 配置入口文件输出格式
        entryFileNames: 'assets/js/[name]-[hash].js',
        // 配置静态资源文件输出格式
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    sourcemap: true,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用 CSS 模块化
    cssMinify: true,
  },
  server: {
    // 配置开发服务器以支持 BrowserRouter
    historyApiFallback: true
  }
})
