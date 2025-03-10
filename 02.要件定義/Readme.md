# 要件定義書

## プロジェクト名: 我が家ボドゲカフェ計画

## 1. プロジェクト概要

* **目的:**
    * 遊びに来たいと思わせるウェブサイトを作成する。
    * 遊びに来た友人の満足度を向上させる。
    * 個人開発の成果物をポートフォリオとして活用する。
* **背景:**
    * 所有しているボードゲームを友人と楽しみたい。
    * 個人開発のスキルアップと成果物のアピールをしたい。

## 2. 機能要件

* **基本機能:**
    * ボードゲームの紹介ページ
      * ゲーム画像
      * タイトル
      * ジャンル
      * ゲームの説明
      * ルール概要
      * プレイ人数
      * プレイ時間
      * 対象年齢
      * 難易度
      * おすすめ度
    * （以降は今後の開発フェーズで検討）
    * ユーザ認証機能（会員登録、ログイン）
    * 飲み物紹介ページ
    * 飲み物注文システム
    * イベントカレンダー
    * 予約システム（ボードゲーム会の参加予約）
    * 掲示板またはチャット機能（コミュニケーション促進）
    * フィードバック機能（ユーザーの意見の取り入れ）
* **非機能要件:**
    * レスポンシブデザイン（様々なデバイスに対応）
    * セキュリティ対策（個人情報保護、不正アクセス防止）
    * パフォーマンス（快適な動作）
    * ユーザビリティ（使いやすいインターフェース）
    * アクセシビリティ（障がい者への配慮）

**注釈:**

* 本プロジェクトは段階的に実施し、第1段階では基本機能の「ボードゲームの紹介ページ」とすべての非機能要件のみを必須とする。

## 3. システム構成

* **インフラ:** AWS（費用月500円未満）（サーバーレス構成）
  * 主な利用サービス
    * Route53
    * CloudFront
    * Lambda
    * DynamoDB
    * S3
  * コストを抑える方法
    * 基本的にAWSの無料利用枠に収まるようにする
    * 必要最低限のシンプルな構成とする
* **開発言語・フレームワーク（バックエンド）:** Python3・フレームワークなし
* **開発言語・フレームワーク（フロントエンド）:** javascript・React
* **IaCツール:** Terraform
  * Terraform は開発者の利用経験ありで、個人開発レベルであれば無料版で利用できそうなため採用する
  * 個人開発レベルではIaCツールを利用する必要性が高くないかもしれないが、勉強やアピール目的のために採用する

## 4. 開発体制

* **開発者:** 個人開発
* **スケジュール:** 初回バージョンをできるだけ早く公開、以降は出来高で進める
* **ソースコード管理:** GitHubを利用する
  * 資料もGitHubでバージョン管理する
  * 本プロジェクト用のリポジトリを作成し、採用活動に出せるようにする
* **進捗管理:** ツール利用なし
  * 個人開発として出来高で進めるため、進捗管理ツールは利用しない

## 5. その他

* **KPI:** アクセス数
* **リスクと対策:**
    * インターネット上に公開することで問題が発生する可能性がある。
      * 個人情報漏洩
      * 不正アクセス
      * DoS攻撃
    * 対策: セキュリティに配慮した設計・実装を行う。
      * 特に、個人情報は載せないようにする
* **参考資料:** 現状なし
* **備考:** 現状なし

## 6. 納品物

* ウェブサイトのソースコード
* システム構成図
* データベース設計書
* 操作マニュアル（必要に応じて）

## 7. その他の考慮事項

* ターゲットユーザ（友人）のニーズを詳細に分析し、機能要件に反映させる。
* AWSの費用を抑えるための工夫をする。
* セキュリティ対策を十分に行い、個人情報保護に配慮する。
* ユーザビリティを高め、使いやすいウェブサイトにする。
* 必要に応じて、機能追加や改善を行う。

**本要件定義書は、プロジェクトの進捗に合わせて適宜見直しを行うものとする。** 

**注釈:**

