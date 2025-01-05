variable "aws_region" {
  type        = string
  description = "The AWS region to put the bucket into"
  default     = "ap-northeast-1"

  validation {
    condition = contains(
      ["us-east-1", "us-east-2", "us-west-1", "us-west-2", "eu-west-1", "eu-west-2", "eu-central-1", "ap-northeast-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2", "ap-south-1", "sa-east-1"],
      var.aws_region
    )
    error_message = "Invalid AWS region"
  }
}

variable "aws_profile" {
  type        = string
  description = "The AWS profile to use for the Terraform run"
  default     = "default"
}

variable "site_domain" {
  type        = string
  description = "The domain name to use for the static site"

  validation {
    condition     = can(regex("^[a-z0-9.-]+$", var.site_domain))
    error_message = "Invalid domain name"
  }
}

variable "alternate_domain_names" {
  type        = list(string)
  description = "Alternate domain names for the CloudFront distribution"
  default     = []
}

variable "geo_restriction_locations" {
  type        = list(string)
  description = "The list of countries to whitelist for the CloudFront distribution"
  default     = ["JP"]

  validation {
    condition     = alltrue([for location in var.geo_restriction_locations : contains(["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"], location)])
    error_message = "Invalid country code"
  }
}

variable "acm_certificate_arn" {
  type        = string
  description = "The ARN of the ACM certificate to use for the CloudFront distribution"

  validation {
    condition     = can(regex("^arn:aws:acm:[a-z0-9-]+:[0-9]+:certificate/[a-f0-9-]+$", var.acm_certificate_arn))
    error_message = "Invalid ACM certificate ARN"
  }
}

variable "dynamodb_table_name" {
  type        = string
  description = "The name of the DynamoDB table to store board game data"
  default     = "BoardGamesTable"
}

variable "cloudfront_logs_bucket_name" {
  type        = string
  description = "The name of the S3 bucket for CloudFront logs"
}

variable "admin_auth_username" {
  type        = string
  description = "The username for the admin authentication"
  default     = "admin"
}

variable "admin_auth_password" {
  type        = string
  description = "The password for the admin authentication"
  sensitive   = true
}

variable "aws_account_id" {
  type        = string
  description = "The AWS account ID"
}

variable "lambda_function_name" {
  type        = string
  description = "The name of the Lambda function"
  default     = "image-resizer"
}
