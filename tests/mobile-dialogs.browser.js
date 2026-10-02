async (page) => {
  const failures = [];
  const check = (ok, label) => { if (!ok) failures.push(label); };
  const base = 'http://127.0.0.1:8769/';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width,height] of [[320,568],[360,640],[390,844],[430,932],[568,320],[667,375],[844,390],[820,1180]]) {
    await page.setViewportSize({width,height});
    await page.goto(`${base}?popup=${width}`);
    await page.locator('[data-details="strength"]').scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await page.locator('[data-details="strength"]').click();
    const bounds = await page.locator('#program-dialog').evaluate(d => {
      const r=d.getBoundingClientRect();
      return {top:r.top,left:r.left,height:r.height,width:r.width,viewportWidth:document.documentElement.clientWidth,viewportHeight:visualViewport.height,scroll:d.scrollTop};
    });
    check(Math.abs(bounds.top)<1 && Math.abs(bounds.left)<1, `${width}: card opens below the viewport`);
    check(Math.abs(bounds.height-bounds.viewportHeight)<1 && Math.abs(bounds.width-bounds.viewportWidth)<2, `${width}: card is not full screen`);
    check(bounds.scroll===0, `${width}: card opens at previous scroll position`);
    await page.locator('#program-dialog').evaluate(d=>d.scrollTop=d.scrollHeight);
    const close = await page.locator('#program-dialog [data-close]').boundingBox();
    check(close.y>=0 && close.y+close.height<=height, `${width}: close button scrolls off screen`);
    await page.locator('#program-dialog [data-close]').click();
    await page.waitForTimeout(40);
    check(Math.abs(await page.evaluate(()=>scrollY)-before)<2, `${width}: background position jumps after closing`);
    await page.locator('[data-details="strength"]').click();
    check(await page.locator('#program-dialog').evaluate(d=>d.scrollTop)===0, `${width}: reopened card not reset`);
    await page.locator('#program-enquiry').click();
    check(await page.locator('dialog[open]').count()===1, `${width}: program/enquiry overlap`);
    await page.locator('#enquiry-message').focus();
    check(await page.locator('#enquiry-message').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=16, `${width}: input can trigger phone auto-zoom`);
    // Resizing simulates the reduced usable viewport with an on-screen keyboard.
    await page.setViewportSize({width,height:Math.max(280,Math.round(height*.6))});
    await page.waitForTimeout(60);
    check(await page.locator('#enquiry-dialog').evaluate(d=>Math.abs(d.getBoundingClientRect().height-visualViewport.height)<1), `${width}: dialog does not follow keyboard viewport`);
    await page.locator('#enquiry-dialog').evaluate(d=>d.scrollTop=d.scrollHeight);
    await page.locator('#enquiry-dialog [data-close]').click();
    await page.waitForTimeout(40);
    check(!await page.locator('body').evaluate(b=>b.classList.contains('dialog-scroll-locked')), `${width}: body remains locked`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(`${base}?popup=final`);
  await page.locator('[data-details="strength"]').click();
  await page.locator('#program-image').evaluate(i=>i.decode());
  await page.screenshot({path:'outputs/gym-mobile-card-fixed.png'});
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:1280,height:800});
  await page.locator('[data-details="strength"]').click();
  check(await page.locator('#program-dialog').evaluate(d=>d.getBoundingClientRect().width<=620), 'Desktop dialog no longer uses compact layout');
  await page.keyboard.press('Escape');
  if(failures.length) throw new Error(failures.join('\n'));
  return {passed:true,mobileSizes:8,fullScreen:true,stickyClose:true,scrollRestoration:true,reopen:true,viewportResize:true,desktop:true};
}
