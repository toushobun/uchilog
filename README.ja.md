<p align="right">
  <a href="./README.md">简体中文</a> |
  日本語 |
  <a href="./README.en.md">English</a>
</p>

# UchiLog

UchiLog は、「商家（店舗・利用先）」を中心にした多言語対応の家庭向け家計簿 PWA です。中国語・日本語・英語に対応し、収入、支出、口座、振替、カテゴリ、家族共有の支出を記録・可視化し、家庭のお金が主にどの商家で使われているのか、各商家でどのようなカテゴリの支出が発生しているのか、家族メンバー間で日常の支出をどのように共有しているのかを把握できるようにすることを目指しています。

このリポジトリは、個人開発プロジェクトの記録も兼ねています。
現在は MVP 開発段階です。

## プロジェクト概要

UchiLog は、家庭の日常利用に向けた merchant-first（商家主導）の家計簿アプリを目指しています。

一般的な家計簿アプリではカテゴリを中心に支出を管理することが多いですが、実際に家庭の支出を振り返るときは、「どの商家で使ったか」がより直感的な入口になります。UchiLog では、商家を重要な軸として扱い、商家ごとの支出記録・カテゴリ分布・支出傾向を確認できるようにしていきます。

初期目標：

- 日々の支出と収入をすばやく記録する
- 商家を入口として支出を管理・確認する
- 現金、銀行口座、クレジットカード、電子マネーなどの口座を管理する
- 支出カテゴリと収入カテゴリを管理する
- 同じ商家の中で複数カテゴリの支出を扱えるようにする
- 家族メンバー間で共有して記帳できるようにする
- モバイルでの日常利用体験を優先する
- 機能を明確に保ち、家計簿アプリにありがちな複雑化を避ける

本プロジェクトは現在、主に中国語で要件整理・Issue 作成・開発記録を行っています。
コード、ディレクトリ名、変数名、技術的な識別子は英語を使用します。

## 現在の開発状況

現在は MVP 初期開発段階です。

実装済み：

- プロジェクト開発規則の整理
- 初期画面デザイン方針の整理
- MVP データベース構造の設計
- Supabase ローカル開発環境の初期化
- Supabase 初期データベース migration
- Next.js アプリの基礎構築
- MUI ThemeProvider の基本設定
- Supabase Auth メール・パスワード認証
- 認証後の保護ページ
- 認証後の基本 App Shell
- 現在の ledger（帳簿）初期化 / ledger 選択の基礎
- 口座管理の基本機能
- 口座保有者機能（口座の追加・編集時に保有者を管理）
- 商家管理の基本機能
- 商家別名の schema と基本検索サポート
- ローカル開発用 seed データ
- Vitest ユニットテストの基盤
- Storybook の基盤
- GitHub Actions CI
- Storybook build CI

未実装：

- 記帳追加の最小フロー
- 記帳一覧
- カテゴリ管理ページの改善
- 口座保有者体験の改善
- 商家ごとの支出集計とトレンド分析
- データ集計とグラフ
- PWA 設定
- 本番デプロイ

## 技術スタック

### フロントエンド

- Next.js App Router
- TypeScript
- React
- MUI

### バックエンド / データベース

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security 設計

### 開発ツール

- GitHub Issues
- GitHub Pull Requests
- GitHub Actions
- Supabase CLI
- Figma
- Vitest
- Storybook

## 実装済み機能

### 認証

- メール・パスワードログイン
- ログアウト
- 未ログイン時に保護ページへアクセスするとログインページへリダイレクト
- ログイン済みでログインページにアクセスするとダッシュボードへリダイレクト

### アプリシェル

- ログイン後の基本 App Shell
- トップバー
- 現在のログインユーザー表示
- ボトムナビゲーション
- ダッシュボードのプレースホルダーページ
- 記帳のプレースホルダーページ
- カテゴリのプレースホルダーページ

### Ledger（帳簿）

- ログイン後に現在のユーザーが所属する ledger を取得
- Ledger がない場合は ledger 初期化ページへリダイレクト
- 初期 ledger の作成
- Ledger 一覧の基本ページ

### 口座管理

- 現在の ledger 内の口座一覧
- 口座の追加
- 口座の基本情報編集
- 口座のアーカイブ
- 口座保有者の選択
- 口座の追加・編集時に保有者を管理
- 口座種別の表示
- 金額のフォーマット表示
- 基本的な口座表示コンポーネント
- 口座コンポーネントの Storybook story

### 商家管理

- 現在の ledger 内の商家一覧
- 商家の追加
- 商家の基本情報編集
- 商家のアーカイブ
- 商家別名の schema
- 商家別名の追加
- 商家別名のアーカイブ
- 商家名 / 別名の基本検索サポート
- 商家を支出記録および今後の統計分析の重要な入口として活用

### ローカル開発データ

- `supabase/seed.sql`
- ローカルテストユーザー
- 家庭用 ledger seed
- 口座 seed
- 商家・商家別名 seed
- 基本カテゴリ seed

### エンジニアリング

- GitHub Actions CI
  - Pull Request 時に自動チェックを実行
  - main ブランチ更新時に自動チェックを実行
  - Type check
  - Format check
  - Lint
  - Test
  - Build
  - Storybook build
