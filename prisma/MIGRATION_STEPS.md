# Database initialization (PostgreSQL + Prisma)

1. Ensure `DATABASE_URL` is set in your environment (e.g., in `.env`).
2. Install dependencies (if not already):
   ```bash
   npm install
   ```
3. Create the initial migration and apply it to your local database:
   ```bash
   npx prisma migrate dev --name init
   ```
   - This generates SQL in `prisma/migrations/` and syncs your database schema.
4. (Alternative for ephemeral/dev databases) Push the schema without creating a migration:
   ```bash
   npx prisma db push
   ```
5. (Optional) Run your own seed script if you maintain one; the project no longer ships with placeholder data.
