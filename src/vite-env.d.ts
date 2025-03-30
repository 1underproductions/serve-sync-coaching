
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_URL_STAGING?: string;
  readonly VITE_SUPABASE_ANON_KEY_STAGING?: string;
  readonly VITE_SUPABASE_URL_PRODUCTION?: string;
  readonly VITE_SUPABASE_ANON_KEY_PRODUCTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
