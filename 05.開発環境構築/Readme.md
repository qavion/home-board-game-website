## フロントエンド環境構築

フロントエンドの開発は以下のディレクトリで行う。

* `home-board-game-website/06.開発・テスト/src/frontend`

### ローカル環境の準備

```sh
# 1. Node.js のインストール
# Node.js 公式サイトから LTS 版をダウンロードし、インストーラーの指示に従ってインストール
# [https://nodejs.org/ja/](https://nodejs.org/ja/)

# 2. プロジェクトの作成
npm create vite@latest my-bodogame-cafe --template react-ts
# framework: React
# variant: TypeScript + SWC
cd my-bodogame-cafe

# 3. プロジェクトの初期設定
npm install

# 4. 開発サーバーの起動
npm run dev

# 5. ESLint と Prettier の設定
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
# .eslint.config.json と .prettierrc.json ファイルをプロジェクトルートに作成し、設定を記述

# 6. Material-UI のインストール
npm install @mui/material @emotion/react @emotion/styled

# 7. React Router のインストール
npm install react-router-dom

# 8. React Hook Form のインストール
npm install react-hook-form

# 9️. Visual Studio Code のインストールと設定
# Visual Studio Code 公式サイトからダウンロードし、インストール
# [https://code.visualstudio.com/](https://code.visualstudio.com/)
# 必要に応じて、ESLint、Prettier、TypeScript などの拡張機能をインストール

# テスト用の json-serverのインストール
npm install -g json-server
# (プロジェクトのルートディレクトリに db.json ファイルを作成)
# JSONサーバー起動
json-server --watch db.json --port 3001

```

### HowToUse

public/images に画像配置
npm i --save-dev @types/node
process.env
npm install @mui/icons-material

## バックエンド環境構築

バックエンドの開発は以下のディレクトリで行う。

* `home-board-game-website/06.開発・テスト/src/backend`

### ローカル環境の準備

```sh
# 10. Serverless Framework のインストール
npm install -g serverless

# 11. サーバーレスプロジェクトの作成
serverless create --template aws-python3 --path backend
cd backend
# serverless.yml ファイルを編集し、必要な設定を記述

# 12. ローカル DynamoDB のセットアップ
# Serverless Framework プラグイン (例: serverless-dynamodb-local) をインストールし、設定
npm install --save-dev serverless-dynamodb-local
# serverless.yml にプラグインと DynamoDB の設定を追加
```

## インフラ環境構築

インフラの開発は以下のディレクトリで行う。

* `home-board-game-website/06.開発・テスト/src/infrastructure`

### AWS環境の準備

```sh
# 13. AWS アカウントの作成
# AWS 公式サイトにてアカウントを作成し、必要なサービス (IAM, S3, CloudFront, API Gateway, Lambda, DynamoDB, Route 53 など) を有効化
# [https://aws.amazon.com/jp/](https://aws.amazon.com/jp/)

# 14. Terraform のインストール
# Terraform 公式サイトからダウンロードし、インストール
# [https://www.terraform.io/downloads](https://www.terraform.io/downloads)

# 15. Terraform によるインフラ構築
# Terraform の設定ファイルを記述し、AWS リソースを作成
# terraform init
# terraform plan
# terraform apply

# 16. 独自ドメインの設定
# Route 53 で独自ドメインを登録し、CloudFront に紐付け
```

## 共通設定

```sh
# 17. Git の初期化
# git init
# このプロジェクトではこのリポジトリをそのまま利用するため不要
```