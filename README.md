# Hono + typed-htmx + Tailwind Todo アプリ 🚀

シンプルな Todo アプリのサンプルプロジェクトです。
バックエンドは Hono、フロントエンドは `typed-htmx` と Tailwind CSS を利用して、サーバーサイドでの段階的な HTML 更新（HTMX スタイル）を型安全に実装しています。

GPT 5.2 により骨組みの記述、Claude Opus 4.5 によりコードを生成しました。

## ✨ 特徴

- Hono を使った軽量サーバー
- `typed-htmx` による型安全な HTMX インタラクション
- Tailwind CSS（ビルド済みの `static/app.css` を出力）
- TypeScript で堅牢に開発

## 🔧 前提条件

- Node.js (推奨最新版)
- pnpm

## インストール

pnpm を使う場合:

```bash
pnpm install
```

## 開発 (ホットリロード)

サーバーを起動します。

```bash
pnpm dev
```

Tailwind のビルドを監視するためには別ターミナルで:

```bash
pnpm run dev:css
```

ブラウザで以下を開きます。

```
http://localhost:3000
```

## プロジェクト構成

- `src/` - サーバーとフロントエンドのソース（`server.ts`, `app.tsx` など）
- `static/` - 静的資産（生成された `app.css` 等）
- `package.json` - スクリプトや依存関係
