import { test, expect, getState, resetState } from "../fixtures/auth";

type PasswordState = { userPasswords: Record<string, string> };

test.describe("Profile password change", () => {
  test.afterEach(async () => {
    await resetState();
  });

  test("changes the password through change-password", async ({
    userContext,
  }) => {
    const page = await userContext.newPage();
    await page.goto("/profile");

    await page.getByLabel(/^Current Password/).fill("OldPass1!");
    await page.getByLabel(/^New Password/).fill("NewPass1!");
    await page.getByLabel("Confirm New Password").fill("NewPass1!");

    const updateUserRequest = page.waitForRequest("**/api/auth/update-user");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Changes saved successfully!")).toBeVisible();

    const { userPasswords } = await getState<PasswordState>();
    expect(userPasswords["regular-user-1"]).toBe("NewPass1!");

    // update-user ignores passwords, so the password must not be sent there
    const updateUserBody = (await updateUserRequest).postDataJSON();
    expect(updateUserBody).not.toHaveProperty("password");
  });

  test("shows an error when the current password is wrong", async ({
    userContext,
  }) => {
    const page = await userContext.newPage();
    await page.goto("/profile");

    await page.getByLabel(/^Current Password/).fill("wrongpassword");
    await page.getByLabel(/^New Password/).fill("NewPass1!");
    await page.getByLabel("Confirm New Password").fill("NewPass1!");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText(/Current password is incorrect/)).toBeVisible();

    const { userPasswords } = await getState<PasswordState>();
    expect(userPasswords["regular-user-1"]).toBeUndefined();
  });
});

test.describe("Admin user password reset", () => {
  test.afterEach(async () => {
    await resetState();
  });

  test("admin can set another user's password", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/users/admin-user-1/edit");

    await page.getByLabel(/^New Password/).fill("NewPass1!");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Changes saved successfully!")).toBeVisible();

    const { userPasswords } = await getState<PasswordState>();
    expect(userPasswords["admin-user-1"]).toBe("NewPass1!");
  });
});
