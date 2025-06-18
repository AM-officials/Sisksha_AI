# Supabase Database Reference

## Authentication & Role System (Summary)

- **User roles** are managed via the `auth.users` table's `user_metadata.role` field. Roles include `student`, `teacher`, `school`, and `superadmin`.
- **Schools** and **teachers** have dedicated tables (`public.schools`, `public.teachers`) linked to `auth.users` by `id` (UUID).
- **Automatic profile creation**: When a new user with role `school` or `teacher` is created, triggers (`handle_new_school`, `handle_new_teacher`) automatically insert a row into the corresponding table.
- **RLS (Row Level Security)**: Policies restrict access so users can only view/update their own profiles, and schools can manage their teachers.
- **Teacher creation**: Teachers are created by schools via a backend API (`/api/create-teacher`) using the Supabase service role key for security.
- **Password reset**: All users can request password resets via Supabase; rate limits apply.

---

1. List All Tables and Views
[
  {
    "table_schema": "auth",
    "table_name": "audit_log_entries",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "instances",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_amr_claims",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_challenges",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "one_time_tokens",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "saml_relay_states",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "schema_migrations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "sso_domains",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "sso_providers",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "auth",
    "table_name": "users",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "extensions",
    "table_name": "pg_stat_statements",
    "table_type": "VIEW"
  },
  {
    "table_schema": "extensions",
    "table_name": "pg_stat_statements_info",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "achievements",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "daily_stats",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "flashcards",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "missed_streak_days",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "notes",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "profiles",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "quests",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "streak_logs",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "study_sessions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "syllabi",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "syllabus_topics",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "usage_stats",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_achievements",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_daily_generation_counts",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "user_quests",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "realtime",
    "table_name": "messages",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "realtime",
    "table_name": "schema_migrations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "storage",
    "table_name": "buckets",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "storage",
    "table_name": "migrations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "storage",
    "table_name": "objects",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "storage",
    "table_name": "s3_multipart_uploads",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "storage",
    "table_name": "s3_multipart_uploads_parts",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "supabase_migrations",
    "table_name": "schema_migrations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "vault",
    "table_name": "decrypted_secrets",
    "table_type": "VIEW"
  },
  {
    "table_schema": "vault",
    "table_name": "secrets",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "materials",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_scores",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "storage_usage",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "settings",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "announcements",
    "table_type": "BASE TABLE"
  }
]
2. Show All Columns and Data Types
[
  {
    "table_schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "instance_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "payload",
    "data_type": "json",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "audit_log_entries",
    "column_name": "ip_address",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": "''::character varying"
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "auth_code",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "code_challenge_method",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "code_challenge",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "provider_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "provider_access_token",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "provider_refresh_token",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "authentication_method",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "flow_state",
    "column_name": "auth_code_issued_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "column_name": "provider_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "column_name": "identity_data",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "column_name": "provider",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "column_name": "last_sign_in_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "identities",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_schema": "auth",
    "table_name": "instances",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "instances",
    "column_name": "uuid",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "instances",
    "column_name": "raw_base_config",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "instances",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "instances",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "session_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "authentication_method",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_amr_claims",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "factor_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "verified_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "ip_address",
    "data_type": "inet",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "otp_code",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_challenges",
    "column_name": "web_authn_session_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "friendly_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "factor_type",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "status",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "secret",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "last_challenged_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "web_authn_credential",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "mfa_factors",
    "column_name": "web_authn_aaguid",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "token_type",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "token_hash",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "relates_to",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "created_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "auth",
    "table_name": "one_time_tokens",
    "column_name": "updated_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "instance_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": "nextval('auth.refresh_tokens_id_seq'::regclass)"
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "token",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "user_id",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "revoked",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "parent",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "refresh_tokens",
    "column_name": "session_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "column_name": "sso_provider_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "column_name": "entity_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "column_name": "metadata_xml",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "column_name": "metadata_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "column_name": "attribute_mapping",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_providers",
    "column_name": "name_id_format",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "sso_provider_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "request_id",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "for_email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "redirect_to",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "saml_relay_states",
    "column_name": "flow_state_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "schema_migrations",
    "column_name": "version",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "factor_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "aal",
    "data_type": "USER-DEFINED",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "not_after",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "refreshed_at",
    "data_type": "timestamp without time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "user_agent",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "ip",
    "data_type": "inet",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "auth",
    "table_name": "sessions",
    "column_name": "tag",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "column_name": "logo_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "column_name": "address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "column_name": "contact_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "column_name": "principal_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "column_name": "academic_calendar",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "column_name": "created_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "schools",
    "column_name": "updated_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "column_name": "subjects",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "column_name": "classrooms",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "column_name": "profile_image_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "column_name": "created_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "teachers",
    "column_name": "updated_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "class_teacher_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "subject_teachers",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "analytics",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb"
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "created_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "updated_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "classroom_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "profile",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb"
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "created_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "updated_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "column_name": "teacher_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "column_name": "title",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "column_name": "type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "column_name": "metadata",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "column_name": "created_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "materials",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "materials",
    "column_name": "teacher_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "materials",
    "column_name": "title",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "materials",
    "column_name": "type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "materials",
    "column_name": "url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "materials",
    "column_name": "metadata",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "materials",
    "column_name": "created_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_scores",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_scores",
    "column_name": "quiz_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_scores",
    "column_name": "student_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_scores",
    "column_name": "score",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_scores",
    "column_name": "graded",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_scores",
    "column_name": "submitted_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "sender_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "receiver_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "subject",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "body",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "sent_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "column_name": "classroom_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "column_name": "teacher_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "column_name": "topic",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "column_name": "scheduled_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "column_name": "duration_minutes",
    "data_type": "int",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "column_name": "created_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "column_name": "amount",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "column_name": "date",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "column_name": "metadata",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "column_name": "created_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "storage_usage",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "storage_usage",
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "storage_usage",
    "column_name": "used_bytes",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "storage_usage",
    "column_name": "file_count",
    "data_type": "int",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "storage_usage",
    "column_name": "timestamp",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "settings",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "settings",
    "column_name": "key",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "settings",
    "column_name": "value",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "settings",
    "column_name": "updated_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "announcements",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "announcements",
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "announcements",
    "column_name": "message",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_schema": "public",
    "table_name": "announcements",
    "column_name": "created_at",
    "data_type": "timestamptz",
    "is_nullable": "YES",
    "column_default": null
  }
]
3. Show All Foreign Keys and Relationships
[
  {
    "table_schema": "public",
    "table_name": "flashcards",
    "column_name": "topic_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "syllabus_topics",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "missed_streak_days",
    "column_name": "user_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "notes",
    "column_name": "topic_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "syllabus_topics",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "notes",
    "column_name": "syllabus_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "syllabi",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "quests",
    "column_name": "next_quest_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "quests",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "column_name": "topic_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "syllabus_topics",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "column_name": "topic_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "syllabus_topics",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "streak_logs",
    "column_name": "user_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "syllabus_topics",
    "column_name": "syllabus_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "syllabi",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "user_achievements",
    "column_name": "achievement_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "achievements",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "user_achievements",
    "column_name": "user_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "user_quests",
    "column_name": "quest_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "quests",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "school_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "schools",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "classrooms",
    "column_name": "class_teacher_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "teachers",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "school_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "schools",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "students",
    "column_name": "classroom_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "classrooms",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "column_name": "teacher_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "teachers",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "materials",
    "column_name": "teacher_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "teachers",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_scores",
    "column_name": "quiz_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "quizzes",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_scores",
    "column_name": "student_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "students",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "sender_id",
    "foreign_table_schema": "auth",
    "foreign_table_name": "users",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "messages",
    "column_name": "receiver_id",
    "foreign_table_schema": "auth",
    "foreign_table_name": "users",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "column_name": "classroom_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "classrooms",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "class_sessions",
    "column_name": "teacher_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "teachers",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "column_name": "school_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "schools",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "storage_usage",
    "column_name": "school_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "schools",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "settings",
    "column_name": "id",
    "foreign_table_schema": "public",
    "foreign_table_name": "schools",
    "foreign_column_name": "id"
  },
  {
    "table_schema": "public",
    "table_name": "announcements",
    "column_name": "school_id",
    "foreign_table_schema": "public",
    "foreign_table_name": "schools",
    "foreign_column_name": "id"
  }
]
4. Show All RLS Policies
[
  {
    "policyname": "Anyone can view achievements",
    "schemaname": "public",
    "tablename": "achievements",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{anon,authenticated}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can insert their own stats",
    "schemaname": "public",
    "tablename": "daily_stats",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "policyname": "Users can update their own stats",
    "schemaname": "public",
    "tablename": "daily_stats",
    "cmd": "UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can view their own stats",
    "schemaname": "public",
    "tablename": "daily_stats",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can create flashcards",
    "schemaname": "public",
    "tablename": "flashcards",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": null,
    "with_check": "true"
  },
  {
    "policyname": "Users can delete flashcards",
    "schemaname": "public",
    "tablename": "flashcards",
    "cmd": "DELETE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can update flashcards",
    "schemaname": "public",
    "tablename": "flashcards",
    "cmd": "UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can view all flashcards",
    "schemaname": "public",
    "tablename": "flashcards",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can insert their missed days",
    "schemaname": "public",
    "tablename": "missed_streak_days",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": null,
    "with_check": "((auth.uid() = user_id) AND (missed_date = (CURRENT_DATE - '1 day'::interval)))"
  },
  {
    "policyname": "Users can read their missed days",
    "schemaname": "public",
    "tablename": "missed_streak_days",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can update their missed days",
    "schemaname": "public",
    "tablename": "missed_streak_days",
    "cmd": "UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can delete notes of their syllabi",
    "schemaname": "public",
    "tablename": "notes",
    "cmd": "DELETE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(EXISTS ( SELECT 1\n   FROM syllabi\n  WHERE ((syllabi.id = notes.syllabus_id) AND (syllabi.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "policyname": "Users can insert notes to their syllabi",
    "schemaname": "public",
    "tablename": "notes",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM syllabi\n  WHERE ((syllabi.id = notes.syllabus_id) AND (syllabi.user_id = auth.uid()))))"
  },
  {
    "policyname": "Users can update notes of their syllabi",
    "schemaname": "public",
    "tablename": "notes",
    "cmd": "UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(EXISTS ( SELECT 1\n   FROM syllabi\n  WHERE ((syllabi.id = notes.syllabus_id) AND (syllabi.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "policyname": "Users can view notes of their syllabi",
    "schemaname": "public",
    "tablename": "notes",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(EXISTS ( SELECT 1\n   FROM syllabi\n  WHERE ((syllabi.id = notes.syllabus_id) AND (syllabi.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "policyname": "Public profiles read access for leaderboards",
    "schemaname": "public",
    "tablename": "profiles",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can update their own profile",
    "schemaname": "public",
    "tablename": "profiles",
    "cmd": "UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "policyname": "Users can view their own profile",
    "schemaname": "public",
    "tablename": "profiles",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "policyname": "Users can create quiz questions",
    "schemaname": "public",
    "tablename": "quiz_questions",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": null,
    "with_check": "true"
  },
  {
    "policyname": "Users can delete quiz questions",
    "schemaname": "public",
    "tablename": "quiz_questions",
    "cmd": "DELETE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can update quiz questions",
    "schemaname": "public",
    "tablename": "quiz_questions",
    "cmd": "UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can view all quiz questions",
    "schemaname": "public",
    "tablename": "quiz_questions",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Enable insert for authenticated users only",
    "schemaname": "public",
    "tablename": "streak_logs",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "((auth.uid() = user_id) AND ((login_date = CURRENT_DATE) OR (login_date = (CURRENT_DATE - '1 day'::interval)) OR (EXISTS ( SELECT 1\n   FROM missed_streak_days\n  WHERE ((missed_streak_days.user_id = auth.uid()) AND (missed_streak_days.missed_date = streak_logs.login_date))))))"
  },
  {
    "policyname": "Public streak logs read access for leaderboards",
    "schemaname": "public",
    "tablename": "streak_logs",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can insert their own streak logs",
    "schemaname": "public",
    "tablename": "streak_logs",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "((auth.uid() = user_id) AND ((login_date = CURRENT_DATE) OR (login_date = (CURRENT_DATE - '1 day'::interval)) OR (EXISTS ( SELECT 1\n   FROM missed_streak_days\n  WHERE ((missed_streak_days.user_id = auth.uid()) AND (missed_streak_days.missed_date = streak_logs.login_date))))))"
  },
  {
    "policyname": "Users can view their own streak logs",
    "schemaname": "public",
    "tablename": "streak_logs",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can delete their own syllabi",
    "schemaname": "public",
    "tablename": "syllabi",
    "cmd": "DELETE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can insert their own syllabi",
    "schemaname": "public",
    "tablename": "syllabi",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "policyname": "Users can update their own syllabi",
    "schemaname": "public",
    "tablename": "syllabi",
    "cmd": "UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "policyname": "Users can view their own syllabi",
    "schemaname": "public",
    "tablename": "syllabi",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can delete topics of their syllabi",
    "schemaname": "public",
    "tablename": "syllabus_topics",
    "cmd": "DELETE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(EXISTS ( SELECT 1\n   FROM syllabi\n  WHERE ((syllabi.id = syllabus_topics.syllabus_id) AND (syllabi.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "policyname": "Users can insert topics to their syllabi",
    "schemaname": "public",
    "tablename": "syllabus_topics",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM syllabi\n  WHERE ((syllabi.id = syllabus_topics.syllabus_id) AND (syllabi.user_id = auth.uid()))))"
  },
  {
    "policyname": "Users can update topics of their syllabi",
    "schemaname": "public",
    "tablename": "syllabus_topics",
    "cmd": "UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(EXISTS ( SELECT 1\n   FROM syllabi\n  WHERE ((syllabi.id = syllabus_topics.syllabus_id) AND (syllabi.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "policyname": "Users can view topics of their syllabi",
    "schemaname": "public",
    "tablename": "syllabus_topics",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(EXISTS ( SELECT 1\n   FROM syllabi\n  WHERE ((syllabi.id = syllabus_topics.syllabus_id) AND (syllabi.user_id = auth.uid()))))",
    "with_check": null
  },
  {
    "policyname": "Public usage stats read access for leaderboards",
    "schemaname": "public",
    "tablename": "usage_stats",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can only access their own usage stats",
    "schemaname": "public",
    "tablename": "usage_stats",
    "cmd": "ALL",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Public user achievements read access for leaderboards",
    "schemaname": "public",
    "tablename": "user_achievements",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Users can view their own achievements",
    "schemaname": "public",
    "tablename": "user_achievements",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Users can only access their own quest data",
    "schemaname": "public",
    "tablename": "user_quests",
    "cmd": "ALL",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "policyname": "Anyone can view avatars",
    "schemaname": "storage",
    "tablename": "objects",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "qual": "(bucket_id = 'avatars'::text)",
    "with_check": null
  },
  {
    "policyname": "Users can upload their own avatar",
    "schemaname": "storage",
    "tablename": "objects",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))"
  },
  {
    "policyname": "Superadmin can do everything on schools",
    "schemaname": "public",
    "tablename": "schools",
    "cmd": "ALL",
    "permissive": "PERMISSIVE",
    "roles": "{superadmin}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "School can view/update own profile",
    "schemaname": "public",
    "tablename": "schools",
    "cmd": "SELECT, UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{school}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Teachers can view their school",
    "schemaname": "public",
    "tablename": "schools",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{teacher}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Superadmin can do everything on teachers",
    "schemaname": "public",
    "tablename": "teachers",
    "cmd": "ALL",
    "permissive": "PERMISSIVE",
    "roles": "{superadmin}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Teachers can view/update own profile",
    "schemaname": "public",
    "tablename": "teachers",
    "cmd": "SELECT, UPDATE",
    "permissive": "PERMISSIVE",
    "roles": "{teacher}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Schools can view/manage their teachers",
    "schemaname": "public",
    "tablename": "teachers",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{school}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Schools can view/manage their classrooms",
    "schemaname": "public",
    "tablename": "classrooms",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{school}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Teachers can view their classrooms",
    "schemaname": "public",
    "tablename": "classrooms",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{teacher}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Students can view their classroom",
    "schemaname": "public",
    "tablename": "classrooms",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{student}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Only sender or receiver can view a message",
    "schemaname": "public",
    "tablename": "messages",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{sender, receiver}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Only sender can insert (send) a message",
    "schemaname": "public",
    "tablename": "messages",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{sender}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Only sender can delete their sent messages",
    "schemaname": "public",
    "tablename": "messages",
    "cmd": "DELETE",
    "permissive": "PERMISSIVE",
    "roles": "{sender}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Only sender or receiver can view a message",
    "schemaname": "public",
    "tablename": "messages",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{sender, receiver}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Only sender can insert (send) a message",
    "schemaname": "public",
    "tablename": "messages",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{sender}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Only sender can delete their sent messages",
    "schemaname": "public",
    "tablename": "messages",
    "cmd": "DELETE",
    "permissive": "PERMISSIVE",
    "roles": "{sender}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Only sender or receiver can view a message",
    "schemaname": "public",
    "tablename": "messages",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{sender, receiver}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Only sender can insert (send) a message",
    "schemaname": "public",
    "tablename": "messages",
    "cmd": "INSERT",
    "permissive": "PERMISSIVE",
    "roles": "{sender}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Only sender can delete their sent messages",
    "schemaname": "public",
    "tablename": "messages",
    "cmd": "DELETE",
    "permissive": "PERMISSIVE",
    "roles": "{sender}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Anyone can view transactions",
    "schemaname": "public",
    "tablename": "transactions",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Superadmin can view all transactions",
    "schemaname": "public",
    "tablename": "transactions",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{superadmin}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "School can view transactions",
    "schemaname": "public",
    "tablename": "transactions",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{school}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Anyone can view storage usage",
    "schemaname": "public",
    "tablename": "storage_usage",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Superadmin can view all storage usage",
    "schemaname": "public",
    "tablename": "storage_usage",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{superadmin}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "School can view storage usage",
    "schemaname": "public",
    "tablename": "storage_usage",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{school}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Anyone can view settings",
    "schemaname": "public",
    "tablename": "settings",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Superadmin can view all settings",
    "schemaname": "public",
    "tablename": "settings",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{superadmin}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "School can view settings",
    "schemaname": "public",
    "tablename": "settings",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{school}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Anyone can view announcements",
    "schemaname": "public",
    "tablename": "announcements",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "Superadmin can view all announcements",
    "schemaname": "public",
    "tablename": "announcements",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{superadmin}",
    "qual": "true",
    "with_check": null
  },
  {
    "policyname": "School can view announcements",
    "schemaname": "public",
    "tablename": "announcements",
    "cmd": "SELECT",
    "permissive": "PERMISSIVE",
    "roles": "{school}",
    "qual": "true",
    "with_check": null
  }
]
5. Show All Functions
[
  {
    "routine_schema": "auth",
    "routine_name": "email",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "auth",
    "routine_name": "jwt",
    "routine_type": "FUNCTION",
    "data_type": "jsonb"
  },
  {
    "routine_schema": "auth",
    "routine_name": "role",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "auth",
    "routine_name": "uid",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "armor",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "armor",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "crypt",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "dearmor",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "decrypt",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "decrypt_iv",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "digest",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "digest",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "encrypt",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "encrypt_iv",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "gen_random_bytes",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "gen_random_uuid",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "gen_salt",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "gen_salt",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "grant_pg_cron_access",
    "routine_type": "FUNCTION",
    "data_type": "event_trigger"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "grant_pg_graphql_access",
    "routine_type": "FUNCTION",
    "data_type": "event_trigger"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "grant_pg_net_access",
    "routine_type": "FUNCTION",
    "data_type": "event_trigger"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "hmac",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "hmac",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pg_stat_statements",
    "routine_type": "FUNCTION",
    "data_type": "record"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pg_stat_statements_info",
    "routine_type": "FUNCTION",
    "data_type": "record"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pg_stat_statements_reset",
    "routine_type": "FUNCTION",
    "data_type": "void"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_armor_headers",
    "routine_type": "FUNCTION",
    "data_type": "record"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_key_id",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_decrypt",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_decrypt",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_decrypt",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_decrypt_bytea",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_decrypt_bytea",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_decrypt_bytea",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_encrypt",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_encrypt",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_encrypt_bytea",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_pub_encrypt_bytea",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_sym_decrypt",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_sym_decrypt",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_sym_decrypt_bytea",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_sym_decrypt_bytea",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_sym_encrypt",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_sym_encrypt",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_sym_encrypt_bytea",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgp_sym_encrypt_bytea",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgrst_ddl_watch",
    "routine_type": "FUNCTION",
    "data_type": "event_trigger"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "pgrst_drop_watch",
    "routine_type": "FUNCTION",
    "data_type": "event_trigger"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "set_graphql_placeholder",
    "routine_type": "FUNCTION",
    "data_type": "event_trigger"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_generate_v1",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_generate_v1mc",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_generate_v3",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_generate_v4",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_generate_v5",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_nil",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_ns_dns",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_ns_oid",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_ns_url",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "extensions",
    "routine_name": "uuid_ns_x500",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "graphql",
    "routine_name": "_internal_resolve",
    "routine_type": "FUNCTION",
    "data_type": "jsonb"
  },
  {
    "routine_schema": "graphql",
    "routine_name": "comment_directive",
    "routine_type": "FUNCTION",
    "data_type": "jsonb"
  },
  {
    "routine_schema": "graphql",
    "routine_name": "exception",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "graphql",
    "routine_name": "get_schema_version",
    "routine_type": "FUNCTION",
    "data_type": "integer"
  },
  {
    "routine_schema": "graphql",
    "routine_name": "increment_schema_version",
    "routine_type": "FUNCTION",
    "data_type": "event_trigger"
  },
  {
    "routine_schema": "graphql",
    "routine_name": "resolve",
    "routine_type": "FUNCTION",
    "data_type": "jsonb"
  },
  {
    "routine_schema": "graphql_public",
    "routine_name": "graphql",
    "routine_type": "FUNCTION",
    "data_type": "jsonb"
  },
  {
    "routine_schema": "pgbouncer",
    "routine_name": "get_auth",
    "routine_type": "FUNCTION",
    "data_type": "record"
  },
  {
    "routine_schema": "public",
    "routine_name": "calculate_level",
    "routine_type": "FUNCTION",
    "data_type": "integer"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_user_signup",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "public",
    "routine_name": "increment_flashcards_generated",
    "routine_type": "FUNCTION",
    "data_type": "void"
  },
  {
    "routine_schema": "public",
    "routine_name": "increment_notes_generated",
    "routine_type": "FUNCTION",
    "data_type": "void"
  },
  {
    "routine_schema": "public",
    "routine_name": "increment_quizzes_given",
    "routine_type": "FUNCTION",
    "data_type": "void"
  },
  {
    "routine_schema": "public",
    "routine_name": "update_updated_at_column",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "apply_rls",
    "routine_type": "FUNCTION",
    "data_type": "USER-DEFINED"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "broadcast_changes",
    "routine_type": "FUNCTION",
    "data_type": "void"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "build_prepared_statement_sql",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "cast",
    "routine_type": "FUNCTION",
    "data_type": "jsonb"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "check_equality_op",
    "routine_type": "FUNCTION",
    "data_type": "boolean"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "is_visible_through_filters",
    "routine_type": "FUNCTION",
    "data_type": "boolean"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "list_changes",
    "routine_type": "FUNCTION",
    "data_type": "USER-DEFINED"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "quote_wal2json",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "send",
    "routine_type": "FUNCTION",
    "data_type": "void"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "subscription_check_filters",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "to_regrole",
    "routine_type": "FUNCTION",
    "data_type": "regrole"
  },
  {
    "routine_schema": "realtime",
    "routine_name": "topic",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "storage",
    "routine_name": "can_insert_object",
    "routine_type": "FUNCTION",
    "data_type": "void"
  },
  {
    "routine_schema": "storage",
    "routine_name": "extension",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "storage",
    "routine_name": "filename",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "storage",
    "routine_name": "foldername",
    "routine_type": "FUNCTION",
    "data_type": "ARRAY"
  },
  {
    "routine_schema": "storage",
    "routine_name": "get_size_by_bucket",
    "routine_type": "FUNCTION",
    "data_type": "record"
  },
  {
    "routine_schema": "storage",
    "routine_name": "list_multipart_uploads_with_delimiter",
    "routine_type": "FUNCTION",
    "data_type": "record"
  },
  {
    "routine_schema": "storage",
    "routine_name": "list_objects_with_delimiter",
    "routine_type": "FUNCTION",
    "data_type": "record"
  },
  {
    "routine_schema": "storage",
    "routine_name": "operation",
    "routine_type": "FUNCTION",
    "data_type": "text"
  },
  {
    "routine_schema": "storage",
    "routine_name": "search",
    "routine_type": "FUNCTION",
    "data_type": "record"
  },
  {
    "routine_schema": "storage",
    "routine_name": "update_updated_at_column",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "vault",
    "routine_name": "_crypto_aead_det_decrypt",
    "routine_type": "FUNCTION",
    "data_type": "bytea"
  },
  {
    "routine_schema": "vault",
    "routine_name": "create_secret",
    "routine_type": "FUNCTION",
    "data_type": "uuid"
  },
  {
    "routine_schema": "vault",
    "routine_name": "update_secret",
    "routine_type": "FUNCTION",
    "data_type": "void"
  },
  {
    "routine_schema": "public",
    "routine_name": "is_superadmin",
    "routine_type": "FUNCTION",
    "data_type": "boolean"
  },
  {
    "routine_schema": "public",
    "routine_name": "get_user_schools",
    "routine_type": "FUNCTION",
    "data_type": "uuid[]"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_school",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_teacher",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_classroom",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_student",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_transaction",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_storage_usage",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_settings",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_announcement",
    "routine_type": "FUNCTION",
    "data_type": "trigger"
  }
]
6. Show All Triggers
[
  {
    "table_schema": "auth",
    "table_name": "users",
    "trigger_name": "on_auth_user_created",
    "action_timing": "AFTER",
    "event": "INSERT",
    "action_statement": "EXECUTE FUNCTION handle_new_user_signup()"
  },
  {
    "table_schema": "public",
    "table_name": "daily_stats",
    "trigger_name": "update_daily_stats_updated_at",
    "action_timing": "BEFORE",
    "event": "UPDATE",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "trigger_name": "tr_check_filters",
    "action_timing": "BEFORE",
    "event": "INSERT",
    "action_statement": "EXECUTE FUNCTION realtime.subscription_check_filters()"
  },
  {
    "table_schema": "realtime",
    "table_name": "subscription",
    "trigger_name": "tr_check_filters",
    "action_timing": "BEFORE",
    "event": "UPDATE",
    "action_statement": "EXECUTE FUNCTION realtime.subscription_check_filters()"
  },
  {
    "table_schema": "storage",
    "table_name": "objects",
    "trigger_name": "update_objects_updated_at",
    "action_timing": "BEFORE",
    "event": "UPDATE",
    "action_statement": "EXECUTE FUNCTION storage.update_updated_at_column()"
  },
  {
    "table_schema": "public",
    "table_name": "transactions",
    "trigger_name": "tr_handle_transaction",
    "action_timing": "BEFORE",
    "event": "INSERT",
    "action_statement": "EXECUTE FUNCTION public.handle_transaction()"
  },
  {
    "table_schema": "public",
    "table_name": "storage_usage",
    "trigger_name": "tr_handle_storage_usage",
    "action_timing": "BEFORE",
    "event": "INSERT",
    "action_statement": "EXECUTE FUNCTION public.handle_storage_usage()"
  },
  {
    "table_schema": "public",
    "table_name": "settings",
    "trigger_name": "tr_handle_settings",
    "action_timing": "BEFORE",
    "event": "INSERT",
    "action_statement": "EXECUTE FUNCTION public.handle_settings()"
  },
  {
    "table_schema": "public",
    "table_name": "announcements",
    "trigger_name": "tr_handle_announcement",
    "action_timing": "BEFORE",
    "event": "INSERT",
    "action_statement": "EXECUTE FUNCTION public.handle_announcement()"
  }
]
7. Show All Indexes
[
  {
    "schemaname": "auth",
    "tablename": "audit_log_entries",
    "indexname": "audit_log_entries_pkey",
    "indexdef": "CREATE UNIQUE INDEX audit_log_entries_pkey ON auth.audit_log_entries USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "audit_log_entries",
    "indexname": "audit_logs_instance_id_idx",
    "indexdef": "CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "flow_state",
    "indexname": "flow_state_created_at_idx",
    "indexdef": "CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC)"
  },
  {
    "schemaname": "auth",
    "tablename": "flow_state",
    "indexname": "flow_state_pkey",
    "indexdef": "CREATE UNIQUE INDEX flow_state_pkey ON auth.flow_state USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "flow_state",
    "indexname": "idx_auth_code",
    "indexdef": "CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code)"
  },
  {
    "schemaname": "auth",
    "tablename": "flow_state",
    "indexname": "idx_user_id_auth_method",
    "indexdef": "CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method)"
  },
  {
    "schemaname": "auth",
    "tablename": "identities",
    "indexname": "identities_email_idx",
    "indexdef": "CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops)"
  },
  {
    "schemaname": "auth",
    "tablename": "identities",
    "indexname": "identities_pkey",
    "indexdef": "CREATE UNIQUE INDEX identities_pkey ON auth.identities USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "identities",
    "indexname": "identities_provider_id_provider_unique",
    "indexdef": "CREATE UNIQUE INDEX identities_provider_id_provider_unique ON auth.identities USING btree (provider_id, provider)"
  },
  {
    "schemaname": "auth",
    "tablename": "identities",
    "indexname": "identities_user_id_idx",
    "indexdef": "CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "instances",
    "indexname": "instances_pkey",
    "indexdef": "CREATE UNIQUE INDEX instances_pkey ON auth.instances USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_amr_claims",
    "indexname": "amr_id_pk",
    "indexdef": "CREATE UNIQUE INDEX amr_id_pk ON auth.mfa_amr_claims USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_amr_claims",
    "indexname": "mfa_amr_claims_session_id_authentication_method_pkey",
    "indexdef": "CREATE UNIQUE INDEX mfa_amr_claims_session_id_authentication_method_pkey ON auth.mfa_amr_claims USING btree (session_id, authentication_method)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_challenges",
    "indexname": "mfa_challenge_created_at_idx",
    "indexdef": "CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_challenges",
    "indexname": "mfa_challenges_pkey",
    "indexdef": "CREATE UNIQUE INDEX mfa_challenges_pkey ON auth.mfa_challenges USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_factors",
    "indexname": "factor_id_created_at_idx",
    "indexdef": "CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_factors",
    "indexname": "mfa_factors_last_challenged_at_key",
    "indexdef": "CREATE UNIQUE INDEX mfa_factors_last_challenged_at_key ON auth.mfa_factors USING btree (last_challenged_at)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_factors",
    "indexname": "mfa_factors_pkey",
    "indexdef": "CREATE UNIQUE INDEX mfa_factors_pkey ON auth.mfa_factors USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_factors",
    "indexname": "mfa_factors_user_friendly_name_unique",
    "indexdef": "CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_factors",
    "indexname": "mfa_factors_user_id_idx",
    "indexdef": "CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "mfa_factors",
    "indexname": "unique_phone_factor_per_user",
    "indexdef": "CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone)"
  },
  {
    "schemaname": "auth",
    "tablename": "one_time_tokens",
    "indexname": "one_time_tokens_pkey",
    "indexdef": "CREATE UNIQUE INDEX one_time_tokens_pkey ON auth.one_time_tokens USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "one_time_tokens",
    "indexname": "one_time_tokens_relates_to_hash_idx",
    "indexdef": "CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to)"
  },
  {
    "schemaname": "auth",
    "tablename": "one_time_tokens",
    "indexname": "one_time_tokens_token_hash_hash_idx",
    "indexdef": "CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash)"
  },
  {
    "schemaname": "auth",
    "tablename": "one_time_tokens",
    "indexname": "one_time_tokens_user_id_token_type_key",
    "indexdef": "CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type)"
  },
  {
    "schemaname": "auth",
    "tablename": "refresh_tokens",
    "indexname": "refresh_tokens_instance_id_idx",
    "indexdef": "CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "refresh_tokens",
    "indexname": "refresh_tokens_instance_id_user_id_idx",
    "indexdef": "CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "refresh_tokens",
    "indexname": "refresh_tokens_parent_idx",
    "indexdef": "CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent)"
  },
  {
    "schemaname": "auth",
    "tablename": "refresh_tokens",
    "indexname": "refresh_tokens_pkey",
    "indexdef": "CREATE UNIQUE INDEX refresh_tokens_pkey ON auth.refresh_tokens USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "refresh_tokens",
    "indexname": "refresh_tokens_session_id_revoked_idx",
    "indexdef": "CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked)"
  },
  {
    "schemaname": "auth",
    "tablename": "refresh_tokens",
    "indexname": "refresh_tokens_token_unique",
    "indexdef": "CREATE UNIQUE INDEX refresh_tokens_token_unique ON auth.refresh_tokens USING btree (token)"
  },
  {
    "schemaname": "auth",
    "tablename": "refresh_tokens",
    "indexname": "refresh_tokens_updated_at_idx",
    "indexdef": "CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC)"
  },
  {
    "schemaname": "auth",
    "tablename": "saml_providers",
    "indexname": "saml_providers_entity_id_key",
    "indexdef": "CREATE UNIQUE INDEX saml_providers_entity_id_key ON auth.saml_providers USING btree (entity_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "saml_providers",
    "indexname": "saml_providers_pkey",
    "indexdef": "CREATE UNIQUE INDEX saml_providers_pkey ON auth.saml_providers USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "saml_providers",
    "indexname": "saml_providers_sso_provider_id_idx",
    "indexdef": "CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "saml_relay_states",
    "indexname": "saml_relay_states_created_at_idx",
    "indexdef": "CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC)"
  },
  {
    "schemaname": "auth",
    "tablename": "saml_relay_states",
    "indexname": "saml_relay_states_for_email_idx",
    "indexdef": "CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email)"
  },
  {
    "schemaname": "auth",
    "tablename": "saml_relay_states",
    "indexname": "saml_relay_states_pkey",
    "indexdef": "CREATE UNIQUE INDEX saml_relay_states_pkey ON auth.saml_relay_states USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "saml_relay_states",
    "indexname": "saml_relay_states_sso_provider_id_idx",
    "indexdef": "CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "schema_migrations",
    "indexname": "schema_migrations_pkey",
    "indexdef": "CREATE UNIQUE INDEX schema_migrations_pkey ON auth.schema_migrations USING btree (version)"
  },
  {
    "schemaname": "auth",
    "tablename": "sessions",
    "indexname": "sessions_not_after_idx",
    "indexdef": "CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC)"
  },
  {
    "schemaname": "auth",
    "tablename": "sessions",
    "indexname": "sessions_pkey",
    "indexdef": "CREATE UNIQUE INDEX sessions_pkey ON auth.sessions USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "sessions",
    "indexname": "sessions_user_id_idx",
    "indexdef": "CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "sessions",
    "indexname": "user_id_created_at_idx",
    "indexdef": "CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at)"
  },
  {
    "schemaname": "auth",
    "tablename": "sso_domains",
    "indexname": "sso_domains_domain_idx",
    "indexdef": "CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain))"
  },
  {
    "schemaname": "auth",
    "tablename": "sso_domains",
    "indexname": "sso_domains_pkey",
    "indexdef": "CREATE UNIQUE INDEX sso_domains_pkey ON auth.sso_domains USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "sso_domains",
    "indexname": "sso_domains_sso_provider_id_idx",
    "indexdef": "CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "sso_providers",
    "indexname": "sso_providers_pkey",
    "indexdef": "CREATE UNIQUE INDEX sso_providers_pkey ON auth.sso_providers USING btree (id)"
  },
  {
    "schemaname": "auth",
    "tablename": "sso_providers",
    "indexname": "sso_providers_resource_id_idx",
    "indexdef": "CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id))"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "confirmation_token_idx",
    "indexdef": "CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text)"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "email_change_token_current_idx",
    "indexdef": "CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text)"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "email_change_token_new_idx",
    "indexdef": "CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text)"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "reauthentication_token_idx",
    "indexdef": "CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text)"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "recovery_token_idx",
    "indexdef": "CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text)"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "users_email_partial_key",
    "indexdef": "CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false)"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "users_instance_id_email_idx",
    "indexdef": "CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text))"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "users_instance_id_idx",
    "indexdef": "CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id)"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "users_is_anonymous_idx",
    "indexdef": "CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous)"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "users_phone_key",
    "indexdef": "CREATE UNIQUE INDEX users_phone_key ON auth.users USING btree (phone)"
  },
  {
    "schemaname": "auth",
    "tablename": "users",
    "indexname": "users_pkey",
    "indexdef": "CREATE UNIQUE INDEX users_pkey ON auth.users USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "achievements",
    "indexname": "achievements_pkey",
    "indexdef": "CREATE UNIQUE INDEX achievements_pkey ON public.achievements USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "daily_stats",
    "indexname": "daily_stats_pkey",
    "indexdef": "CREATE UNIQUE INDEX daily_stats_pkey ON public.daily_stats USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "daily_stats",
    "indexname": "daily_stats_user_id_date_key",
    "indexdef": "CREATE UNIQUE INDEX daily_stats_user_id_date_key ON public.daily_stats USING btree (user_id, date)"
  },
  {
    "schemaname": "public",
    "tablename": "flashcards",
    "indexname": "flashcards_pkey",
    "indexdef": "CREATE UNIQUE INDEX flashcards_pkey ON public.flashcards USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "flashcards",
    "indexname": "idx_flashcards_sl_no",
    "indexdef": "CREATE INDEX idx_flashcards_sl_no ON public.flashcards USING btree (topic_id, sl_no)"
  },
  {
    "schemaname": "public",
    "tablename": "flashcards",
    "indexname": "idx_flashcards_topic_id",
    "indexdef": "CREATE INDEX idx_flashcards_topic_id ON public.flashcards USING btree (topic_id)"
  },
  {
    "schemaname": "public",
    "tablename": "missed_streak_days",
    "indexname": "missed_streak_days_pkey",
    "indexdef": "CREATE UNIQUE INDEX missed_streak_days_pkey ON public.missed_streak_days USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "missed_streak_days",
    "indexname": "missed_streak_days_user_id_missed_date_key",
    "indexdef": "CREATE UNIQUE INDEX missed_streak_days_user_id_missed_date_key ON public.missed_streak_days USING btree (user_id, missed_date)"
  },
  {
    "schemaname": "public",
    "tablename": "notes",
    "indexname": "notes_pkey",
    "indexdef": "CREATE UNIQUE INDEX notes_pkey ON public.notes USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "notes",
    "indexname": "notes_syllabus_id_idx",
    "indexdef": "CREATE INDEX notes_syllabus_id_idx ON public.notes USING btree (syllabus_id)"
  },
  {
    "schemaname": "public",
    "tablename": "notes",
    "indexname": "notes_topic_id_idx",
    "indexdef": "CREATE INDEX notes_topic_id_idx ON public.notes USING btree (topic_id)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "idx_profiles_class",
    "indexdef": "CREATE INDEX idx_profiles_class ON public.profiles USING btree (class)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "idx_profiles_level",
    "indexdef": "CREATE INDEX idx_profiles_level ON public.profiles USING btree (level DESC)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "idx_profiles_streak",
    "indexdef": "CREATE INDEX idx_profiles_streak ON public.profiles USING btree (streak DESC)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "idx_profiles_xp",
    "indexdef": "CREATE INDEX idx_profiles_xp ON public.profiles USING btree (xp DESC)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "profiles_email_key",
    "indexdef": "CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "indexname": "profiles_pkey",
    "indexdef": "CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "quests",
    "indexname": "quests_pkey",
    "indexdef": "CREATE UNIQUE INDEX quests_pkey ON public.quests USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "quiz_attempts",
    "indexname": "quiz_attempts_pkey",
    "indexdef": "CREATE UNIQUE INDEX quiz_attempts_pkey ON public.quiz_attempts USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "quiz_questions",
    "indexname": "idx_quiz_questions_sl_no",
    "indexdef": "CREATE INDEX idx_quiz_questions_sl_no ON public.quiz_questions USING btree (topic_id, sl_no)"
  },
  {
    "schemaname": "public",
    "tablename": "quiz_questions",
    "indexname": "idx_quiz_questions_topic_id",
    "indexdef": "CREATE INDEX idx_quiz_questions_topic_id ON public.quiz_questions USING btree (topic_id)"
  },
  {
    "schemaname": "public",
    "tablename": "quiz_questions",
    "indexname": "quiz_questions_pkey",
    "indexdef": "CREATE UNIQUE INDEX quiz_questions_pkey ON public.quiz_questions USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "streak_logs",
    "indexname": "streak_logs_pkey",
    "indexdef": "CREATE UNIQUE INDEX streak_logs_pkey ON public.streak_logs USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "streak_logs",
    "indexname": "streak_logs_user_id_login_date_key",
    "indexdef": "CREATE UNIQUE INDEX streak_logs_user_id_login_date_key ON public.streak_logs USING btree (user_id, login_date)"
  },
  {
    "schemaname": "public",
    "tablename": "study_sessions",
    "indexname": "study_sessions_pkey",
    "indexdef": "CREATE UNIQUE INDEX study_sessions_pkey ON public.study_sessions USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "syllabi",
    "indexname": "syllabi_pkey",
    "indexdef": "CREATE UNIQUE INDEX syllabi_pkey ON public.syllabi USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "syllabi",
    "indexname": "syllabi_user_id_idx",
    "indexdef": "CREATE INDEX syllabi_user_id_idx ON public.syllabi USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "syllabus_topics",
    "indexname": "syllabus_topics_pkey",
    "indexdef": "CREATE UNIQUE INDEX syllabus_topics_pkey ON public.syllabus_topics USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "syllabus_topics",
    "indexname": "syllabus_topics_syllabus_id_idx",
    "indexdef": "CREATE INDEX syllabus_topics_syllabus_id_idx ON public.syllabus_topics USING btree (syllabus_id)"
  },
  {
    "schemaname": "public",
    "tablename": "usage_stats",
    "indexname": "idx_usage_stats_user_week",
    "indexdef": "CREATE INDEX idx_usage_stats_user_week ON public.usage_stats USING btree (user_id, week, year)"
  },
  {
    "schemaname": "public",
    "tablename": "usage_stats",
    "indexname": "usage_stats_pkey",
    "indexdef": "CREATE UNIQUE INDEX usage_stats_pkey ON public.usage_stats USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_achievements",
    "indexname": "idx_user_achievements_user_id",
    "indexdef": "CREATE INDEX idx_user_achievements_user_id ON public.user_achievements USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_achievements",
    "indexname": "user_achievements_pkey",
    "indexdef": "CREATE UNIQUE INDEX user_achievements_pkey ON public.user_achievements USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_achievements",
    "indexname": "user_achievements_user_id_achievement_id_key",
    "indexdef": "CREATE UNIQUE INDEX user_achievements_user_id_achievement_id_key ON public.user_achievements USING btree (user_id, achievement_id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_daily_generation_counts",
    "indexname": "unique_user_date",
    "indexdef": "CREATE UNIQUE INDEX unique_user_date ON public.user_daily_generation_counts USING btree (user_id, date)"
  },
  {
    "schemaname": "public",
    "tablename": "user_daily_generation_counts",
    "indexname": "user_daily_generation_counts_pkey",
    "indexdef": "CREATE UNIQUE INDEX user_daily_generation_counts_pkey ON public.user_daily_generation_counts USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_daily_generation_counts",
    "indexname": "user_daily_generation_counts_user_id_date_key",
    "indexdef": "CREATE UNIQUE INDEX user_daily_generation_counts_user_id_date_key ON public.user_daily_generation_counts USING btree (user_id, date)"
  },
  {
    "schemaname": "public",
    "tablename": "user_quests",
    "indexname": "user_quests_pkey",
    "indexdef": "CREATE UNIQUE INDEX user_quests_pkey ON public.user_quests USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_quests",
    "indexname": "user_quests_user_id_quest_id_key",
    "indexdef": "CREATE UNIQUE INDEX user_quests_user_id_quest_id_key ON public.user_quests USING btree (user_id, quest_id)"
  },
  {
    "schemaname": "realtime",
    "tablename": "messages",
    "indexname": "messages_pkey",
    "indexdef": "CREATE UNIQUE INDEX messages_pkey ON ONLY realtime.messages USING btree (id, inserted_at)"
  },
  {
    "schemaname": "public",
    "tablename": "schools",
    "indexname": "schools_pkey",
    "indexdef": "CREATE UNIQUE INDEX schools_pkey ON public.schools USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "schools",
    "indexname": "schools_name_idx",
    "indexdef": "CREATE UNIQUE INDEX schools_name_idx ON public.schools USING btree (name)"
  },
  {
    "schemaname": "public",
    "tablename": "teachers",
    "indexname": "teachers_pkey",
    "indexdef": "CREATE UNIQUE INDEX teachers_pkey ON public.teachers USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "teachers",
    "indexname": "teachers_school_id_idx",
    "indexdef": "CREATE INDEX teachers_school_id_idx ON public.teachers USING btree (school_id)"
  },
  {
    "schemaname": "public",
    "tablename": "teachers",
    "indexname": "teachers_email_idx",
    "indexdef": "CREATE UNIQUE INDEX teachers_email_idx ON public.teachers USING btree (email)"
  },
  {
    "schemaname": "public",
    "tablename": "classrooms",
    "indexname": "classrooms_pkey",
    "indexdef": "CREATE UNIQUE INDEX classrooms_pkey ON public.classrooms USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "classrooms",
    "indexname": "classrooms_school_id_idx",
    "indexdef": "CREATE INDEX classrooms_school_id_idx ON public.classrooms USING btree (school_id)"
  },
  {
    "schemaname": "public",
    "tablename": "classrooms",
    "indexname": "classrooms_class_teacher_id_idx",
    "indexdef": "CREATE INDEX classrooms_class_teacher_id_idx ON public.classrooms USING btree (class_teacher_id)"
  },
  {
    "schemaname": "public",
    "tablename": "classrooms",
    "indexname": "classrooms_subject_teachers_idx",
    "indexdef": "CREATE INDEX classrooms_subject_teachers_idx ON public.classrooms USING GIN (subject_teachers)"
  },
  {
    "schemaname": "public",
    "tablename": "classrooms",
    "indexname": "classrooms_analytics_idx",
    "indexdef": "CREATE INDEX classrooms_analytics_idx ON public.classrooms USING GIN (analytics)"
  },
  {
    "schemaname": "public",
    "tablename": "classrooms",
    "indexname": "classrooms_created_at_idx",
    "indexdef": "CREATE INDEX classrooms_created_at_idx ON public.classrooms USING btree (created_at)"
  },
  {
    "schemaname": "public",
    "tablename": "classrooms",
    "indexname": "classrooms_updated_at_idx",
    "indexdef": "CREATE INDEX classrooms_updated_at_idx ON public.classrooms USING btree (updated_at)"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "indexname": "students_pkey",
    "indexdef": "CREATE UNIQUE INDEX students_pkey ON public.students USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "indexname": "students_school_id_idx",
    "indexdef": "CREATE INDEX students_school_id_idx ON public.students USING btree (school_id)"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "indexname": "students_classroom_id_idx",
    "indexdef": "CREATE INDEX students_classroom_id_idx ON public.students USING btree (classroom_id)"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "indexname": "students_name_idx",
    "indexdef": "CREATE INDEX students_name_idx ON public.students USING btree (name)"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "indexname": "students_email_idx",
    "indexdef": "CREATE INDEX students_email_idx ON public.students USING btree (email)"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "indexname": "students_profile_idx",
    "indexdef": "CREATE INDEX students_profile_idx ON public.students USING GIN (profile)"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "indexname": "students_created_at_idx",
    "indexdef": "CREATE INDEX students_created_at_idx ON public.students USING btree (created_at)"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "indexname": "students_updated_at_idx",
    "indexdef": "CREATE INDEX students_updated_at_idx ON public.students USING btree (updated_at)"
  },
  {
    "schemaname": "public",
    "tablename": "quizzes",
    "indexname": "idx_quizzes_teacher_id",
    "indexdef": "CREATE INDEX idx_quizzes_teacher_id ON public.quizzes USING btree (teacher_id)"
  },
  {
    "schemaname": "public",
    "tablename": "materials",
    "indexname": "idx_materials_teacher_id",
    "indexdef": "CREATE INDEX idx_materials_teacher_id ON public.materials USING btree (teacher_id)"
  },
  {
    "schemaname": "public",
    "tablename": "quiz_scores",
    "indexname": "idx_quiz_scores_quiz_id",
    "indexdef": "CREATE INDEX idx_quiz_scores_quiz_id ON public.quiz_scores USING btree (quiz_id)"
  },
  {
    "schemaname": "public",
    "tablename": "quiz_scores",
    "indexname": "idx_quiz_scores_student_id",
    "indexdef": "CREATE INDEX idx_quiz_scores_student_id ON public.quiz_scores USING btree (student_id)"
  },
  {
    "schemaname": "public",
    "tablename": "messages",
    "indexname": "idx_messages_sender_id",
    "indexdef": "CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id)"
  },
  {
    "schemaname": "public",
    "tablename": "messages",
    "indexname": "idx_messages_receiver_id",
    "indexdef": "CREATE INDEX idx_messages_receiver_id ON public.messages USING btree (receiver_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_sessions",
    "indexname": "idx_class_sessions_classroom_id",
    "indexdef": "CREATE INDEX idx_class_sessions_classroom_id ON public.class_sessions USING btree (classroom_id)"
  },
  {
    "schemaname": "public",
    "tablename": "class_sessions",
    "indexname": "idx_class_sessions_teacher_id",
    "indexdef": "CREATE INDEX idx_class_sessions_teacher_id ON public.class_sessions USING btree (teacher_id)"
  },
  {
    "schemaname": "public",
    "tablename": "transactions",
    "indexname": "idx_transactions_school_id",
    "indexdef": "CREATE INDEX idx_transactions_school_id ON public.transactions USING btree (school_id)"
  },
  {
    "schemaname": "public",
    "tablename": "transactions",
    "indexname": "idx_transactions_date",
    "indexdef": "CREATE INDEX idx_transactions_date ON public.transactions USING btree (date)"
  },
  {
    "schemaname": "public",
    "tablename": "storage_usage",
    "indexname": "idx_storage_usage_school_id",
    "indexdef": "CREATE INDEX idx_storage_usage_school_id ON public.storage_usage USING btree (school_id)"
  },
  {
    "schemaname": "public",
    "tablename": "storage_usage",
    "indexname": "idx_storage_usage_timestamp",
    "indexdef": "CREATE INDEX idx_storage_usage_timestamp ON public.storage_usage USING btree (timestamp)"
  },
  {
    "schemaname": "public",
    "tablename": "settings",
    "indexname": "idx_settings_key",
    "indexdef": "CREATE UNIQUE INDEX idx_settings_key ON public.settings USING btree (key)"
  },
  {
    "schemaname": "public",
    "tablename": "announcements",
    "indexname": "idx_announcements_school_id",
    "indexdef": "CREATE INDEX idx_announcements_school_id ON public.announcements USING btree (school_id)"
  },
  {
    "schemaname": "public",
    "tablename": "announcements",
    "indexname": "idx_announcements_created_at",
    "indexdef": "CREATE INDEX idx_announcements_created_at ON public.announcements USING btree (created_at)"
  }
]

