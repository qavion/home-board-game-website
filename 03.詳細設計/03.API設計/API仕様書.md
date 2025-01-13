## API仕様書：ボードゲーム情報API

### 1. 概要

このAPIは、DynamoDBに格納されたボードゲーム情報を取得するためのインターフェースを提供します。個別のボードゲームの詳細情報と、ボードゲームの一覧を取得することができます。

### 2. API一覧

#### 2.1. 個別ボードゲーム情報取得API

* **エンドポイント:** 
    * `GET /boardgames/{id}`
* **メソッド:** 
    * GET
* **パラメータ:** 
    * `id` (path): 取得したいボードゲームのID (integer)
* **レスポンス:** 
    * 成功時
        * ステータスコード: 200 OK
        * Content-Type: `application/json`
        * レスポンスボディ: 指定されたIDのボードゲーム情報（JSON形式）
            ```json
            {
                "id": (integer),
                "title_kana": (string),
                "title": (string),
                "genre": (string[]),
                "tags": (string[]),
                "images": (string[]),
                "description": (string),
                "rules": (string),
                "playerCount": {
                    "min": (integer),
                    "max": (integer),
                    "text": (string)
                },
                "playTime": {
                    "min": (integer),
                    "max": (integer),
                    "text": (string)
                },
                "age": {
                    "min": (integer),
                    "text": (string)
                },
                "difficulty": (string),
                "recommendation": (number),
                "arrivalDate": (string),
                "created": (string),
                "lastModified": (string)
            }
            ```
    * 失敗時
        * 指定されたIDのボードゲームが存在しない場合
            * ステータスコード: 404 Not Found
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Board game not found"
                }
                ```
        * サーバー側で予期せぬエラーが発生した場合
            * ステータスコード: 500 Internal Server Error
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Internal server error"
                }
                ```

#### 2.2. ボードゲームリスト取得API

* **エンドポイント:** 
    * `GET /boardgames`
* **メソッド:** 
    * GET
* **パラメータ:** なし
* **レスポンス:** 
    * 成功時
        * ステータスコード: 200 OK
        * Content-Type: `application/json`
        * レスポンスボディ: ボードゲームリスト（JSON形式）
        * 各ボードゲーム情報は、`rules`を除く全てのデータを含む
            ```json
            [
                {
                    "id": (integer),
                    "title_kana": (string),
                    "title": (string),
                    "genre": (string[]),
                    "tags": (string[]),
                    "images": (string[]),
                    "description": (string),
                    "playerCount": {
                        "min": (integer),
                        "max": (integer),
                        "text": (string)
                    },
                    "playTime": {
                        "min": (integer),
                        "max": (integer),
                        "text": (string)
                    },
                    "age": {
                        "min": (integer),
                        "text": (string)
                    },
                    "difficulty": (string),
                    "recommendation": (number),
                    "arrivalDate": (string),
                    "created": (string),
                    "lastModified": (string)
                },
                {
                    // ...他のボードゲーム情報
                }
            ]
            ```
    * 失敗時
        * サーバー側で予期せぬエラーが発生した場合
            * ステータスコード: 500 Internal Server Error
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Internal server error"
                }
                ```

#### 2.3. 新規ボードゲーム追加API

* **エンドポイント:** 
    * `POST /boardgames`
* **メソッド:** 
    * POST
* **パラメータ:** 
    * リクエストボディ: 新規追加するボードゲームの情報（JSON形式）
        ```json
        {
            "title_kana": (string),
            "title": (string),
            "genre": (string[]),
            "tags": (string[]),
            "images": (string[]),
            "description": (string),
            "rules": (string),
            "playerCount": {
                "min": (integer),
                "max": (integer),
                "text": (string)
            },
            "playTime": {
                "min": (integer),
                "max": (integer),
                "text": (string)
            },
            "age": {
                "min": (integer),
                "text": (string)
            },
            "difficulty": (string),
            "recommendation": (number),
            "arrivalDate": (string)
        }
        ```
    * id はサーバーで採番（使用済み最大整数ID+1）
* **レスポンス:** 
    * 成功時
        * ステータスコード: 201 Created
        * Content-Type: `application/json`
        * レスポンスボディ: 作成されたボードゲームの情報（JSON形式）
            ```json
            {
                "id": (integer),
                "title_kana": (string),
                "title": (string),
                "genre": (string[]),
                "tags": (string[]),
                "images": (string[]),
                "description": (string),
                "rules": (string),
                "playerCount": {
                    "min": (integer),
                    "max": (integer),
                    "text": (string)
                },
                "playTime": {
                    "min": (integer),
                    "max": (integer),
                    "text": (string)
                },
                "age": {
                    "min": (integer),
                    "text": (string)
                },
                "difficulty": (string),
                "recommendation": (number),
                "arrivalDate": (string),
                "created": (string),
                "lastModified": (string)
            }
            ```
    * 失敗時
        * サーバー側で予期せぬエラーが発生した場合
            * ステータスコード: 500 Internal Server Error
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Internal server error"
                }
                ```

