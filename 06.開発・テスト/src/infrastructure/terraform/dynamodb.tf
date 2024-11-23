resource "aws_dynamodb_table" "board_games" {
  name         = var.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }

  attribute {
    name = "title"
    type = "S"
  }

  attribute {
    name = "title_kana"
    type = "S"
  }

  global_secondary_index {
    name            = "title-index"
    hash_key        = "title"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "title_kana-index"
    hash_key        = "title_kana"
    projection_type = "ALL"
  }
}
