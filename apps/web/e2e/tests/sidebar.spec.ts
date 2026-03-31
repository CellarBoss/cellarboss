import { test, expect, resetState } from "../fixtures/auth";

test.describe("Sidebar", () => {
  test.afterEach(async () => {
    await resetState();
  });

  test.describe("Collapse and expand", () => {
    test("collapse button toggles sidebar to icon-only mode", async ({
      adminContext,
    }) => {
      const page = await adminContext.newPage();
      await page.goto("/wines");

      const sidebar = page.locator("[data-state][data-collapsible]");
      await expect(sidebar).toHaveAttribute("data-state", "expanded");

      await page.getByRole("button", { name: "User menu" }).click();
      await page.getByRole("menuitem", { name: "Collapse sidebar" }).click();
      await expect(sidebar).toHaveAttribute("data-state", "collapsed");

      await page.getByRole("button", { name: "User menu" }).click();
      await page.getByRole("menuitem", { name: "Expand sidebar" }).click();
      await expect(sidebar).toHaveAttribute("data-state", "expanded");
    });

    test("collapsed state persists across navigation", async ({
      adminContext,
    }) => {
      const page = await adminContext.newPage();
      await page.goto("/wines");

      const sidebar = page.locator("[data-state][data-collapsible]");

      // Collapse the sidebar via user menu
      await page.getByRole("button", { name: "User menu" }).click();
      await page.getByRole("menuitem", { name: "Collapse sidebar" }).click();
      await expect(sidebar).toHaveAttribute("data-state", "collapsed");

      // Navigate to another page
      await page.goto("/grapes");
      await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    });

    test("menu items show tooltips when sidebar is collapsed", async ({
      adminContext,
    }) => {
      const page = await adminContext.newPage();
      await page.goto("/wines");

      // Collapse the sidebar via user menu
      await page.getByRole("button", { name: "User menu" }).click();
      await page.getByRole("menuitem", { name: "Collapse sidebar" }).click();
      const sidebar = page.locator("[data-state][data-collapsible]");
      await expect(sidebar).toHaveAttribute("data-state", "collapsed");

      // Hover over a menu item and check tooltip appears
      const bottlesLink = page.getByRole("link", { name: "Bottles" });
      await bottlesLink.hover();
      await expect(
        page.getByRole("tooltip", { name: "Bottles" }),
      ).toBeVisible();
    });
  });

  test.describe("Dark mode", () => {
    test("toggle switches between light and dark mode", async ({
      adminContext,
    }) => {
      const page = await adminContext.newPage();
      await page.goto("/wines");

      const html = page.locator("html");

      // Should start without dark class
      await expect(html).not.toHaveClass(/dark/);

      // Open user menu and toggle dark mode
      await page.getByRole("button", { name: "User menu" }).click();
      await page.getByRole("menuitem", { name: "Toggle theme" }).click();
      await expect(html).toHaveClass(/dark/);

      // Open user menu again and toggle back to light mode
      await page.getByRole("button", { name: "User menu" }).click();
      await page.getByRole("menuitem", { name: "Toggle theme" }).click();
      await expect(html).not.toHaveClass(/dark/);
    });
  });
});
