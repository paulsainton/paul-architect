module.exports = {
  apps: [{
    name: 'paul-architect',
    cwd: '/opt/paul-architect',
    script: '.next/standalone/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3019,
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
