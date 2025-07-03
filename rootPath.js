import path from 'path';
import { fileURLToPath } from 'url';

const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
console.log('Root path (one level up):', rootPath);