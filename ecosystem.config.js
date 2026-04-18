// Charge .env.local au boot
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith('#')) {
      envVars[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  });
}

module.exports = {
  apps: [{
    name: 'paul-architect',
    cwd: '/opt/paul-architect',
    script: '.next/standalone/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3019,
      ...envVars,
    },
    restart_delay: 3000,
    max_restarts: 5,
    kill_timeout: 5000,
    listen_timeout: 10000,
    watch: false,
    merge_logs: true,
    max_memory_restart: '512M',
  }]
};
