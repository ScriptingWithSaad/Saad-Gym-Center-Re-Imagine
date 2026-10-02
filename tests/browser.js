async (page) => {
  const base = 'http://127.0.0.1:8769/';
  const errors = [];
  const failures = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (ok, message) => { if (!ok) failures.push(message); };
  const sizes = [[320,568],[360,640],[390,844],[430,932],[600,800],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900],[1920,1080],[667,375],[844,390]];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.goto(`${base}?qa=${width}`);
    await page.waitForLoadState('networkidle');
    const layout = await page.evaluate(() => {
      const limit = document.documentElement.clientWidth;
      const outside = [...document.querySelectorAll('h1,h2,.program-card,.plan,.button,.filters,.nav-shell')].filter(e => e.getBoundingClientRect().width > 0).filter(e => {
        const r = e.getBoundingClientRect();
        return r.left < -1 || r.right > limit + 1;
      }).map(e => e.className || e.tagName);
      const nav = document.querySelector('.nav-shell');
      const h1 = document.querySelector('h1');
      return { outside, overflow: document.documentElement.scrollWidth > limit, navFits: nav.scrollWidth <= nav.clientWidth,
        headlineLines: Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight)),
        fontLoaded: document.fonts.check('800 48px Barlow'), heroLoaded: document.querySelector('.hero-image img').naturalWidth > 0 };
    });
    check(!layout.overflow && !layout.outside.length, `${width}x${height}: horizontal clipping ${layout.outside}`);
    check(layout.navFits, `${width}: navigation does not fit`);
    check(layout.headlineLines === 3, `${width}: hero headline breaks unexpectedly`);
    check(layout.fontLoaded && layout.heroLoaded, `${width}: first-view assets missing`);
    if (width <= 760) {
      await page.locator('.menu-toggle').click();
      check(await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'true', `${width}: menu does not open`);
      await page.locator('#navigation a[href="#membership"]').click();
      check(await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'false', `${width}: menu stays open after navigation`);
    }
    await page.locator('[data-enquiry^="Premium"]').click();
    const dialog = await page.locator('#enquiry-dialog').evaluate(d => ({ open: d.open, width: d.clientWidth, available: innerWidth, scroll: d.scrollWidth }));
    check(dialog.open && dialog.width <= dialog.available && dialog.scroll <= dialog.width, `${width}: enquiry dialog clips`);
    check((await page.locator('#enquiry-message').inputValue()).includes('Premium membership'), `${width}: plan choice lost`);
    await page.locator('#enquiry-dialog [data-close]').click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}?interactions=1`);
  await page.waitForLoadState('networkidle');
  check(await page.locator('.program-card:visible').count() === 4, 'Initial program selection should show four');
  for (const [filter, count] of [['strength',4],['conditioning',2],['mobility',2]]) {
    await page.locator(`[data-filter="${filter}"]`).click();
    check(await page.locator('.program-card:visible').count() === count, `${filter}: wrong program count`);
    check(await page.locator(`.program-card:visible:not([data-category="${filter}"])`).count() === 0, `${filter}: unrelated cards shown`);
  }
  await page.locator('[data-filter="all"]').click();
  await page.locator('#more-programs').click();
  check(await page.locator('.program-card:visible').count() === 8, 'View all does not show all programs');
  await page.locator('[data-details="pilates"]').click();
  check(await page.locator('#program-title').textContent() === 'Pilates', 'Program dialog displays wrong details');
  check(await page.locator('#program-focus li').count() === 3, 'Program focus missing');
  await page.locator('#program-enquiry').click();
  check(await page.locator('#enquiry-message').inputValue().then(value => value.includes('Pilates')), 'Program not carried into enquiry');
  check(await page.locator('dialog[open]').count() === 1, 'Dialogs overlap');
  // Exercise the clipboard handler without replacing the computer clipboard.
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedEnquiry = text; } } }));
  await page.locator('#enquiry-message').fill('Please tell me about Pilates sessions.');
  await page.locator('#copy-enquiry').click();
  check(await page.evaluate(() => window.copiedEnquiry) === 'Please tell me about Pilates sessions.', 'Edited enquiry not copied');
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Denied'); }; });
  await page.locator('#copy-enquiry').click();
  check((await page.locator('#copy-status').innerText()).includes('Select and copy'), 'Clipboard fallback is misleading');
  await page.keyboard.press('Escape');
  check(await page.locator('dialog[open]').count() === 0, 'Escape does not dismiss enquiry');
  check(await page.locator('[data-details="pilates"]').evaluate(e => e === document.activeElement), 'Focus not restored to selected program');
  check(!await page.locator('body').evaluate(b => b.classList.contains('modal-open')), 'Scroll remains locked after closing dialog');
  await page.locator('#more-programs').click();
  check(await page.locator('.program-card:visible').count() === 4, 'Show fewer fails');
  await page.locator('.faq summary').first().click();
  check(await page.locator('.faq details').first().evaluate(d => d.open), 'FAQ fails to expand');
  await page.locator('.menu-toggle').click();
  await page.keyboard.press('Escape');
  check(await page.locator('.menu-toggle').evaluate(b => b === document.activeElement), 'Escape does not restore menu focus');
  await page.locator('.menu-toggle').click();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(80);
  check(await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'false', 'Menu state survives desktop resize');
  check(await page.locator('a[href="https://www.facebook.com/ScriptingwithSaad/"]').count() === 1, 'Facebook link missing');
  check(await page.locator('a[href="https://github.com/ScriptingWithSaad"]').count() === 1, 'GitHub link missing');
  await page.locator('#trainers').scrollIntoViewIfNeeded();
  await page.locator('.club-image img').evaluate(i => i.decode());
  await page.evaluate(() => scrollTo(0,0));
  await page.screenshot({ path: 'outputs/gym-desktop-final.png', fullPage: true });
  await page.screenshot({ path: 'outputs/gym-hero-final.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'outputs/gym-mobile-final.png' });

  const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 3, hasTouch: true });
  const phone = await context.newPage();
  await phone.goto(base);
  await phone.waitForLoadState('networkidle');
  await phone.locator('.menu-toggle').tap();
  await phone.locator('#navigation a[href="#membership"]').tap();
  await phone.locator('[data-enquiry^="Basic"]').tap();
  check(await phone.locator('#enquiry-dialog').evaluate(d => d.open), 'Touch membership enquiry fails');
  await phone.locator('#enquiry-dialog [data-close]').tap();
  await context.close();
  const noJS = await page.context().browser().newContext({ viewport: { width: 320, height: 568 }, javaScriptEnabled: false });
  const fallback = await noJS.newPage();
  await fallback.goto(base);
  check(await fallback.locator('.program-card:visible').count() === 8, 'No-JS visitors lose programs');
  check(await fallback.locator('a[href="https://www.instagram.com/scriptingwithsaad"]:visible').count() >= 1, 'No-JS contact unavailable');
  check(await fallback.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'No-JS mobile layout overflows');
  await noJS.close();
  check(errors.length === 0, `Page errors: ${errors.join(', ')}`);
  if (failures.length) throw new Error(failures.join('\n'));
  return { passed: true, viewports: sizes.length, filters: true, dialogs: true, clipboard: 'success and failure paths', keyboard: true, touch: true, reducedMotion: true, noJavaScript: true };
}
