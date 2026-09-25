// Starts mock API (:3001), Classic (:5173) and Analytics (:5174) together.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const procs = [
  ['api', ['run', 'dev', '-w', 'apps/mock-api']],
  ['classic', ['run', 'dev', '-w', 'apps/classic']],
  ['analytics', ['run', 'dev', '-w', 'apps/analytics']],
].map(([name, args]) => {
  const child = spawn(npmCmd, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  child.on('exit', (code) => console.log(`[${name}] exited with ${code}`));
  return child;
});

const stop = () => { for (const p of procs) p.kill(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
