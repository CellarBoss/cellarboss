// No "seeds" block: seeding goes through the ledger in src/utils/seed.ts.
import 'dotenv/config';
import { defineConfig } from 'kysely-ctl';
import { getDialect } from './dist/src/utils/database.js';

export default defineConfig({
  dialect: getDialect(),
  migrations: {
    migrationFolder: 'dist/src/migrations',
    allowJS: true,
  },
});
