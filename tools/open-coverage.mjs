import path from 'node:path';
import url from 'node:url';
import { exec } from 'node:child_process';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const coverageReportFile = url.pathToFileURL(path.join(__dirname, '../coverage', 'mat-image-overlay/index.html'));
const start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
exec(start + ' ' + coverageReportFile);
