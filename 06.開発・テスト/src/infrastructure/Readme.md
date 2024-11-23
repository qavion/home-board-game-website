# インフラ構築

## 概要
Terraformを使ってWebサイトを構築するための具体的な手順の概要を以下に示す。
ここでは、AWSをクラウドプロバイダーとして使用し、Amazon S3、CloudFront、API Gateway、Lambda、DynamoDBなどのサービスを利用する。

## 手順の概要
1. Terraformのインストール
1. Terraformプロジェクトのセットアップ
1. AWSプロバイダーの設定
1. S3バケットの作成
1. CloudFrontディストリビューションの設定
1. API Gatewayの設定
1. Lambda関数の設定
1. DynamoDBテーブルの作成
1. Route 53の設定
1. CloudWatchの設定
1. Terraformの実行

## 手順詳細

### Terraformのインストール
Terraformをインストールします。公式サイトからダウンロードしてインストールしてください。

```sh
# MacOS
brew install terraform

# Windows
choco install terraform
```

* WindowsでChocolateyを入れていない場合は入れるか、Terraformのサイトから直接ダウンロードする。

### (Terraformプロジェクトのセットアップ)
新しいディレクトリを作成し、Terraformの設定ファイルを作成します。

* Gitから本プロジェクトをpullした場合は不要

### (AWSプロバイダーの設定)

main.tf ファイルにAWSプロバイダーの設定を追加します。

* Gitから本プロジェクトをpullした場合は不要
* 利用するリージョンが東京ではない場合は変更する

```tf
provider "aws" {
  region = "ap-northeast-1"
}
```

### S3バケットの作成

S3バケットを作成し、Reactアプリケーションのビルド成果物を保存します。

```tf
resource "aws_s3_bucket" "website_bucket" {
  bucket = "my-website-bucket"
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}
```

1. CloudFrontディストリビューションの設定
CloudFrontディストリビューションを設定し、S3バケットから静的ファイルを配信します。

1. API Gatewayの設定
API Gatewayを設定し、Lambda関数にリクエストをルーティングします。

1 vulnerability
7. Lambda関数の設定
Lambda関数を設定し、APIの処理ロジックを実行します。

8. DynamoDBテーブルの作成
DynamoDBテーブルを作成し、ボードゲーム情報を保存します。

9. Route 53の設定
Route 53を設定し、独自ドメインを管理します。

10. CloudWatchの設定
CloudWatchを設定し、各AWSリソースのメトリクスを監視します。

11. Terraformの実行
Terraformを実行して、インフラを構築します。

まとめ
これで、Terraformを使ってAWS上にWebサイトを構築する手順の概要が完了です。各ステップで必要なリソースを定義し、Terraformを実行することで、インフラを自動的に構築できます。プロジェクトの要件に応じて、設定をカスタマイズしてください。