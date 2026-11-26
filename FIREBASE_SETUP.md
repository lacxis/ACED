# ACED Attendance — Firebase setup & bootstrap

This app runs on the free Firebase **Spark** plan. No Cloud Functions, no paid
services. Security is enforced entirely by the Realtime Database rules in
[`database.rules.json`](./database.rules.json).

Do these three things once, in the `aced-attendance` Firebase project.

## 1. Enable Email/Password sign-in
Firebase console → **Authentication** → **Sign-in method** → enable
**Email/Password**. (Leave "Email link / passwordless" off.)

## 2. Publish the security rules
Firebase console → **Realtime Database** → **Rules** tab → replace everything
with the contents of `database.rules.json` → **Publish**.

Until you do this, the database denies all access (the "Blocked from access"
message you saw is the default deny-all rule — that is expected).

## 3. Create the first administrator
Because roles can only be granted by an existing admin, the very first admin is
set by hand (the console bypasses the rules).

1. Open the deployed app and **Create an account** with your own work email.
   You'll be asked to finish your profile — do that. You now have an ordinary
   employee account.
2. Firebase console → **Authentication** → **Users** → copy your account's
   **User UID**.
3. Firebase console → **Realtime Database** → **Data** → hover the root, click
   **+**, and add a child:
   - Name: `roles`
   - Then under `roles`, add a child named with **your UID**, and under that add:
     - `admin` = `true` (boolean)
     - `employee` = `true` (boolean)
4. Reload the app. You now have the full admin experience and can assign roles
   and line managers to everyone else from the **Directory**.

After this, everyone else just **creates their own account** from the sign-in
screen; you assign their roles and line manager in the Directory.

---

## How the model works (for reference)

- **Everyone clocks in except executives.** Admins and managers clock in too.
- **A person can hold several roles** (e.g. manager + employee, or executive +
  manager). Capabilities combine.
- **Leave approval** = you are the requester's line manager, **or** you are an
  admin. Executives are read-only company-wide but can still approve leave for
  their own direct reports.
- **Leave balances are computed** from approved leave, not stored — so there is
  no privileged figure a server has to maintain.

## Security rules — what they enforce

| Data | Who can read | Who can write |
|------|--------------|---------------|
| `usersPublic/{uid}` | any signed-in user **who has their own profile** | that user, or an admin (line-manager field: admin only) |
| `roles/{uid}` | any signed-in user with a profile | **admins only** |
| `records/{uid}/{date}` | the person, their line manager, admins, executives | the person (their own) or an admin |
| `leaves/{uid}/{id}` | the person, their line manager, admins, executives | the person (create/cancel own pending), their line manager, or an admin |
| `settings`, `announcements` | any signed-in user with a profile | admins only |
| `audit/{id}` | admins only | append-only (no edits or deletes) |

## Validation checklist (run on the live preview after step 3)

1. **Self clock-in** — clock in on the Attendance tab; refresh; the record
   persists.
2. **Role gate** — a brand-new account (no roles) should see only Dashboard,
   Attendance and Leave — no Directory.
3. **Leave approval scope** — as a manager, you can approve only your own
   reports; other people's requests show "Not your report".
4. **Admin role change** — as admin, tick "Manager" on someone in the Directory
   and save; sign in as them and confirm they now see approvals.
5. **Read isolation** (optional, via the browser console on the live site):
   signed in as an ordinary employee, try reading another employee's record —
   it should be denied by the rules.
