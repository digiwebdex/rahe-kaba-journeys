const path = require("path");

const projectRoot = __dirname;
const serverDir = path.join(projectRoot, "server");

module.exports = {
  apps: [
    {
      name: "rahekaba-api",
      script: path.join(serverDir, "index.js"),
      cwd: serverDir,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};