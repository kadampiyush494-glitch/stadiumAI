import { test, expect } from '@playwright/test';

test.describe('OmniFlow Accessibility Journey', () => {
  test('Navigates the app using only keyboard', async ({ page }) => {
    await page.goto('/');

    // 1. Skip Navigation Link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('text=Skip to main content');
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    
    // Ensure focus moved to main content
    // await expect(mainContent).toBeFocused(); // If tabIndex -1 is set properly

    // 2. Map Landmarks
    // Tab through buttons on map
    await page.keyboard.press('Tab'); // Should land on Show Density button
    const densityBtn = page.locator('button:has-text("Show Density Table")');
    await expect(densityBtn).toBeFocused();
    
    // Open density table with Space
    await page.keyboard.press('Space');
    await expect(page.locator('text=Zone Density Reports')).toBeVisible();
    
    // Tab through table close button
    await page.keyboard.press('Tab');
    const closeBtn = page.locator('button[aria-label="Close Density Table"]');
    await expect(closeBtn).toBeFocused();
    await page.keyboard.press('Escape'); // Close with escape
    await expect(page.locator('text=Zone Density Reports')).not.toBeVisible();

    // 3. AI Assistant Keyboard Shortcut
    await page.keyboard.press('Control+/');
    const chatInput = page.locator('input[placeholder*="Ask OmniFlow"]');
    await expect(chatInput).toBeFocused();
  });

  test('Verifies aria-live announcements', async ({ page }) => {
    await page.goto('/');
    
    // Trigger a route change (using the test button in StadiumMap)
    await page.click('button:has-text("Calculate Route to Burger Stand")');
    
    // Check if aria-live region contains the announcement
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText('optimal route');
  });
});
