import { test, expect } from '@playwright/test';

test.describe('OmniFlow User Journey', () => {
  test('Completes a full stadium navigation flow', async ({ page }) => {
    // 1. User opens app
    await page.goto('/');
    
    // 2. Sees stadium map
    const map = page.locator('#stadium-map-instance');
    await expect(map).toBeVisible();

    // 3. User asks AI: "nearest restroom"
    // Assuming Ctrl+/ opens chat as per hooks
    await page.keyboard.press('Control+/');
    const chatInput = page.locator('input[placeholder*="Ask OmniFlow"]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill('nearest restroom');
    await page.keyboard.press('Enter');

    // 4. Gets response (waiting for AI skeleton to disappear and message to appear)
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 10000 });

    // 5. User receives congestion notification (simulated check)
    // In real E2E we might trigger a mock firestore update that triggers the notification UI
    // For now we check the NotifCenter presence
    const bellIcon = page.locator('button[aria-label*="Notification"]');
    await expect(bellIcon).toBeVisible();

    // 6. User follows exit route to gate
    // Trigger Exit Mode
    await page.click('text=Smart Exit');
    const exitCard = page.locator('text=Personalized Departure');
    await expect(exitCard).toBeVisible();
    
    const navigateBtn = page.locator('button:has-text("Navigate to Gate")');
    await expect(navigateBtn).toBeVisible();
    await navigateBtn.click();
    
    // Final check for navigation active state
    await expect(page.locator('text=Enroute to Gate')).toBeVisible();
  });
});
