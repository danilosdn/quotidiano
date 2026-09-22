import { test, expect, Page } from '@playwright/test';

declare global {
  interface Window {
    __QUOTIDIANO__: {
      state:()=>any;
      walkTo:(x:number,y:number)=>number;
      interact:()=>Promise<void>;
      walkable:(x:number,y:number)=>boolean;
    }
  }
}

async function waitScene(page:Page,scene:string){
  await page.waitForFunction((s:string)=>window.__QUOTIDIANO__?.state().scene===s,scene,{timeout:10000});
}
async function walk(page:Page,x:number,y:number){
  const count=await page.evaluate(([tx,ty]:number[])=>window.__QUOTIDIANO__.walkTo(tx,ty),[x,y]);
  expect(count).toBeGreaterThan(0);
  await page.waitForFunction(()=>window.__QUOTIDIANO__?.state().playerState==='PLAYER_FREE',undefined,{timeout:10000});
  await page.waitForTimeout(120);
}
async function interact(page:Page){
  await page.evaluate(()=>{ void window.__QUOTIDIANO__.interact(); });
  await page.waitForTimeout(100);
}
async function startNewDay(page:Page){
  await page.goto('/?e2e=1');
  await page.mouse.click(640,465);
  await waitScene(page,'HomeScene');
}
async function collectKeysAndExit(page:Page){
  await walk(page,635,700);await interact(page);
  await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().save.storyFlags.keysCollected)).toBe(true);
  await walk(page,638,842);await interact(page);await waitScene(page,'StreetScene');
}
async function finishDialogue(page:Page,firstChoice:string){
  await page.getByRole('button',{name:firstChoice}).click();
  const cont=page.getByRole('button',{name:'Continuar'});
  if(await cont.isVisible()) await cont.click();
  await page.waitForFunction(()=>!document.querySelector('.q-dialogue.visible'));
}

test.describe('QUOTIDIANO V1.1 functional route',()=>{
  test.setTimeout(120000);

  test('Casa → Rua → Casa → Rua is stable for five cycles',async({page})=>{
    await startNewDay(page);
    await page.screenshot({path:'screenshots/home_v11.png'});
    await collectKeysAndExit(page);
    await page.screenshot({path:'screenshots/street_v11.png'});

    await walk(page,300,284);
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().interaction)).toBe('house');
    await expect(page.locator('#q-prompt')).toContainText('Entrar em casa');
    await page.screenshot({path:'screenshots/house_entry.png'});

    for(let i=0;i<5;i++){
      await interact(page);await waitScene(page,'HomeScene');
      expect(await page.evaluate(()=>window.__QUOTIDIANO__.walkable(638,842))).toBe(true);
      await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().interaction)).toBe('exit');
      await interact(page);await waitScene(page,'StreetScene');
      await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().interaction)).toBe('house');
    }
  });

  test('Rua interactions: Pieter, Lotte, Pip, banco and click-to-move around the bench',async({page})=>{
    await startNewDay(page);await collectKeysAndExit(page);

    await walk(page,690,342);await interact(page);
    await page.getByRole('button',{name:'Ja, goed! En met u?'}).click();
    await page.getByRole('button',{name:'Continuar'}).click();
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().save.storyFlags.metPieter)).toBe(true);

    await walk(page,1370,382);
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().interaction)).toBe('lotte');
    await interact(page);
    await page.waitForSelector('.q-dialogue.visible');
    await page.screenshot({path:'screenshots/lotte_interaction.png'});
    await finishDialogue(page,'Mag ik hem aaien?');

    await walk(page,1495,410);
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().interaction)).toBe('pip');
    await interact(page);
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().save.npcMemory.pip?.petted)).toBe(true);

    await walk(page,1160,392);
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().interaction)).toBe('bench');
    await interact(page);
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().playerState)).toBe('PLAYER_SITTING');
    await interact(page);
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().playerState)).toBe('PLAYER_FREE');

    // From below the bench to a point visually behind it: route must go around the collider.
    await walk(page,1160,430);
    const routeNodes=await page.evaluate(()=>window.__QUOTIDIANO__.walkTo(1160,270));
    expect(routeNodes).toBeGreaterThan(1);
    await page.waitForFunction(()=>window.__QUOTIDIANO__.state().playerState==='PLAYER_FREE',undefined,{timeout:10000});
    const pos=await page.evaluate(()=>window.__QUOTIDIANO__.state());
    expect(Math.hypot(pos.x-1160,pos.y-270)).toBeLessThan(35);

    // A target on the physical bench must resolve safely or cancel; never remain in AUTOWALK.
    await page.evaluate(()=>window.__QUOTIDIANO__.walkTo(1160,325));
    await page.waitForFunction(()=>window.__QUOTIDIANO__.state().playerState==='PLAYER_FREE',undefined,{timeout:10000});
    await page.waitForTimeout(850);
    expect(await page.evaluate(()=>window.__QUOTIDIANO__.state().playerState)).toBe('PLAYER_FREE');
  });

  test('Rua → Café → Rua → Casa and café order flow remain functional',async({page})=>{
    await startNewDay(page);await collectKeysAndExit(page);
    await walk(page,2165,292);await interact(page);await waitScene(page,'CafeScene');
    await page.screenshot({path:'screenshots/cafe_v11.png'});

    await walk(page,1060,455);await interact(page);
    await page.getByRole('button',{name:'Een koffie, alsjeblieft.'}).click();
    await page.getByRole('button',{name:'Met melk, graag.'}).click();
    await page.getByRole('button',{name:'Alsjeblieft.'}).click();
    await page.getByRole('button',{name:'Continuar'}).click();
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().save.storyFlags.cafeOrdered)).toBe(true);

    await walk(page,965,465);await interact(page);
    await expect.poll(()=>page.evaluate(()=>window.__QUOTIDIANO__.state().save.storyFlags.coffeePicked)).toBe(true);

    await walk(page,750,820);await interact(page);await waitScene(page,'StreetScene');
    await walk(page,300,284);await interact(page);await waitScene(page,'HomeScene');
    expect(await page.evaluate(()=>window.__QUOTIDIANO__.state().scene)).toBe('HomeScene');
  });
});
