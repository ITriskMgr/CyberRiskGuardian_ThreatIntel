// t74 — launchers (1.9.2, item 3): start.sh / start.command no longer stop a running copy silently. With a local web
// server already on the port they say so and ask "Stop it and start this version instead? [y/N]": N (the default) leaves
// it running, opens the browser and exits 0; y stops it and serves. A port held by another kind of program is never
// touched. start.command is byte-identical to start.sh (the same shell logic runs on macOS); start.bat carries the same
// prompt (checked statically here: Windows is not available in CI; the author checks it on Windows).
// The prompt is read from a terminal; in CI there is none, so CRG_LAUNCH_PROMPT=1 forces it (and CRG_LAUNCH_KEEP /
// CRG_LAUNCH_REPLACE answer it without a terminal). A fake "earlier copy" is python3 -m http.server on PORT+200.
import fs from 'fs';
import path from 'path';
import { spawn, spawnSync, execSync } from 'child_process';
import { ok, done, APP, PORT } from './lib.mjs';

const FAKE = PORT + 200;
const sh = fs.readFileSync(path.join(APP, 'start.sh'), 'utf8'), cmd = fs.readFileSync(path.join(APP, 'start.command'), 'utf8'), bat = fs.readFileSync(path.join(APP, 'start.bat'), 'utf8');
ok(sh === cmd, 'start.command is identical to start.sh');
ok(/\[y\/N\]/.test(sh) && /ask_replace/.test(sh) && /Leaving it running/.test(sh), 'start.sh: y/N prompt, keep path');
ok(/\[y\/N\]/.test(bat) && /set \/p ANS/.test(bat) && /:keep/.test(bat) && /:replace/.test(bat) && /taskkill \/PID %BUSYPID%/.test(bat), 'start.bat: the same prompt with keep / replace paths');
ok(!/kill "\$P" 2>\/dev\/null \|\| true; sleep 1 ;;/.test(sh), 'the silent kill of 1.9.1 is gone');
ok(spawnSync('bash', ['-n', path.join(APP, 'start.sh')]).status === 0, 'start.sh parses (bash -n)');

const haveLsof = spawnSync('bash', ['-c', 'command -v lsof']).status === 0;
if (!haveLsof) { console.log('lsof not available: the live launcher checks are skipped'); done('t74 launchers'); }

const listening = () => spawnSync('bash', ['-c', `lsof -nP -iTCP:${FAKE} -sTCP:LISTEN -t`]).stdout.toString().trim().split('\n').filter(Boolean);
const tmpDir = fs.mkdtempSync('/tmp/crg-launch-'); fs.writeFileSync(path.join(tmpDir, 'index.html'), '<!doctype html>old copy');
const fake = spawn('python3', ['-m', 'http.server', String(FAKE), '--bind', '127.0.0.1'], { cwd: tmpDir, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1200));
ok(listening().length === 1, `a fake earlier copy listens on ${FAKE}`);
const run = (answer, env = {}) => spawnSync('bash', [path.join(APP, 'start.sh'), String(FAKE)], { input: answer, env: { ...process.env, CRG_LAUNCH_PROMPT: '1', PATH: process.env.PATH, ...env }, timeout: 8000, encoding: 'utf8' });

const n = run('n\n');
ok(n.status === 0 && /already running on port/.test(n.stdout) && /Stop it and start this version instead\? \[y\/N\]/.test(n.stdout + n.stderr) && /Leaving it running/.test(n.stdout), 'N: the launcher reports the running copy, asks (read -p writes the prompt to stderr), and leaves it (exit 0)');
ok(listening().length === 1, 'N: the running copy is still listening');
const d = run('\n');
ok(d.status === 0 && /Leaving it running/.test(d.stdout) && listening().length === 1, 'Return alone = N (the default keeps the running copy)');
const k = spawnSync('bash', [path.join(APP, 'start.sh'), String(FAKE)], { env: { ...process.env, CRG_LAUNCH_KEEP: '1' }, timeout: 8000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
ok(k.status === 0 && /Leaving it running/.test(k.stdout) && !/\[y\/N\]/.test(k.stdout + k.stderr) && listening().length === 1, 'CRG_LAUNCH_KEEP=1 answers N without a prompt');
const y = spawnSync('bash', ['-c', `printf 'y\\n' | CRG_LAUNCH_PROMPT=1 CRG_FEEDS_DIR=${tmpDir}/feeds CRG_KEYS_DIR=${tmpDir}/keys timeout 4 bash ${path.join(APP, 'start.sh')} ${FAKE} 2>/dev/null; true`], { encoding: 'utf8' });
ok(/Stopping it so this version is the one you see/.test(y.stdout) && /Serving/.test(y.stdout), 'y: the launcher stops the running copy and serves this folder');
await new Promise(r => setTimeout(r, 800));
ok(listening().length === 0 || !listening().some(p => Number(p) === fake.pid), 'y: the fake earlier copy is gone');
try { fake.kill(); } catch { /* already gone */ }
execSync(`fuser -k ${FAKE}/tcp >/dev/null 2>&1 || true`);
// another kind of program on the port: refused, never killed
const other = spawn('bash', ['-c', `exec -a sleepyserver python3 -c "import socket,time;s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(('127.0.0.1',${FAKE}));s.listen();time.sleep(30)"`], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1000));
const o = run('y\n');
ok(o.status === 1 && /used by another program/.test(o.stdout) && listening().length === 1, 'a port used by another program: refused, the program is left alone');
try { other.kill(); } catch { /* ignore */ }
execSync(`fuser -k ${FAKE}/tcp >/dev/null 2>&1 || true`);
fs.rmSync(tmpDir, { recursive: true, force: true });
done('t74 launchers');
