#!/bin/bash

# ============================================================
# Airwallex KYC Account Update — curl command
# POST /api/v1/accounts/{airwallexId}/update
# ============================================================

AIRWALLEX_API_URL="https://api-demo.airwallex.com"   # or https://api.airwallex.com for production
ACCESS_TOKEN="<your_bearer_token>"
AIRWALLEX_ID="<airwallex_account_id>"

# File IDs (upload files first via /api/v1/files/upload)
FRONT_FILE_ID="<front_document_file_id>"
BACK_FILE_ID="<back_document_file_id>"       # optional — not needed for PASSPORT
POA_FILE_ID="<proof_of_address_file_id>"
SELFIE_FILE_ID="<selfie_file_id>"

curl -X POST "$AIRWALLEX_API_URL/api/v1/accounts/$AIRWALLEX_ID/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "account_details": {
      "legal_entity_type": "INDIVIDUAL",
      "individual_details": {
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "1990-01-15",
        "nationality": "IL",
        "live_selfie_file_id": "'"$SELFIE_FILE_ID"'",
        "residential_address": {
          "address_line1": "123 Main Street",
          "country_code": "IL",
          "postcode": "12345",
          "state": "Tel Aviv",
          "suburb": "Tel Aviv"
        },
        "identifications": {
          "primary": {
            "identification_type": "PERSONAL_ID",
            "issuing_country_code": "IL",
            "personal_id": {
              "front_file_id": "'"$FRONT_FILE_ID"'",
              "back_file_id": "'"$BACK_FILE_ID"'"
            }
          }
        },
        "attachments": {
          "individual_documents": [
            {
              "file_id": "'"$POA_FILE_ID"'",
              "tag": "PROOF_OF_ADDRESS"
            }
          ]
        },
        "account_usage": {
          "card_usage": ["PERSONAL"],
          "collection_country_codes": ["IL"],
          "collection_from": ["SALARY"],
          "payout_country_codes": ["IL"],
          "payout_to": ["SELF"],
          "product_reference": ["BORDERLESS_CARD"],
          "expected_monthly_transaction_volume": {
            "currency": "ILS",
            "amount": "5000"
          }
        },
        "has_member_holding_public_office": false,
        "has_prior_financial_institution_refusal": false
      }
    }
  }'

# ============================================================
# PASSPORT variant — replace identifications block with:
# "identifications": {
#   "primary": {
#     "identification_type": "PASSPORT",
#     "issuing_country_code": "IL",
#     "passport": {
#       "front_file_id": "<front_file_id>"
#     }
#   }
# }
#
# DRIVERS_LICENSE variant — replace identifications block with:
# "identifications": {
#   "primary": {
#     "identification_type": "DRIVERS_LICENSE",
#     "issuing_country_code": "IL",
#     "drivers_license": {
#       "front_file_id": "<front_file_id>",
#       "back_file_id": "<back_file_id>"
#     }
#   }
# }
# ============================================================

# ============================================================
# After a successful update, submit the account for KYC review:
# POST /api/v1/accounts/{airwallexId}/submit
# ============================================================

# curl -X POST "$AIRWALLEX_API_URL/api/v1/accounts/$AIRWALLEX_ID/submit" \
#   -H "Authorization: Bearer $ACCESS_TOKEN"
