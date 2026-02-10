import 'dotenv/config';
import type { Kysely } from 'kysely';
import { auth } from '../utils/auth.js';

const ADMIN_EMAIL = 'admin@cellarboss.org';
const ADMIN_PASSWORD = 'adminpassword';
const ADMIN_NAME = 'Admin';

export async function seed(db: Kysely<any>): Promise<void> {
  // Check if admin user already exists
  const existing = await db
    .selectFrom('user')
    .select('id')
    .where('email', '=', ADMIN_EMAIL)
    .executeTakeFirst();

  if (existing) {
    console.log(`Admin user already exists (${ADMIN_EMAIL}), skipping`);
    return;
  }

  // Create user via better-auth so the password is properly hashed
  await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
    },
  });

  // Set role to admin (input: false prevents setting it via sign-up)
  await db
    .updateTable('user')
    .set({ role: 'admin' })
    .where('email', '=', ADMIN_EMAIL)
    .execute();

  console.log(`Seeded admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}
