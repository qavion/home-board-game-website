## データベース設計

* 画像データには ストレージの S3 を利用する
* メタデータには noSQLの DynamoDB を利用する

## オーダー機能のデータ

オーダー機能のために以下の3つのDynamoDBテーブルを追加

### 1. オーダーテーブル (Orders)

Amazon DynamoDB に以下の形式で格納します。

#### JSON形式での例と説明

```jsonc
{
    "order_id": "550e8400-e29b-41d4-a716-446655440000", // オーダーID [パーティションキー] (UUID形式)
    "created_at": "2025-03-22T14:30:45.123Z", // 作成日時 [ソートキー]
    "table_number": 5, // テーブル番号
    "session_id": "d290f1ee-6c54-4b01-90e6-d701748f0851", // テーブルセッションID
    "status": "PENDING", // ステータス (PENDING, PROCESSING, COMPLETED, CANCELED)
    "items": [
        {
            "id": 1, // メニューアイテムID
            "name": "希望の雫", // 商品名
            "quantity": 2, // 数量
            "price": 300, // 単価
            "notes": "氷なし" // 特記事項
        },
        {
            "id": 2,
            "name": "カップ麺",
            "quantity": 1,
            "price": 300,
            "notes": ""
        }
    ],
    "total_price": 900, // 合計金額
    "customer_notes": "テーブルの奥に持ってきてください", // 全体の特記事項
    "updated_at": "2025-03-22T14:35:12.456Z" // 最終更新日時
}
```

#### DynamoDB JSON 形式

```json
{
  "order_id": { "S": "550e8400-e29b-41d4-a716-446655440000" },
  "created_at": { "S": "2025-03-22T14:30:45.123Z" },
  "table_number": { "N": "5" },
  "session_id": { "S": "d290f1ee-6c54-4b01-90e6-d701748f0851" },
  "status": { "S": "PENDING" },
  "items": { 
    "L": [
      { 
        "M": {
          "id": { "N": "1" },
          "name": { "S": "希望の雫" },
          "quantity": { "N": "2" },
          "price": { "N": "300" },
          "notes": { "S": "氷なし" }
        } 
      },
      { 
        "M": {
          "id": { "N": "2" },
          "name": { "S": "カップ麺" },
          "quantity": { "N": "1" },
          "price": { "N": "300" },
          "notes": { "S": "" }
        } 
      }
    ] 
  },
  "total_price": { "N": "900" },
  "customer_notes": { "S": "テーブルの奥に持ってきてください" },
  "updated_at": { "S": "2025-03-22T14:35:12.456Z" }
}
```

### 2. テーブルセッションテーブル (TableSessions)

Amazon DynamoDB に以下の形式で格納します。

#### JSON形式での例と説明

```jsonc
{
    "table_number": 5, // テーブル番号 [パーティションキー]
    "session_id": "d290f1ee-6c54-4b01-90e6-d701748f0851", // セッションID (UUID形式)
    "status": "OCCUPIED", // ステータス (AVAILABLE, OCCUPIED)
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // アクセストークン
    "created_at": "2025-03-22T14:00:30.123Z", // セッション開始日時
    "last_activity": "2025-03-22T15:45:22.789Z", // 最終アクティビティ日時
    "expiration_time": "2025-03-22T17:00:30.123Z" // セッション有効期限
}
```

#### DynamoDB JSON 形式

```json
{
  "table_number": { "N": "5" },
  "session_id": { "S": "d290f1ee-6c54-4b01-90e6-d701748f0851" },
  "status": { "S": "OCCUPIED" },
  "access_token": { "S": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
  "created_at": { "S": "2025-03-22T14:00:30.123Z" },
  "last_activity": { "S": "2025-03-22T15:45:22.789Z" },
  "expiration_time": { "S": "2025-03-22T17:00:30.123Z" }
}
```

### 3. スロットリング用テーブル (RateLimits) (オプション)

リクエスト頻度制限のために使用します。TTL機能を活用して自動的に古いレコードを削除します。

#### JSON形式での例と説明

```jsonc
{
    "identifier": "table_5", // 識別子 [パーティションキー] (テーブル番号)
    "timestamp": "2025-03-22T14:30:45.123Z", // タイムスタンプ [ソートキー]
    "request_type": "create_order", // リクエスト種別
    "expiration": 1743179445 // TTL値 (エポック秒) - 自動削除用
}
```

#### DynamoDB JSON 形式

```json
{
  "identifier": { "S": "table_5" },
  "timestamp": { "S": "2025-03-22T14:30:45.123Z" },
  "request_type": { "S": "create_order" },
  "expiration": { "N": "1743179445" }
}
```

## ボードゲーム画像データ

Amazon S3 に格納する。

### S3 構造

