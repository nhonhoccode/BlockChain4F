declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_BASE_URL?: string;
    [key: string]: string | undefined;
  }
}

declare var process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_BASE_URL?: string;
    [key: string]: string | undefined;
  }
}; 