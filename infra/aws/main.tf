# Optional reference only. No resources have been provisioned.
# This is an audit foundation, NOT the complete production architecture.
terraform {
  required_version = ">= 1.6.0, < 2.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project = "trust-by-design-independent-study"
      Scope   = "optional-audit-foundation"
    }
  }
}

variable "region" {
  description = "Candidate region; verify all services and the account's restrictions before use."
  type        = string
  default     = "us-east-1"
}

variable "name" {
  description = "Globally unique S3-compatible prefix; no account or personal information."
  type        = string
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{5,35}[a-z0-9]$", var.name))
    error_message = "Use 7–37 lowercase letters, digits or hyphens; start with a letter and end with a letter or digit."
  }
}

resource "aws_sqs_queue" "dead_letter" {
  name                       = "${var.name}-audit-dlq"
  message_retention_seconds  = 1209600
  sqs_managed_sse_enabled    = true
}

resource "aws_sqs_queue" "audit" {
  name                       = "${var.name}-audit"
  message_retention_seconds  = 345600
  visibility_timeout_seconds = 60
  receive_wait_time_seconds  = 20
  sqs_managed_sse_enabled    = true
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dead_letter.arn
    maxReceiveCount     = 5
  })
}

resource "aws_sqs_queue_redrive_allow_policy" "audit" {
  queue_url = aws_sqs_queue.dead_letter.id
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue"
    sourceQueueArns   = [aws_sqs_queue.audit.arn]
  })
}

resource "aws_s3_bucket" "audit" {
  bucket        = "${var.name}-audit"
  force_destroy = false
}

resource "aws_s3_bucket_public_access_block" "audit" {
  bucket                  = aws_s3_bucket.audit.id
  block_public_acls        = true
  block_public_policy      = true
  ignore_public_acls       = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "audit" {
  bucket = aws_s3_bucket.audit.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "audit" {
  bucket = aws_s3_bucket.audit.id
  rule {
    id     = "illustrative-30-day-retention"
    status = "Enabled"
    filter {}
    expiration {
      days = 30
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

resource "aws_s3_bucket_policy" "tls_only" {
  bucket = aws_s3_bucket.audit.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "DenyInsecureTransport"
      Effect    = "Deny"
      Principal = "*"
      Action    = "s3:*"
      Resource  = [aws_s3_bucket.audit.arn, "${aws_s3_bucket.audit.arn}/*"]
      Condition = { Bool = { "aws:SecureTransport" = "false" } }
    }]
  })
}

resource "aws_cloudwatch_log_group" "reference" {
  name              = "/trust-by-design/${var.name}"
  retention_in_days = 14
}

output "audit_queue_url" {
  value = aws_sqs_queue.audit.url
}

output "audit_bucket_name" {
  value = aws_s3_bucket.audit.bucket
}
