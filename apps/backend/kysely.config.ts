import 'dotenv/config';
import { defineConfig } from 'kysely-ctl';
import { getDialect } from './src/utils/database.js';

export default defineConfig({
  dialect: getDialect(),
  migrations: {
    migrationFolder: 'src/migrations',
  },
  seeds: {
    seedFolder: 'src/seeds',
  },
});
