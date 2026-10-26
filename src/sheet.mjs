import {paginate} from './layout.mjs';import {parseLabels} from './data.mjs';
export const ptMM=pt=>pt*25.4/72;
const xml=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const num=n=>String(Number(n.toFixed(5)));
export function makeJob(text,settings,measure){
 if(typeof measure!=='function')throw new Error('A local font measurement function is required.');
 const job=paginate(parseLabels(text),settings),warnings=[];
 for(const [page,cells] of job.pages.entries())for(const cell of cells){if(!cell.label)continue;const {title,detail}=cell.label,font=job.settings.font;
  for(const [line,size] of [[title,font],[detail,font*.82]]){if(!line)continue;const width=measure(line,size);if(!Number.isFinite(width)||width<0)throw new Error('Font measurement failed.');if(width>cell.width-4+1e-7)warnings.push({label:cell.index+1,page:page+1,issue:'Text is wider than the label padding allows.'});}
  const height=detail?ptMM(font)*1.35+ptMM(font*.82):ptMM(font);
  if(height>cell.height-4)warnings.push({label:cell.index+1,page:page+1,issue:'Text is taller than the label padding allows.'});
 }
 return {...job,warnings};
}
export function pageSVG(job,pageIndex){
 if(!Number.isInteger(pageIndex)||!job.pages[pageIndex])throw new Error('Choose an existing page.');
 const {paper,settings}=job,cells=job.pages[pageIndex];
 const content=cells.map(cell=>{
  const outline=settings.guides?'<rect x="'+num(cell.x)+'" y="'+num(cell.y)+'" width="'+num(cell.width)+'" height="'+num(cell.height)+'" rx="1" fill="none" stroke="#8c968b" stroke-width="0.15" stroke-dasharray="1 1"/>':'';
  if(!cell.label)return outline;
  const {title,detail}=cell.label,font=ptMM(settings.font),small=font*.82,cx=cell.x+cell.width/2,cy=cell.y+cell.height/2;
  const titleY=detail?cy-font*.32:cy+font*.35,detailY=cy+font*.9;
  return outline+'<g font-family="Arial, sans-serif" fill="#1e2925" text-anchor="middle"><text x="'+num(cx)+'" y="'+num(titleY)+'" font-size="'+num(font)+'">'+xml(title)+'</text>'+(detail?'<text x="'+num(cx)+'" y="'+num(detailY)+'" font-size="'+num(small)+'">'+xml(detail)+'</text>':'')+'</g>';
 }).join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+paper.width+'mm" height="'+paper.height+'mm" viewBox="0 0 '+paper.width+' '+paper.height+'"><title>Sheetmint page '+(pageIndex+1)+'</title>'+content+'</svg>';
}
export function rulerSVG(paper){return '<svg xmlns="http://www.w3.org/2000/svg" width="'+paper.width+'mm" height="'+paper.height+'mm" viewBox="0 0 '+paper.width+' '+paper.height+'"><title>Sheetmint 100 mm scale check</title><g fill="#111" stroke="#111" stroke-width="0.2"><path d="M 10 30 H 110"/>'+Array.from({length:11},(_,i)=>'<path d="M '+(10+i*10)+' 27 V 33"/>').join('')+'</g><g font-family="Arial, sans-serif" font-size="4"><text x="10" y="20">100 mm scale check</text><text x="10" y="43">Print at actual size; measure between the end ticks.</text><text x="10" y="51">This checks scale, not label alignment or printer feed.</text></g></svg>';}
