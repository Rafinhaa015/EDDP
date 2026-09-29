import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from '../db.js';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../database');

export async function migrate() {
  for (const file of ['schema.sql', 'seed.sql']) {
    const sql = await readFile(path.join(dir, file), 'utf8');
    await pool.query(sql);
    console.log(`✔ ${file} aplicado`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  migrate()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
