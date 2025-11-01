/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  // Permite acceso dinámico a variables de entorno
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
