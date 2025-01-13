/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDFRONT_DOMAIN: string;
  readonly VITE_S3_IMAGE_PATH: string;
  readonly VITE_S3_ORIGINAL_DIR: string;
  readonly VITE_S3_RESIZED_S_DIR: string;
  readonly VITE_S3_RESIZED_M_DIR: string;
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
