export const PAPERS={a4:{width:210,height:297,name:'A4'},letter:{width:215.9,height:279.4,name:'US Letter'}};
export const DEFAULT={paper:'a4',cols:3,rows:8,width:63,height:33,left:8,top:10,gapX:3,gapY:2,font:12,guides:true,used:[]};
function number(value,min,max,label,integer=false){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value)))throw new Error(label+' must be '+(integer?'a whole number ':'')+'from '+min+' to '+max+'.');return value;}
export function normalize(input){
 if(!input||!Object.hasOwn(PAPERS,input.paper))throw new Error('Choose A4 or US Letter.');
 const s={paper:input.paper};
 for(const [key,min,max,label,int] of [['cols',1,6,'Columns',true],['rows',1,12,'Rows',true],['width',10,200,'Label width',false],['height',8,150,'Label height',false],['left',0,100,'Left margin',false],['top',0,100,'Top margin',false],['gapX',0,20,'Horizontal gap',false],['gapY',0,20,'Vertical gap',false],['font',8,24,'Font size',false]])s[key]=number(input[key],min,max,label,int);
 const slots=s.cols*s.rows;if(slots>60)throw new Error('Use at most 60 positions per sheet.');
 const paper=PAPERS[s.paper];
 if(s.left+s.cols*s.width+(s.cols-1)*s.gapX>paper.width+1e-7||s.top+s.rows*s.height+(s.rows-1)*s.gapY>paper.height+1e-7)throw new Error('The label grid extends beyond the paper. Reduce size, margins, rows, columns, or gaps.');
 if(!Array.isArray(input.used)||input.used.length>60||input.used.some(i=>!Number.isInteger(i)||i<0||i>=slots)||new Set(input.used).size!==input.used.length)throw new Error('Used positions must be unique positions on the first sheet.');
 if(input.used.length===slots)throw new Error('No free positions on the first sheet. Clear used positions or start with a fresh sheet.');
 if(typeof input.guides!=='boolean')throw new Error('Choose whether to include test outlines.');
 s.guides=input.guides;s.used=[...input.used].sort((a,b)=>a-b);return s;
}
export function positions(input){const s=normalize(input);return Array.from({length:s.cols*s.rows},(_,slot)=>({slot,x:s.left+(slot%s.cols)*(s.width+s.gapX),y:s.top+Math.floor(slot/s.cols)*(s.height+s.gapY),width:s.width,height:s.height}));}
export function paginate(labels,input){
 const settings=normalize(input);if(!Array.isArray(labels)||labels.length<1||labels.length>300)throw new Error('Use 1–300 labels.');
 const slots=positions(settings),pages=[];let cursor=0;
 while(cursor<labels.length){const page=slots.map(pos=>{const used=pages.length===0&&settings.used.includes(pos.slot);return {...pos,used,label:used||cursor>=labels.length?null:labels[cursor++],index:used?null:cursor-1};});pages.push(page);if(pages.length>20)throw new Error('This job needs more than 20 sheets. Add positions or reduce labels.');}
 return {settings,paper:PAPERS[settings.paper],pages,labelCount:labels.length};
}
