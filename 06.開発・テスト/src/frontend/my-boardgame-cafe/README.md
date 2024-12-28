# My Boardgame Cafe

このプロジェクトは、ボードゲームカフェを管理するためのフロントエンドアプリケーションです。以下にプロジェクトのセットアップと構成手順を示します。

## はじめに

開発を始めるには、以下の手順に従ってください

1. リポジトリをクローン
   ```sh
   git clone https://github.com/qavion/home-board-game-website.git
   cd .\06.開発・テスト\src\frontend\my-boardgame-cafe\
   ```

2. 依存関係をインストール

   ```
   npm install
   ```

3. 開発サーバーを起動

   ```
   npm run dev
   ```

## ビルド

1. フロントエンドをビルド

   ```
   npm run build
   ```

## デプロイ (npm runコマンドを利用する方法)

0. 事前準備
   1. （未インストールの場合） awscli をインストールする
   2. （未作成の場合）AWSの該当環境のIAMユーザーのアクセスキーを取得する
      1. Access Key ID と Secret Access Key を控えておく
   3. `aws configure` コマンドで、Access Key ID と Secret Access Key を設定する
      1. `aws s3 ls` コマンドで該当環境のバケット一覧が表示されていればOK
   4. デプロイ用のシェルスクリプトを用意する
      1. build場所と同じ階層に以下ファイル `deploy-s3.sh` を用意 (Windowsの場合、Powershell等を利用する場合。必要に応じてbatファイルなどに変更する)
         ```sh
         #!/bin/sh
         aws s3 rm s3://<Your S3 Bucket Name>/ --exclude "images/*" --recursive
         aws s3 cp dist s3://<Your S3 Bucket Name>/ --recursive
         ```
         ※ 外部から追加する images フォルダ配下は削除対象外としている
   5. package.json の scripts に以下を追記
      ```json
      {
        ...
        "scripts": {
          ...,
          "deploy": "deploy-s3.sh"
        },
        ...
      }
      ```

1. フロントエンドをデプロイ

   ```
   npm run deploy
   ```