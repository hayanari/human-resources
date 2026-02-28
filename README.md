# HRナビ Pro - 人材管理ウェブアプリ

HRナビ Pro は、社員データ管理・人事評価・資格管理・スキルマップなどを一元管理する人材管理ウェブアプリケーションです。

## 機能

- **ダッシュボード** - 概要統計・資格アラート
- **人材情報** - 社員一覧・検索・詳細・編集
- **組織図** - 部署別組織構成の可視化
- **資格管理** - 資格・免許の有効期限管理
- **スキルマップ** - 習熟度（Lv0〜5）の管理
- **人事評価** - コンピテンシー・KPI評価
- **労務コスト管理** - 人件費の試算
- **活躍分析・採用** - 分析チャート
- **最適配置** - スキルマッチング
- **離職抑止・分析** - リスク分析

## セットアップ

### 必要な環境
- Node.js 18以上

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

### ビルド（本番用）

```bash
npm run build
```

`dist` フォルダに静的ファイルが出力されます。

### プレビュー

```bash
npm run preview
```

ビルド後の動作をローカルで確認できます。

## Supabase 連携

社員データ・人事評価を [Supabase](https://supabase.com) に保存できます。

1. `supabase/migrations/001_initial_schema.sql` を Supabase ダッシュボードの SQL Editor で実行
2. `public/supabase-config.js` に Supabase URL と anon key を設定（Settings → API から取得）

Excel 読み込み後、データは自動で Supabase に同期されます。

## GitHub

```bash
git init
git add .
git commit -m "Initial commit: HRナビ Pro"
git branch -M main
git remote add origin https://github.com/hayanari/human-resources.git
git push -u origin main
```

## デプロイ

### Vercel / Netlify へのデプロイ

1. このフォルダをGitリポジトリにプッシュ
2. Vercel または Netlify でプロジェクトをインポート
3. ビルドコマンド: `npm run build`
4. 出力ディレクトリ: `dist`

### 静的ホスティング

`npm run build` で生成した `dist` フォルダの内容をそのまま Web サーバーにアップロードしてください。

## データの読み込み

1. Excel で「社員マスタ」「人事評価」シートを作成
2. アプリの「データ読み込み」から .xlsx ファイルを選択
3. 顔写真（EMP001.jpg 形式）は任意で追加可能

## デモアカウント

| ID | パスワード | 権限 |
|----|-----------|------|
| admin | admin123 | 管理者 |
| evaluator1 | eval123 | 評価者 |
| viewer1 | view123 | 閲覧者 |

## ライセンス

社内利用を想定したアプリケーションです。