- ローカル開発ツール
  - Prettier
  - Vitest
  - Storybook

## 開発ロードマップ

現在の計画順序：

1. プロジェクト開発規則の整理
2. 初期アプリ画面の設計
3. MVP データベース構造の設計
4. 初期データベース migration の実装
5. Next.js アプリの初期化
6. メール・パスワードログインの実装
7. GitHub Actions CI の追加
8. ログイン後の基本 App Shell の実装
9. 現在の ledger 初期化 / ledger 選択の実装
10. 口座管理基本機能の実装
11. 商家管理基本機能の実装
12. ローカル seed データの追加
13. ユニットテストと CI の追加
14. Storybook と CI の追加
15. カテゴリ管理ページの改善
16. 記帳追加の最小フローの実装
17. 記帳一覧の実装
18. 口座保有者体験の改善
19. 基本的な集計と統計の実装
20. PWA の設定
21. デプロイ方法の整理

## ローカル起動

### 前提条件

必要なもの：

- Node.js 20 以上
- npm
- Docker
- Supabase CLI

### 依存関係のインストール

```bash
npm install
```

`package-lock.json` に厳密に従う場合は：

```bash
npm ci
```

### ローカル Supabase の起動

```bash
npx supabase start
```

ローカル Supabase の状態確認：

```bash
npx supabase status
```

Supabase Studio のデフォルトアドレス：

```text
http://127.0.0.1:54323
```

### 環境変数

環境変数テンプレートのコピー：

```bash
cp .env.example .env.local
```

ローカル Supabase の出力を参考に `.env.local` を編集してください。

例：

```text
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
```

`.env.local` はローカル開発専用です。リポジトリにはコミットしないでください。

### ローカルテストユーザー

`npx supabase db reset` を実行すると `supabase/seed.sql` が自動実行され、ローカル開発用のテストユーザーが作成されます。

ログイン情報：

```text
メール：local@example.test
パスワード：password123

メール：local2@example.test
パスワード：password123
```

seed には家庭用 ledger、口座、商家、商家別名、基本カテゴリデータが含まれており、reset 後すぐに UI の手動確認ができます。

ローカル Auth ユーザーを手動で確認・調整する場合は、Supabase Studio を開いてください：

```text
http://127.0.0.1:54323
```

### ローカルデータベースのリセット

```bash
npx supabase db reset
```

リセット後にブラウザに古いログイン状態が残っている場合、refresh token 関連のエラーが発生することがあります。その場合は再ログインしてください。

### Next.js 開発サーバーの起動

```bash
npm run dev
```

ブラウザで開く：

```text
http://localhost:3000
```

### Storybook の起動とコンポーネント確認

```bash
npm run storybook
```

Storybook を開く：

```text
http://localhost:6006
```

## よく使うコマンド

### 開発サーバーの起動

```bash
npm run dev
```

### フォーマットチェック

```bash
npm run format:check
```

### 自動フォーマット

```bash
npm run format
```

### Lint の実行

```bash
npm run lint
```

### ユニットテストの実行

```bash
npm run test
```

### ビルドの実行

```bash
npm run build
```

### Storybook 開発サーバーの起動

```bash
npm run storybook
```

### Storybook ビルドの実行

```bash
npm run build-storybook
```

### ローカル Supabase データベースのリセットと seed 実行

```bash
npx supabase db reset
```

## 開発フロー

本プロジェクトは Issue ファーストの開発方式を採用しています。

基本フロー：

1. GitHub Issue を作成または選択する
2. Issue に対応するブランチを作成する
3. 新しいブランチで開発を行う
4. ローカルでチェックを実行する
5. Pull Request を作成する
6. GitHub Actions CI の通過を待つ
7. 確認後に PR をマージする

ブランチ名の例：

```text
feature/16_implement_authenticated_app_shell
docs/18_update_public_readme
chore/14_add_github_actions_ci
```

コミットメッセージの例：

```text
feat: ログイン後の基本 App Shell を実装
docs: 公開リポジトリ README の整理
chore: GitHub Actions CI の追加
```

## スクリーンショット

スクリーンショットは MVP UI が安定した後に追加予定です。

追加予定：

- ログインページ
- ログイン後の App Shell
- ダッシュボード
- 口座管理ページ
- 商家管理ページ
- カテゴリ管理ページ
- 記帳追加ページ
- 記帳一覧ページ

## ポートフォリオとしての説明

本プロジェクトは単なる家計簿アプリではなく、小規模な Web プロダクトをゼロから構築するプロセスの展示でもあります。

重点的に示す内容：

- 要件の分解
- Issue ドリブン開発
- データベース構造の設計
- Supabase Auth の統合
- Row Level Security 設計
- 保護ルートの設計
- フロントエンド App Shell の設計
- 口座管理・商家管理の基本機能
- ローカル seed データの設計
- ユニットテストの基盤
- Storybook によるコンポーネント展示
- CI 設定
- MVP のイテレーション推進プロセス

現在も開発中のため、リポジトリには Issue・PR・Commit 記録が継続的に残されています。

## 公開リポジトリについて

本リポジトリは開発プロセスの記録とプロジェクト実装の展示を目的としています。

ローカル環境変数ファイル、実際のユーザーデータ、個人の家計データはコミットしません。

## License

ライセンスは未選択です。