**Instructions:**
- Update this file whenever you make changes to your Supabase schema, policies, or functions.
- Use this as a reference for all future feature development and debugging. 

## [UPDATE 2025-06-05] RLS Policy Fixes for Teachers Table

- **Removed problematic policy:** The policy `Superadmin can manage all teachers` (which referenced `auth.users` in a subquery) was dropped, as referencing `auth.users` in RLS policies is not allowed by Supabase and causes 403 errors for all users.
- **Superadmin access:** The only superadmin policy now uses the `is_superadmin()` function, which checks the JWT claim or metadata, not a subquery.
- **Teacher self-access:** Teachers can view and update their own profile with policies using `(auth.uid() = id)`.
- **School management:** Schools can manage their teachers using the `school_id` and the `get_user_schools()` helper.
- **Troubleshooting note:** Never reference `auth.users` in RLS policies. Use JWT claims or metadata functions instead. If you get unexplained 403 errors, check for this issue first.

### Example: Final RLS Policies for `public.teachers`

```sql
-- Allow teachers to view and update their own profile
CREATE POLICY "Teachers can view own profile"
  ON public.teachers
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Teachers can update own profile"
  ON public.teachers
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow schools to manage their teachers
CREATE POLICY "Schools can manage their teachers"
  ON public.teachers
  FOR ALL
  USING (school_id = ANY (get_user_schools(auth.uid())));

-- Allow superadmins to manage all teachers
CREATE POLICY "Superadmin can do everything on teachers"
  ON public.teachers
  FOR ALL
  USING (is_superadmin());
```