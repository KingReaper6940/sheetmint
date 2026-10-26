import test from 'node:test';import assert from 'node:assert/strict';import {DEFAULT,normalize,positions,paginate} from '../src/layout.mjs';
test('default measured grid fits A4',()=>{const cells=positions(DEFAULT);assert.equal(cells.length,24);assert.deepEqual(cells[0],{slot:0,x:8,y:10,width:63,height:33});assert.equal(cells[23].x,140);assert.equal(cells[23].y,255);});
test('scattered used positions skipped only on first sheet without reordering',()=>{const data=Array.from({length:25},(_,i)=>i);const r=paginate(data,{...DEFAULT,used:[0,3]});assert.equal(r.pages.length,2);assert.equal(r.pages[0][0].label,null);assert.equal(r.pages[0][1].label,0);assert.equal(r.pages[1][0].label,22);assert.deepEqual(r.pages.flat().filter(p=>p.label!==null).map(p=>p.label),data);});
test('invalid geometry and exhausted first sheet fail clearly',()=>{for(const change of [{width:100},{rows:1.5},{cols:6,rows:12},{font:NaN},{used:[24]},{used:[1,1]},{used:Array.from({length:24},(_,i)=>i)}])assert.throws(()=>normalize({...DEFAULT,...change}));});
test('page cap rejects without silent truncation',()=>assert.throws(()=>paginate(Array.from({length:21},(_,i)=>i),{...DEFAULT,rows:1,cols:1}),/20 sheets/));

test('28 measured grids preserve every record once within page bounds',()=>{
 for(let rows=2;rows<=8;rows++)for(let cols=2;cols<=5;cols++){
  const slots=rows*cols,used=Array.from({length:slots},(_,i)=>i).filter(i=>i%3===0);
  const settings={...DEFAULT,rows,cols,left:8,top:10,gapX:2,gapY:2,width:(210-16-(cols-1)*2)/cols,height:(297-20-(rows-1)*2)/rows,used};
  const labels=Array.from({length:73},(_,i)=>'Label '+i),job=paginate(labels,settings);
  assert.deepEqual(job.pages.flat().filter(c=>c.label!==null).map(c=>c.label),labels);
  for(const [page,cells] of job.pages.entries())for(const c of cells){assert.ok(c.x>=0&&c.y>=0&&c.x+c.width<=210.000001&&c.y+c.height<=297.000001);if(page>0)assert.equal(c.used,false);if(c.label===null)assert.equal(c.index,null);}
 }
});
