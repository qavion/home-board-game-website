## 技術選定結果

### フロントエンド

* フレームワーク: React
* 状態管理: Context API + useReducer
* ルーティング: React Router
* UIコンポーネント: Material-UI
* フォームライブラリ: React Hook Form
* HTTPクライアント: fetch API
* 型チェック: TypeScript

### バックエンド

* 開発言語: Python3
* フレームワーク: なし
* IaCツール: Terraform
* サーバーレスフレームワーク: Serverless Framework (デプロイ効率化のため)

### 開発ツール

* パッケージマネージャー: npm または yarn
* ビルドツール: Vite
* リンター: ESLint
* フォーマッター: Prettier
* テスト:
    * 単体テスト: Jest + React Testing Library
    * E2Eテスト: Cypress (必要に応じて)
* エディタ: Visual Studio Code

### CI/CD

* CI/CDツール: GitHub Actions
* デプロイ: AWS CLI または Terraform

### インフラ構成

* クラウドプロバイダー: AWS

#### フロントエンド

* **ホスティング:** Amazon S3
    * React アプリケーションのビルド成果物を保存
* **配信:** Amazon CloudFront
    * S3 から静的ファイルを配信し、キャッシュ機能により高速化
    * 必要に応じて、独自ドメインを CloudFront に紐付け (Route 53)

#### バックエンド

* **API エンドポイント:** Amazon API Gateway
    * フロントエンドからのリクエストを受け付け、Lambda 関数にルーティング
    * 必要に応じて、API キーや IAM 認証などを導入し、セキュリティ強化を検討
* **サーバーレス関数:** AWS Lambda
    * Python で記述された API の処理ロジックを実行
* **データベース:** Amazon DynamoDB
    * ボードゲーム情報などを保存する NoSQL データベース
    * 無料枠を超えないよう、アクセス状況を監視し、必要に応じてキャパシティーを調整

#### その他

* **ドメイン管理:** Amazon Route 53
    * 独自ドメインの登録・管理
    * CloudFront へのトラフィックルーティング
* **モニタリングとロギング:** Amazon CloudWatch
    * 各 AWS リソースのメトリクスを監視し、ログを収集・分析
    * 問題の早期発見とパフォーマンス改善に活用
* **CloudFront のキャッシュ戦略:**
    * キャッシュ有効期限やキャッシュキーなどを適切に設定し、パフォーマンスを最適化

### その他

* ソースコード管理: GitHub