```sh
{配信用バケット}/
 └── images/
      ├── original/   # 管理者がアップロードした元画像
      ├── resized-m/  # アップロードされた画像を自動で中サイズにリサイズした画像
      └── resized-s/  # アップロードされた画像を自動で小サイズにリサイズした画像
```

## メニュー用データ

Amazon DynamoDB に以下の形式で格納する。

### JSON形式での例と説明

```jsonc
{
    "id": 1, // ID [パーティションキー] （サーバー側で自動採番）
    "name": "コーヒー", // メニュー名
    "type": "drink", // 種類（food または drink）
    "description": "ホットコーヒー", // 説明
    "price": 300, // 価格
    "available": true // 利用可能かどうか
}
```

### DynamoDB JSON 形式

```json
{
  "id": { "N": "1" },
  "name": { "S": "コーヒー" },
  "type": { "S": "drink" },
  "description": { "S": "ホットコーヒー" },
  "price": { "N": "300" },
  "available": { "BOOL": true }
}
```

## ボードゲームメタデータ

Amazon DynamoDB に以下の形式で格納する。

### JSON形式での例と説明

```jsonc
{
    "id": 1, // ID [パーティションキー] （サーバー側で自動採番）
    "title_kana": "いんさいだーげーむ", // タイトルひらがな [ソートキー]
    "title": "インサイダーゲーム", // タイトル
    "genre": ["正体隠匿", "パーティー", "推理"], // ジャンル
    "tags": ["Oink Games", "オインクゲームズ"], // タグ（検索に利用する。タイトルの言い換え、略称、販売元など）
    "images": ["01_01.jpg", "01_02.jpg"], // 画像の S3 ファイル名リスト
    "description": "あなたは、操られている。クイズと正体探し、2つの楽しさが絶妙にマッチした、短時間でみんなが盛り上がれる会話ゲーム。", // 説明
    "rules": "クイズと正体探し、ふたつの楽しさが絶妙にマッチした、短時間でみんなが盛り上がれる会話ゲーム。会話で進めていくクイズの中、陰で議論を思い通りに操作している狡猾なインサイダーが紛れこんでいます。インサイダーは、正体を隠しながら世論をうまく導こうとしているのです....！", // ルール概要
    "playerCount": {
        "min": 4, // 最小プレイ人数
        "max": 8, // 最大プレイ人数
        "text": "4-8人" // プレイ人数表記
    },
    "playTime": {
        "min": 15, // 最小プレイ時間
        "max": 15, // 最大プレイ時間
        "text": "約15分" // プレイ時間表記
    },
    "age": {
        "min": 9, // 推奨年齢
        "text": "9歳以上" // 推奨年齢表記
    },
    "difficulty": "中級", // 難しさ
    "recommendation": 4.5, // おすすめ度
    "arrivalDate": "2024-11-16" // 入荷日
    "lastModified": "2024-12-29T07:34:50.726143+00:00", // データ最終更新日（サーバー側で自動生成）
    "created": "2024-12-29T07:34:50.726143+00:00", // データ作成日（サーバー側で自動生成）
}
```

### DynamoDB JSON 形式

```json
{
  "id": { "N": "1" },
  "title_kana": { "S": "いんさいだーげーむ" },
  "title": { "S": "インサイダーゲーム" },
  "genre": { "SS": ["正体隠匿", "パーティー", "推理"] },
  "tags": { "SS": ["いんさいだーげーむ", "Oink Games", "オインクゲームズ"] },
  "images": { "SS": ["01_01.jpg", "01_02.jpg"] },
  "description": { "S": "あなたは、操られている。クイズと正体探し、2つの楽しさが絶妙にマッチした、短時間でみんなが盛り上がれる会話ゲーム。" },
  "rules": { "S": "クイズと正体探し、ふたつの楽しさが絶妙にマッチした、短時間でみんなが盛り上がれる会話ゲーム。会話で進めていくクイズの中、陰で議論を思い通りに操作している狡猾なインサイダーが紛れこんでいます。インサイダーは、正体を隠しながら世論をうまく導こうとしているのです....！" },
  "playerCount": { "M": { "min": { "N": "4" }, "max": { "N": "8" }, "text": { "S": "4-8人" } } },
  "playTime": { "M": { "min": { "N": "15" }, "max": { "N": "15" }, "text": { "S": "約15分" } } },
  "age": { "M": { "min": { "N": "9" }, "text": { "S": "9歳以上" } } },
  "difficulty": { "S": "中級" },
  "arrivalDate": { "S": "2024-11-16" },
  "recommendation": { "N": "4.5" },
  "lastModified": { "S": "2024-12-29T07:34:50.726143+00:00" },
  "created": { "S": "2024-12-29T07:34:50.726143+00:00" },
}
```