#### 2.4. ボードゲーム更新API

* **エンドポイント:** 
    * `PUT /boardgames/{id}`
* **メソッド:** 
    * PUT
* **パラメータ:** 
    * `id` (path): 更新したいボードゲームのID (integer)
    * リクエストボディ: 更新するボードゲームの情報（JSON形式）
        ```json
        {
            "title_kana": (string),
            "title": (string),
            "genre": (string[]),
            "tags": (string[]),
            "images": (string[]),
            "description": (string),
            "rules": (string),
            "playerCount": {
                "min": (integer),
                "max": (integer),
                "text": (string)
            },
            "playTime": {
                "min": (integer),
                "max": (integer),
                "text": (string)
            },
            "age": {
                "min": (integer),
                "text": (string)
            },
            "difficulty": (string),
            "recommendation": (number),
            "arrivalDate": (string)
        }
        ```
* **レスポンス:** 
    * 成功時
        * ステータスコード: 200 OK
        * Content-Type: `application/json`
        * レスポンスボディ: 更新されたボードゲームの情報（JSON形式）
            ```json
            {
                "id": (integer),
                "title_kana": (string),
                "title": (string),
                "genre": (string[]),
                "tags": (string[]),
                "images": (string[]),
                "description": (string),
                "rules": (string),
                "playerCount": {
                    "min": (integer),
                    "max": (integer),
                    "text": (string)
                },
                "playTime": {
                    "min": (integer),
                    "max": (integer),
                    "text": (string)
                },
                "age": {
                    "min": (integer),
                    "text": (string)
                },
                "difficulty": (string),
                "recommendation": (number),
                "arrivalDate": (string),
                "created": (string),
                "lastModified": (string)
            }
            ```
    * 失敗時
        * 指定されたIDのボードゲームが存在しない場合
            * ステータスコード: 404 Not Found
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Board game not found"
                }
                ```
        * リクエストボディが無効な場合
            * ステータスコード: 400 Bad Request
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Invalid key: {key}"
                }
                ```
                ```json
                {
                    "error": "Invalid data type: {data_type}"
                }
                ```
                ```json
                {
                    "error": "Missing required element in {key}: {element}"
                }
                ```
                ```json
                {
                    "error": "Invalid data type. Expected {valid_types}"
                }
                ```
        * サーバー側で予期せぬエラーが発生した場合
            * ステータスコード: 500 Internal Server Error
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Internal server error"
                }
                ```

#### 2.5. ボードゲーム削除API

* **エンドポイント:** 
    * `DELETE /boardgames/{id}`
* **メソッド:** 
    * DELETE
* **パラメータ:** 
    * `id` (path): 削除したいボードゲームのID (integer)
* **レスポンス:** 
    * 成功時
        * ステータスコード: 200 OK
        * Content-Type: `application/json`
        * レスポンスボディ:
            ```json
            {
                "message": "Board game deleted"
            }
            ```
    * 失敗時
        * 指定されたIDのボードゲームが存在しない場合
            * ステータスコード: 404 Not Found
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Board game not found"
                }
                ```
        * サーバー側で予期せぬエラーが発生した場合
            * ステータスコード: 500 Internal Server Error
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Internal server error"
                }
                ```

#### 2.6. 画像アップロード用Presigned URL取得API

* **エンドポイント:** 
    * `POST /boardgames/presigned-url`
* **メソッド:** 
    * POST
* **パラメータ:** 
    * リクエストボディ: Presigned URLを取得するための情報（JSON形式）
        ```json
        {
            "fileName": (string),
            "contentType": (string)
        }
        ```
        * fileName が空のときは UUID で自動設定
        * 許可される contentType は以下の形式のみ
          * "image/*"
* **レスポンス:** 
    * 成功時
        * ステータスコード: 200 OK
        * Content-Type: `application/json`
        * レスポンスボディ: Presigned URL（JSON形式）
            ```json
            {
                "presignedUrl": (string),
                "path": (string),
                "message": (string)
            }
            ```
    * 失敗時
        * ファイル名が既に存在する場合
            * ステータスコード: 400 Bad Request
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "File name already exists in S3 (last modified: {timestamp})"
                }
                ```
        * contentType が無効な場合
            * ステータスコード: 400 Bad Request
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Invalid content type (image/*)"
                }
                ```
        * サーバー側で予期せぬエラーが発生した場合
            * ステータスコード: 500 Internal Server Error
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Internal server error"
                }
                ```

#### 2.7. ログインAPI

* **エンドポイント:** 
    * `POST /login`
* **メソッド:** 
    * POST
* **パラメータ:** 
    * リクエストヘッダー: Basic認証情報（Base64エンコードされたユーザー名とパスワード）
      * 例
        ```
        "Authorization": "Basic XXXXXXXXXXXXXXXXXXXX"
        ```
* **レスポンス:** 
    * 成功時
        * ステータスコード: 200 OK
        * Content-Type: `application/json`
        * レスポンスボディ: ログイン結果と管理者フラグ（JSON形式）
            ```json
            {
                "login": "OK",
                "isAdmin": true
            }
            ```
    * 失敗時
        * 認証情報が無効な場合
            * ステータスコード: 401 Unauthorized
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "login": "NG",
                    "isAdmin": false
                }
                ```
        * サーバー側で予期せぬエラーが発生した場合
            * ステータスコード: 500 Internal Server Error
            * Content-Type: `application/json`
            * レスポンスボディ:
                ```json
                {
                    "error": "Internal server error"
                }
                ```

### 3. 認証・認可

* クレデンシャルな情報は提供しないが、ランダムなアクセスを防ぐためにAPIキーをHTTPヘッダーに設定する。
  * 例： `X-Api-Key: YOUR_API_KEY`
* 追加、更新、削除、画像アップロード用URL取得APIについて、管理者のみのアクセスを許可する。
  * リクエストヘッダー: Basic認証情報（Base64エンコードされたユーザー名とパスワード）
    * 例
      ```
      "Authorization": "Basic XXXXXXXXXXXXXXXXXXXX"
      ```
* 認証情報が無効な場合、401 Unauthorized を返す。

### 4. その他の考慮事項

* エラーハンドリング: 発生しうるエラーを適切に処理し、エラーメッセージを返す
* パフォーマンス: DynamoDBへのクエリを最適化し、レスポンス時間を短縮する
* キャッシング: 動的なコンテンツではあるが、基本的には更新されないため、ある程度の期間CloudFrontディストリビューションでキャッシングを行い、レスポンス時間を短縮し、DynamoDBへの負荷を軽減する

### 5. 技術スタック例

* バックエンド: Python 3
* データベース: DynamoDB
* AWS Lambda