* 本要件定義書は、企画書を元に作成したものであり、詳細な技術要件や設計については、今後の検討課題となります。
* AWSの費用については、利用するサービスや規模に応じて変動する可能性があります。
* セキュリティ対策は、ウェブサイトの公開後も継続的に実施する必要があります。

**今後のステップ:**

1. 詳細な要件定義と設計
2. 技術選定
3. 開発環境構築
4. 開発・テスト
5. デプロイ・公開
6. 運用・保守

**今後のステップ詳細**

1. 詳細設計:
   * ワイヤーフレーム/モックアップ作成: ボードゲーム紹介ページのデザインやレイアウトを視覚的に表現し、ユーザビリティを向上させる。
   * データベース設計: DynamoDBのテーブル設計、データ構造、アクセス方法などを詳細に設計する。
   * API設計: Lambdaを利用したAPIのエンドポイント、リクエスト/レスポンス形式、認証・認可などを設計する。
   * セキュリティ設計: 具体的なセキュリティ対策（例：AWS WAF、IAM、Cognitoなど）を検討し、設計に組み込む。
   * パフォーマンス設計: CloudFrontやS3のキャッシュ設定、Lambdaの最適化など、パフォーマンス向上のための設計を行う。

2. 技術選定:
   * フロントエンドフレームワーク: Reactの利用が決定しているが、必要に応じてライブラリやUIコンポーネントなどを選定する。
   * 開発ツール: ローカル開発環境、デバッグツール、テストツールなどを選定する。
   * CI/CDツール: 必要に応じて、GitHub Actionsなどを利用したCI/CD環境を構築する。

3. 開発環境構築:
   * AWSアカウントの準備: AWSアカウントを作成し、必要なサービスを有効化する。
   * Terraformによるインフラ構築: Terraformを使用して、AWSリソース（CloudFront、API Gateway、Lambda、DynamoDB、S3など）をコードで定義し、プロビジョニングする。
   * ローカル開発環境のセットアップ: ローカルマシンに開発に必要なソフトウェア（Node.js、npm、React CLIなど）をインストールし、開発環境を構築する。

4. 開発・テスト:
   * フロントエンド開発: Reactを用いて、ボードゲーム紹介ページのUIを実装する。レスポンシブデザインに対応させる。
   * バックエンド開発: PythonとAWS Lambdaを用いて、API Gateway経由でDynamoDBにアクセスするAPIを実装する。
   * 結合テスト: フロントエンドとバックエンドを連携させ、データの取得・表示が正しく行われるかテストする。
   * セキュリティテスト: 脆弱性診断ツールなどを利用して、セキュリティ上の問題がないかテストする。
   * パフォーマンス: パフォーマンス測定ツールなどを利用して、レスポンス時間や負荷に対する安定性をテストする。
   * ユーザビリティテスト: ターゲットユーザーに実際に利用してもらい、使い勝手や改善点などのフィードバックを得る。
   * アクセシビリティテスト: アクセシビリティチェックツールなどを利用して、アクセシビリティガイドラインに準拠しているかテストする。

5. デプロイ・公開:
   * Terraformによるインフラ更新: Terraformを使用して、開発環境で作成したAWSリソースを本番環境に反映する。
   * フロントエンドのデプロイ: Reactのビルド成果物をS3にアップロードし、CloudFront経由で配信する。
   * バックエンドのデプロイ: Lambda関数をデプロイし、API Gatewayと連携させる。
   * ドメイン設定: Route53で独自ドメインを設定し、CloudFrontに紐付ける。
   * 動作確認: 本番環境でウェブサイトが正しく動作するか確認する。

6. 運用・保守:
   * モニタリング: CloudWatchなどを利用して、システムの稼働状況やパフォーマンスを監視する。
   * ログ分析: CloudWatch Logsなどに記録されたログを分析し、エラーや問題点を検知する。
   * バックアップ: DynamoDBやS3のデータを定期的にバックアップする。
   * 障害対応: 障害発生時の対応手順を事前に策定し、迅速な復旧を目指す。
   * 機能追加・改善: ユーザからのフィードバックやアクセス状況などを分析し、必要に応じて機能追加や改善を行う。