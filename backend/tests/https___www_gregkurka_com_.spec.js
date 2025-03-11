const { test, expect } = require('@playwright/test');

test('Greg Kurka website main interaction tests', async ({ page }) => {
    await page.goto('https://www.gregkurka.com/');
    await page.waitForLoadState('domcontentloaded');

    const pageHeader = page.locator('header h1');
    await expect(pageHeader).toBeVisible();
    await expect(pageHeader).toHaveText('Greg Kurka');

    const musicReelHeading = page.locator('h3', { hasText: 'Music Reel' });
    await expect(musicReelHeading).toBeVisible();
    const musicReelIframe = musicReelHeading.locator('xpath=../following-sibling::div[1]//iframe');
    await expect(musicReelIframe).toBeVisible();

    const soundDesignReelHeading = page.locator('h3', { hasText: 'Sound Design Reel' });
    await expect(soundDesignReelHeading).toBeVisible();
    const soundDesignIframe = soundDesignReelHeading.locator('xpath=../following-sibling::div[1]//iframe');
    await expect(soundDesignIframe).toBeVisible();

    const unityProjectHeading = page.locator('h3', { hasText: '3d Game Kit Project for Unity and Wwise' });
    await expect(unityProjectHeading).toBeVisible();
    const unityIframe = unityProjectHeading.locator('xpath=../following-sibling::div[1]//iframe');
    await expect(unityIframe).toBeVisible();

    const unrealProjectHeading = page.locator('h3', { hasText: 'Lyra Project for Unreal Engine and FMOD' });
    await expect(unrealProjectHeading).toBeVisible();
    const unrealIframe = unrealProjectHeading.locator('xpath=../following-sibling::div[1]//iframe');
    await expect(unrealIframe).toBeVisible();

    const pianoHeading = page.locator('h3', { hasText: 'Piano Improvisations' });
    await expect(pianoHeading).toBeVisible();
    const pianoIframe = pianoHeading.locator('xpath=../following-sibling::div[1]//iframe');
    await expect(pianoIframe).toBeVisible();

    const headshotImage = page.locator('img[alt="Greg Kurka Headshot"]');
    await expect(headshotImage).toBeVisible();

    const linkedInLink = page.locator('a[href*="linkedin.com/in/greg-kurka-14874a148"]');
    await expect(linkedInLink).toBeVisible();
    await linkedInLink.click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('linkedin.com/in/greg-kurka-14874a148');
    await page.goBack();

    const programmingLink = page.locator('a[href="https://gregkurka.com/programming/"]');
    await expect(programmingLink).toBeVisible();
    await programmingLink.click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/programming/');
    await page.goBack();

    const compositionLink = page.locator('a[href="https://gregkurka.com/composition/"]');
    await expect(compositionLink).toBeVisible();
    await compositionLink.click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/composition/');
    await page.goBack();

    const footerEmail = page.locator('footer a[href="mailto:gregkurka@gmail.com"]');
    await expect(footerEmail).toBeVisible();
    await expect(footerEmail).toHaveAttribute('href', 'mailto:gregkurka@gmail.com');
});