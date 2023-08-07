import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export function obtenerProductos() {
    const filePath = path.join(process.cwd(), 'productos.json');
    const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}
