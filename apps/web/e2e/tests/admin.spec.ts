import { test, expect, setState, resetState } from "../fixtures/auth";

test.describe("Admin access control", () => {
  test.afterEach(async () => {
    await resetState();
  });

  test("admin user sees Users link in sidebar", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
  });

  test("non-admin user does not see Users link in sidebar", async ({
    userContext,
  }) => {
    const page = await userContext.newPage();
    await page.goto("/wines");

    await expect(page.getByRole("link", { name: "Users" })).not.toBeVisible();
  });

  test("non-admin visiting /users sees permission denied", async ({
    userContext,
  }) => {
    const page = await userContext.newPage();
    await page.goto("/users");

    await expect(
      page.getByText("You do not have permission to access this page"),
    ).toBeVisible();
    await expect(
      page.getByText("Admin rights are required"),
    ).toBeVisible();
  });

  test("non-admin visiting /settings sees permission denied", async ({
    userContext,
  }) => {
    const page = await userContext.newPage();
    await page.goto("/settings");

    await expect(
      page.getByText("You do not have permission to access this page"),
    ).toBeVisible();
  });

  test("admin can access /users page", async ({ adminContext }) => {
    await setState({
      users: [
        {
          id: "admin-user-1",
          name: "Test Admin",
          email: "admin@cellarboss.test",
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          banned: null,
          banReason: null,
        },
      ],
    });
    const page = await adminContext.newPage();
    await page.goto("/users");

    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(
      page.getByText("You do not have permission"),
    ).not.toBeVisible();
  });

  test("admin can access /settings page and see settings", async ({
    adminContext,
  }) => {
    await setState({
      settings: [
        { key: "currency", value: "USD" },
        { key: "date", value: "yyyy-MM-dd" },
      ],
    });
    const page = await adminContext.newPage();
    await page.goto("/settings");

    await expect(
      page.getByRole("heading", { name: "System Settings" }),
    ).toBeVisible();
    await expect(page.getByText("currency")).toBeVisible();
    await expect(page.getByText("USD")).toBeVisible();
  });

  test("admin sees admin user name in sidebar footer", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // The sidebar footer shows user.name or user.email
    await expect(
      page.getByText("Test Admin").or(page.getByText("admin@cellarboss.test")),
    ).toBeVisible();
  });

  test("non-admin shows user name in sidebar footer", async ({
    userContext,
  }) => {
    const page = await userContext.newPage();
    await page.goto("/wines");

    await expect(
      page.getByText("Test User").or(page.getByText("user@cellarboss.test")),
    ).toBeVisible();
  });
});
