import {normalize} from './layout.mjs';
export const EXAMPLE='Field notes\tShelf A · 01\nSketchbooks\tShelf A · 02\nInk & pens\tShelf B · 01\nPaper samples\tShelf B · 02\nReference cards\tShelf C · 01\nSpare parts\tShelf C · 02';
function valid(text){if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffe\uffff]/u.test(text))return false;for(const char of text){const point=char.codePointAt(0);if(point>=0xd800&&point<=0xdfff)return false;}return true;}
export function parseLabels(input){
 if(typeof input!=='string'||input.length>50000||!valid(input))throw new Error('Use plain label text up to 50,000 UTF-16 units, without unsupported control characters.');
 const labels=[];for(const [i,line] of input.replace(/\r\n?/g,'\n').split('\n').entries()){
  if(!line.trim())continue;const cells=line.split('\t');if(cells.length>2)throw new Error('Line '+(i+1)+': use at most two tab-separated columns.');
  const title=cells[0].trim(),detail=(cells[1]??'').trim();if(!title||title.length>80||detail.length>80)throw new Error('Line '+(i+1)+': a nonempty title and up to 80 characters per column are required.');
  labels.push({title,detail});if(labels.length>300)throw new Error('Use at most 300 labels.');
 }
 if(!labels.length)throw new Error('Add at least one label.');return labels;
}
export function projectJSON(settings,text){const clean=normalize(settings);parseLabels(text);return JSON.stringify({format:'sheetmint-v1',settings:clean,text},null,2)+'\n';}
export function parseProject(text){
 if(typeof text!=='string'||text.length>120000)throw new Error('Project JSON must be at most 120,000 characters.');
 let value;try{value=JSON.parse(text);}catch{throw new Error('Project is not valid JSON.');}
 if(value?.format!=='sheetmint-v1')throw new Error('Not a Sheetmint project.');const settings=normalize(value.settings);parseLabels(value.text);return {settings,text:value.text};
}
