import {test} from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {centerItems,fieldItems,guides} from '../src/content';
import {itemMedia,itemGuide} from '../src/item-media';
import {packingStatus} from '../src/packing-structure';
test('39 unique checklist entries have existing illustration assets and valid guide routes',async()=>{
 const items=[...centerItems,...fieldItems];assert.equal(items.length,39);assert.equal(new Set(items.map(x=>x.id)).size,39);
 for(const item of items){const image=itemMedia[item.id];assert.ok(image?.illustrationOnly);await access(new URL('../public'+image.src,import.meta.url));const guide=itemGuide(item.id);if(guide)assert.ok(guides.some(g=>g.id===guide));}
});
test('center summary is not double-counted and field17texts/quantities stay verbatim',async()=>{
 assert.equal(centerItems.length,22);assert.ok(!centerItems.some(i=>i.id==='day-uniform'));assert.ok(centerItems.some(i=>i.id==='day-shirt'));assert.ok(centerItems.some(i=>i.id==='day-pants'));
 const poster=JSON.parse(await readFile(new URL('../src/data/poster.json',import.meta.url),'utf8'));assert.equal(fieldItems.length,17);
 for(const original of poster){const actual=fieldItems.find(i=>i.id===original.itemId)!;assert.equal(actual.text,original.text);assert.equal(actual.quantity,original.quantityNote);assert.ok(actual.references[0].url.includes('668885802086250'));}
 assert.equal(fieldItems.find(i=>i.id==='pack-shoe-care')!.group,'ของใช้ส่วนตัว · ตามภาพปี 2566');
 assert.ok(packingStatus('day-phone','center').includes('ยังไม่ยืนยัน'));assert.ok(packingStatus('day-medicine','center').includes('ผู้ที่จำเป็น'));
});
