// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
const IS_DEV=true

export default defineConfig({
  build:IS_DEV?{
      rollupOptions: {
        input:{
          main: resolve(__dirname, 'index.html'), // エントリポイントを指定
          sub: resolve(__dirname, 'index_jcc.html'), // エントリポイントを指定

        }
      },
  }
  :{
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'GaluchatApiJs',
      fileName: (format) => `galuchat-api.${format}.js`,
      formats: ['es', 'cjs','umd']
    },
    rollupOptions: {
      // 外部依存をバンドルしない場合
      external: [],
      output: {
        globals: {'galuchat-api': 'GaluchatApiJs',},
      },
    },
  },
  server: {
    open: true, // 開発サーバー起動時にブラウザを自動で開く
    hmr: {
      protocol: 'ws', // WebSocketを使ってHMR
      host: 'localhost', // ローカルホストでHMR
    },
    fs: {
    allow: [resolve(__dirname, 'src')], // distを静的ファイルとして許可
    },
    watch: {
      usePolling: true,
      interval: 1000,
      // 監視するディレクトリやファイルの指定
      include: ['src/**/*.ts', 'src/**/*.tsx'],  // ここで特定の拡張子やディレクトリを監視
      exclude: ['node_modules']  // 除外するディレクトリ
    }    
  },  
});