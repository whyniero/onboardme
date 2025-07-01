module.exports = {
  apps: [
    {
      name: "onboardme-backend-api",
      script: "./src/index.js",
      cwd: ".", // Рабочая директория (корень проекта)
      interpreter: "node",
      interpreter_args: "--require=dotenv/config",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "development",
        // порт апи сервера
        PORT_API: 5050,
        // домен фронтенда
        CORS_ORIGIN: "http://localhost:3000",
        // юрл базы данных
        DATABASE_URL: "mysql://root:password@localhost:3306/myapp",

        JWT_SIGNING_SECRET: "2edc87bc-a2cd-4fb7-ba36-84bbebb87179",
        COOKIE_SECRET: "e43b2019-51c2-422d-bb55-3b72fbf06ea8",
        HR_SECRET_KEY: "secret_key",
      },
      env_production: {
        NODE_ENV: "production",
        // порт апи сервера
        PORT_API: 5050,
        // домен фронтенда
        CORS_ORIGIN: "http://localhost:3000",
        // юрл базы данных
        DATABASE_URL: "mysql://root:password@localhost:3306/myapp",

        JWT_SIGNING_SECRET: "2edc87bc-a2cd-4fb7-ba36-84bbebb87179",
        COOKIE_SECRET: "e43b2019-51c2-422d-bb55-3b72fbf06ea8",
        HR_SECRET_KEY: "secret_key",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      time: true,
    },
    {
      name: "onboardme-backend-socket",
      script: "./socket/server.js",
      cwd: ".",
      interpreter: "node",
      interpreter_args: "--require=dotenv/config",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "development",
        // порт вебсокет сервера
        PORT_WS: 4000,
        // домен фронтенда
        CORS_ORIGIN: "http://localhost:3000",
        // домен апи для использования в сокете (от апи есть запросы к сокету)
        CORS_ORIGIN_FOR_WS: "http://localhost:5050",
        DATABASE_URL: "mysql://root:password@localhost:3306/myapp",
        JWT_SIGNING_SECRET: "2edc87bc-a2cd-4fb7-ba36-84bbebb87179",
        COOKIE_SECRET: "e43b2019-51c2-422d-bb55-3b72fbf06ea8",
        HR_SECRET_KEY: "secret_key",
      },
      env_production: {
        NODE_ENV: "production",
        // порт вебсокет сервера
        PORT_WS: 4000,
        // домен фронтенда
        CORS_ORIGIN: "http://localhost:3000",
        // домен апи для использования в сокете (от апи есть запросы к сокету)
        CORS_ORIGIN_FOR_WS: "http://localhost:5050"
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/socket-error.log",
      out_file: "./logs/socket-out.log",
      time: true,
    },
  ],
};
