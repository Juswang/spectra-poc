-- This is an empty migration.
ALTER TABLE "UserAgency" ADD COLUMN "roleId" TEXT;

-- 2. Copy each user's current global role to their agency assignments
UPDATE "UserAgency" ua
SET "roleId" = u."roleId"
FROM "User" u
WHERE ua."userId" = u."id"
  AND u."roleId" IS NOT NULL;

-- 3. Any remaining NULLs get VIEWER as a safe default
UPDATE "UserAgency"
SET "roleId" = (SELECT id FROM "Role" WHERE name = 'VIEWER')
WHERE "roleId" IS NULL;

-- 4. Now make the column required
ALTER TABLE "UserAgency" ALTER COLUMN "roleId" SET NOT NULL;

-- 5. Add the foreign key constraint
ALTER TABLE "UserAgency"
ADD CONSTRAINT "UserAgency_roleId_fkey"
FOREIGN KEY ("roleId") REFERENCES "Role"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Drop the old role column from User
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_roleId_fkey";
ALTER TABLE "User" DROP COLUMN "roleId";