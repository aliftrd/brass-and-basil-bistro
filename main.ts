// Entrypoint for Brass & Basil: Bistro Rush on make.fun (Node 22, standard library only).
// Copies game/ and screenshots/ into MAKEFUN_OUTPUT_DIR (or /output), builds dossier.json
// with the unchanged vendor/makefun-game.ts module, and normalizes permissions so the grader
// container can read every generated file and directory.

import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

function setReadablePermissions(targetPath, isRoot = false) {
  const stats = statSync(targetPath);
  if (stats.isDirectory()) {
    if (!isRoot) {
      try {
        chmodSync(targetPath, 0o755);
      } catch {
        // Ignore if directory ownership prevents chmod.
      }
    }
    for (const entry of readdirSync(targetPath)) {
      setReadablePermissions(join(targetPath, entry), false);
    }
  } else {
    try {
      chmodSync(targetPath, 0o644);
    } catch {
      // Ignore if file ownership prevents chmod.
    }
  }
}

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(rootDir, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(rootDir, 'screenshots'))) {
  cpSync(join(rootDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

const dossierJson = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

const dossierBuffer = Buffer.from(dossierJson, 'utf8');
if (dossierBuffer.byteLength > 1572864) {
  throw new Error(`dossier.json exceeds 1.5 MiB limit (${dossierBuffer.byteLength} bytes)`);
}

writeFileSync(join(outDir, 'dossier.json'), dossierBuffer);
setReadablePermissions(outDir, true);
