import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

let proc = null;

[ 'SIGTERM', 'SIGINT' ].forEach((signal) => {
  process.on(signal, () => {
    if (proc) proc.kill(signal);
    process.exit(0);
  });
});

writeFileSync('public/config.json', JSON.stringify({
  baseURL: process.env.API_URL || '/api',
  terms: process.env.TERMS_OF_SERVICE_URL || 'https://example.com',
}));

proc = spawn('node', ['server/index.mjs'], { stdio: 'inherit' });
