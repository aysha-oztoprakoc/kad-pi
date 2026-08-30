/**
 * TELL Headless Server Profile Module Entrypoint
 * Surface Profile: surface.tell.server (ISA-KAD-AESTHETIC-001 & ISA-KAD-COMPUTE-FABRIC-001)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TELL_PROFILE_CONFIG = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'profile.json'), 'utf8')
);

export * from './ansi-palette.mjs';
export * from './tui-views.mjs';
export * from './host-adapter.mjs';
