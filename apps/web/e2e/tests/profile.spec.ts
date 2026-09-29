import { test, expect, getState } from "../fixtures/auth";

test.describe("Profile password change", () => {
  test("changes the password through change-password", async ({
    userPage: page,
  }) => {
    await page.goto("/profile");

    await page.getByLabel(/^Current Password/).fill("UserPass1!");
    await page.getByLabel(/^New Password/).fill("NewPass1!");
    await page.getByLabel("Confirm New Password").fill("NewPass1!");

    const updateUserRequest = page.waitForRequest("**/api/auth/update-user");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Changes saved successfully!")).toBeVisible();

    const { userPasswords } = await getState();
    expect(userPasswords["regular-user-1"]).toBe("NewPass1!");

    // update-user ignores passwords, so the password must not be sent there
    const updateUserBody = (await updateUserRequest).postDataJSON();
    expect(updateUserBody).not.toHaveProperty("password");
  });

  test("shows an error when the current password is wrong", async ({
    userPage: page,
  }) => {
    await page.goto("/profile");

    await page.getByLabel(/^Current Password/).fill("WrongPass1!");
    await page.getByLabel(/^New Password/).fill("NewPass1!");
    await page.getByLabel("Confirm New Password").fill("NewPass1!");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText(/Current password is incorrect/)).toBeVisible();

    const { userPasswords } = await getState();
    expect(userPasswords["regular-user-1"]).toBe("UserPass1!");
  });
});
