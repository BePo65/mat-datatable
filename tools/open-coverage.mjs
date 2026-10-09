import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const coverageReportFile = path.join(projectRoot, 'coverage', 'mat-datatable-lib', 'index.html');

const start =
  process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
exec(start + ' ' + coverageReportFile);
