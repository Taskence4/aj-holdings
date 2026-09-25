const {chromium}=require('C:/Users/Lenovo/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[];
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('file:///C:/AI-Lab/projects/frontend-sites/aj-holdings/index.html');
   await page.waitForTimeout(1700);
   const summaries=page.locator('.asset-list summary');
   await summaries.nth(2).click();await page.waitForTimeout(450);
   assert.equal(await page.locator('.asset-list details[open]').count(),1);
   await summaries.nth(2).focus();await page.keyboard.press('Enter');await page.waitForTimeout(450);
   assert.equal(await page.locator('.asset-list details[open]').count(),0);
   await summaries.nth(1).click();await page.waitForTimeout(80);await summaries.nth(3).click();await page.waitForTimeout(500);
   assert.equal(await page.locator('.asset-list details[open]').count(),1);
   assert.ok(await page.locator('.asset-list details').nth(3).getAttribute('open')!==null);
   assert.equal(await page.locator('.asset-list details[style*="overflow"]').count(),0);
   assert.ok(await page.locator('.masthead').evaluate(e=>e.classList.contains('is-scrolled')));
   if(width<761){
    await page.locator('.menu-toggle').click();await page.waitForTimeout(450);
    await page.keyboard.press('Escape');await page.waitForTimeout(250);
    assert.ok(await page.locator('.mobile-nav').isHidden());
    await page.locator('.menu-toggle').click();await page.locator('.menu-toggle').click();await page.locator('.menu-toggle').click();await page.waitForTimeout(450);
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
    await page.locator('.mobile-nav a[href="#leadership"]').click();await page.waitForTimeout(1000);
    assert.ok(await page.locator('.mobile-nav').isHidden());
    assert.equal(await page.evaluate(()=>document.activeElement.id),'leadership');
    assert.ok(!await page.locator('body').evaluate(e=>e.classList.contains('menu-open')));
   }
   await page.evaluate(()=>document.documentElement.style.scrollBehavior='auto');
   for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=500){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(110);}
   await page.waitForTimeout(1100);
   assert.equal(await page.locator('.pending').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.emulateMedia({reducedMotion:'reduce'});
   await summaries.first().click();
   assert.equal(await page.locator('.asset-list details[open]').count(),1);
   assert.equal(await page.locator('.asset-list').evaluate(el=>el.getAnimations({subtree:true}).length),0);
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`output/review/motion-${width}-full.png`,fullPage:true});
   await page.close();console.log(`PASS ${width}px: motion entrances, reveals, sticky nav, keyboard and interrupted accordions, mobile menu, live reduced-motion preference, overflow`);
  }
  assert.deepEqual(errors,[]);console.log('PASS no browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
