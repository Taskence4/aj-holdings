const { chromium } = require('C:/Users/Lenovo/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
 const errors=[];
 const entry=process.argv[2]||'index.html';
 const prefix=entry==='classic.html'?'classic':'aj';
 const url=pathToFileURL(path.resolve(entry)).href;
 try {
  for(const width of [1440,768,390,320]) {
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.evaluate(()=>document.fonts.ready);
   assert.deepEqual(await page.locator('main > section').evaluateAll(es=>es.map(e=>e.id)),['home','about','investments','strategies','portfolio','global','leadership','contact']);
   assert.equal((await page.locator('h1').innerText()).replace(/\s+/g,' ').trim(),'Built for lasting value.');
   assert.equal(await page.locator('.asset-list details').count(),5);
   assert.equal(await page.locator('.strategy').count(),5);
   assert.equal(await page.locator('.portfolio-wall img').count(),10);
   assert.equal(await page.locator('[data-market]').count(),6);
   assert.equal(await page.locator('.faq, .partner-strip, .statement, .facts').count(),0);
   assert.ok(await page.evaluate(()=>document.fonts.check('500 20px Orbitron')));
   for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700) {await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(60)}
   await page.evaluate(()=>scrollTo(0,0));
   const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));
   assert.deepEqual(broken,[]);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
   assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>!document.querySelector(h))),[]);
   for (let i=0;i<5;i++) {
    await page.locator('.asset-list summary').nth(i).click();
    if(await page.locator('.asset-list details').nth(i).getAttribute('open')===null) await page.locator('.asset-list summary').nth(i).click();
    assert.equal(await page.locator('.asset-list details[open]').count(),1);
   }
   await page.locator('.asset-list summary').first().click();
   for (const code of ['ae','in','hk','sg','us','gb']) {
    const button=page.locator(`[data-market="${code}"]`);await button.click();
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.locations [aria-pressed=true]').count(),1);
    assert.equal(await page.locator('#globe-selection').innerText(),await button.locator('span').innerText());
   }
   const before=await page.locator('#globe').evaluate(c=>c.toDataURL());
   await page.locator('#globe-right').click();
   assert.notEqual(await page.locator('#globe').evaluate(c=>c.toDataURL()),before);
   const box=await page.locator('#globe').boundingBox();
   const beforeDrag=await page.locator('#globe').evaluate(c=>c.toDataURL());
   await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.5,{steps:5});await page.mouse.up();
   assert.notEqual(await page.locator('#globe').evaluate(c=>c.toDataURL()),beforeDrag);
   await page.locator('[data-market=ae]').click();
   if(width<761) {
    await page.evaluate(()=>scrollTo(0,0));await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.ok(await page.locator('.mobile-nav').isHidden());
    await page.locator('.menu-toggle').click();await page.locator('.mobile-nav a[href="#portfolio"]').click();assert.ok(await page.locator('.mobile-nav').isHidden());
   }
   await page.evaluate(()=>scrollTo(0,0));
   if(width===1440||width===390) {
    await page.screenshot({path:`output/review/${prefix}-${width}.png`});
    await page.screenshot({path:`output/review/${prefix}-${width}-full.png`,fullPage:true});
    await page.locator('#global').screenshot({path:`output/review/${prefix}-global-${width}.png`});
   }
   console.log(`PASS ${width}px: eight-section structure, content counts, fonts, images, anchors, layout, accordions, globe selection / rotation / drag, navigation`);
   await page.close();
  }
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(url);assert.ok(await nojs.locator('#about h2').isVisible());assert.equal(await nojs.locator('.locations button:disabled').count(),6);assert.ok(await nojs.locator('.globe-fallback').isVisible());await nojs.close();
  assert.deepEqual(errors,[]);console.log('PASS: no JavaScript errors; readable content and globe fallback without JavaScript');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
