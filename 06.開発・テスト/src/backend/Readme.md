# サーバーレス構成構築

## 事前準備

1. サーバーレスフレームワークの serverless をインストール

```sh
npm install -g serverless
```

2. serverless でプロジェクトを作成

```sh
serverless
# 必要に応じて登録・ログインする

# Create A New App: ✓

# Name Your New App: cafe
```

3. Pythonの外部モジュールをデプロイに含めるための準備

3-1. Pythonの外部モジュール（画像処理用のPillow）をデプロイに含めるためにプラグインを追加

```sh
# Pythonの外部モジュール（画像処理用のPillow）をデプロイに含めるためにプラグインを追加
serverless plugin install -n serverless-python-requirements
```

3-2. Non-pure PythonモジュールをLambda環境に合わせてデプロイするためにDockerを用意

Dockerの公式サイトからインストール


## deploy

```sh
cd my-service
serverless deploy
# sls deploy function -f image_resizer # 特定の関数のみデプロイ
```