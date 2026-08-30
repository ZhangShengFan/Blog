import { execSync } from 'node:child_process';

const CONTENT_PATHS = ['posts', 'friends', 'config/site.config.ts', 'config/content.config.json'];
const BRANCH = 'zsfan';

function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
}

try {
  run(`git fetch --depth 1 origin ${BRANCH}`);
  console.log(`[sync-content] fetched ${BRANCH} branch, syncing content files into working tree...`);
  for (const p of CONTENT_PATHS) {
    try {
      run(`git checkout origin/${BRANCH} -- ${p}`);
      console.log(`[sync-content] synced "${p}" from ${BRANCH} branch`);
    } catch {
      console.warn(`[sync-content] "${p}" not found on ${BRANCH} branch, keeping existing local copy`);
    }
  }
} catch (e) {
  console.warn(`[sync-content] "${BRANCH}" branch not found or unreachable, building with content files already in the working tree (this is expected for very first build before the branch is created).`);
}
