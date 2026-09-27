import { test, expect, setState, getState } from "../fixtures/auth";
import { chooseOption, saveForm } from "../fixtures/form";

const USERS = [
  {
    id: "admin-user-1",
    name: "Test Admin",
    email: "admin@cellarboss.test",
    role: "admin",
    createdAt: "2024-01-01T00:00:00.000Z",
    banned: null,
    banReason: null,
  },
  {
    id: "regular-user-1",
    name: "Test User",
    email: "user@cellarboss.test",
    role: "user",
    createdAt: "2024-02-01T00:00:00.000Z",
    banned: null,
    banReason: null,
  },
];

test.describe("User management", () => {
  test.beforeEach(async () => {
    await setState({ users: USERS });
  });

  test("lists users with their email and role", async ({ adminPage: page }) => {
    await page.goto("/users");

    const row = page.getByRole("row").filter({ hasText: "Test User" });
    await expect(row).toContainText("user@cellarboss.test");
    await expect(row).toContainText("user");
  });

  test("creates a user", async ({ adminPage: page }) => {
    await page.goto("/users");
    await page.getByRole("button", { name: "Create new User" }).click();
    await expect(page).toHaveURL("/users/new");

    await page.getByLabel("Full Name").fill("New Person");
    await page.getByLabel("Email Address").fill("new@cellarboss.test");
    await page.getByLabel("Password").fill("Welcome1!");
    await chooseOption(page, "Role", "Admin");
    await saveForm(page);
    await expect(page).toHaveURL("/users");
    await expect(page.getByRole("link", { name: "New Person" })).toBeVisible();

    const { users } = await getState();
    expect(users).toContainEqual(
      expect.objectContaining({
        name: "New Person",
        email: "new@cellarboss.test",
        role: "admin",
      }),
    );
  });

  test("rejects a weak password when creating a user", async ({
    adminPage: page,
  }) => {
    await page.goto("/users/new");

    await page.getByLabel("Full Name").fill("New Person");
    await page.getByLabel("Email Address").fill("new@cellarboss.test");
    await page.getByLabel("Password").fill("weak");
    await chooseOption(page, "Role", "User");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
    const { users } = await getState();
    expect(users).toHaveLength(2);
  });

  test("changes a user's role", async ({ adminPage: page }) => {
    await page.goto("/users/regular-user-1/edit");

    await expect(page.getByLabel("Full Name")).toHaveValue("Test User");
    await chooseOption(page, "Role", "Admin");
    await saveForm(page);
    const { users } = await getState();
    expect(users.find((u) => u.id === "regular-user-1")?.role).toBe("admin");
  });

  test("sets another user's password", async ({ adminPage: page }) => {
    await page.goto("/users/regular-user-1/edit");

    await page.getByLabel(/^New Password/).fill("NewPass1!");
    await saveForm(page);
    const { userPasswords } = await getState();
    expect(userPasswords["regular-user-1"]).toBe("NewPass1!");
  });

  test("deletes a user after confirming", async ({ adminPage: page }) => {
    await page.goto("/users");

    await page
      .getByRole("row")
      .filter({ hasText: "Test User" })
      .getByRole("button", { name: "Delete" })
      .click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toContainText("Test User (user@cellarboss.test)");
    await dialog.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("link", { name: "Test User" })).toBeHidden();
    const { users } = await getState();
    expect(users.map((u) => u.id)).toEqual(["admin-user-1"]);
  });
});
