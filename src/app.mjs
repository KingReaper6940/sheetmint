import {DEFAULT} from './layout.mjs';import {EXAMPLE} from './data.mjs';import {makeJob,pageSVG} from './sheet.mjs';
const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
let settings=structuredClone(DEFAULT),job=null,page=0,previewURL=null;
const ctx=document.createElement('canvas').getContext('2d');
function measure(text,pt){ctx.font=(pt*96/72)+'px Arial, sans-serif';return ctx.measureText(text).width/96*25.4;}
function message(text,error=false){$('status').textContent=text;$('status').className=error?'error':'';}
function usedGrid(){
 const grid=$('used-grid');grid.replaceChildren();const count=settings.cols*settings.rows;
 if(!Number.isInteger(settings.cols)||settings.cols<1||settings.cols>6||!Number.isInteger(count)||count<1||count>60)return;
 grid.style.gridTemplateColumns='repeat('+settings.cols+',minmax(0,1fr))';
 for(let i=0;i<count;i++){const button=el('button','',String(i+1));button.setAttribute('aria-label','Used position '+(i+1));button.setAttribute('aria-pressed',String(settings.used.includes(i)));button.addEventListener('click',()=>{settings.used=settings.used.includes(i)?settings.used.filter(n=>n!==i):[...settings.used,i];usedGrid();render();const next=grid.querySelector('[aria-label="Used position '+(i+1)+'"]');next?.focus();});grid.append(button);}
}
function showPage(){
 if(!job)return;
 const source=pageSVG(job,page);if(previewURL)URL.revokeObjectURL(previewURL);previewURL=URL.createObjectURL(new Blob([source],{type:'image/svg+xml'}));
 $('sheet-image').src=previewURL;$('sheet-image').hidden=false;$('empty').hidden=true;$('page-count').textContent='Sheet '+(page+1)+' of '+job.pages.length;$('previous').disabled=page===0;$('next').disabled=page===job.pages.length-1;
}
function render(){
 $('summary').replaceChildren();$('audit').textContent='';$('sheet-image').hidden=true;$('sheet-image').removeAttribute('src');$('empty').hidden=false;$('page-count').textContent='';$('previous').disabled=true;$('next').disabled=true;
 if(previewURL){URL.revokeObjectURL(previewURL);previewURL=null;}
 try{job=makeJob($('labels').value,settings,measure);page=Math.min(page,job.pages.length-1);
  for(const [value,label] of [[job.labelCount,'labels'],[job.pages.length,'sheets'],[settings.used.length,'used positions']]){const block=el('div');block.append(el('strong','',String(value)),el('span','',label));$('summary').append(block);}
  $('badge').textContent=job.warnings.length?'Fit issues':'Text fits';
  $('audit').className=job.warnings.length?'audit error':'audit';$('audit').textContent=job.warnings.length?job.warnings.slice(0,5).map(w=>'Label '+w.label+', sheet '+w.page+': '+w.issue).join(' ')+' Fix all '+job.warnings.length+' fit issue(s) before exporting.':'Local Arial measurements fit within 2 mm padding. '+(settings.guides?'Test outlines are ON.':'Text-only output; outlines are OFF.');
  message('Preview updated. Check each sheet and test physical output at actual size.');showPage();
 }catch(error){job=null;$('badge').textContent='Needs attention';message(error.message,true);}
}
function sync(){for(const key of ['paper','cols','rows','width','height','left','top','gapX','gapY','font'])$(key).value=settings[key];$('guides').checked=settings.guides;usedGrid();render();}
for(const [key,label,min,max,step] of [['cols','Columns',1,6,1],['rows','Rows',1,12,1],['width','Label width · mm',10,200,.1],['height','Label height · mm',8,150,.1],['left','Left margin · mm',0,100,.1],['top','Top margin · mm',0,100,.1],['gapX','Horizontal gap · mm',0,20,.1],['gapY','Vertical gap · mm',0,20,.1],['font','Font size · pt',8,24,.5]]){
 const field=el('label','',label),input=el('input');input.id=key;input.type='number';input.min=min;input.max=max;input.step=step;field.htmlFor=key;field.append(input);$('measurements').append(field);
 input.addEventListener('input',()=>{settings[key]=Number(input.value);if(key==='cols'||key==='rows'){settings.used=[];usedGrid();}render();});
}
$('paper').addEventListener('input',()=>{settings.paper=$('paper').value;render();});
$('guides').addEventListener('input',()=>{settings.guides=$('guides').checked;render();});
$('labels').addEventListener('input',()=>{page=0;render();});
$('refresh').addEventListener('click',render);
$('previous').addEventListener('click',()=>{page--;showPage();});$('next').addEventListener('click',()=>{page++;showPage();});
$('clear-used').addEventListener('click',()=>{settings.used=[];usedGrid();render();});
$('example').addEventListener('click',()=>{settings=structuredClone(DEFAULT);settings.used=[0,4];$('labels').value=EXAMPLE;page=0;sync();message('Fictional example loaded. The dimensions are a generic layout.');});
$('labels').value=EXAMPLE;sync();
