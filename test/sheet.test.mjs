import test from 'node:test';import assert from 'node:assert/strict';import {DEFAULT} from '../src/layout.mjs';import {parseLabels,projectJSON,parseProject,EXAMPLE} from '../src/data.mjs';
test('two-column paste retains ordering and normalizes line endings',()=>{assert.deepEqual(parseLabels(' A \t One \r\n\r\nB\r'),[{title:'A',detail:'One'},{title:'B',detail:''}]);});
test('ambiguous columns, blank titles, controls and excessive input fail',()=>{for(const input of ['','\tDetail','a\tb\tc','a'.repeat(81),'a\u0000','\ud800','a\n'.repeat(301),' '.repeat(50001)])assert.throws(()=>parseLabels(input));});
test('project save and reopen preserve settings and source text',()=>{assert.deepEqual(parseProject(projectJSON({...DEFAULT,used:[1,4]},EXAMPLE)),{settings:{...DEFAULT,used:[1,4]},text:EXAMPLE});for(const input of ['{','{}','null',' '.repeat(120001)])assert.throws(()=>parseProject(input));});

import {makeJob,pageSVG,rulerSVG,ptMM} from '../src/sheet.mjs';
const measure=(text,font)=>text.length*ptMM(font)*.6;
test('SVG uses physical dimensions and escapes XML text without scripts',()=>{const job=makeJob('<script>& "name"\tDetail',DEFAULT,measure),svg=pageSVG(job,0);assert.ok(svg.includes('width="210mm"'));assert.ok(svg.includes('&lt;script&gt;&amp; &quot;name&quot;'));assert.ok(!svg.includes('<script>'));assert.ok(!svg.includes('http://127.0.0.1'));});
test('overflow produces an explicit audit and never truncates text',()=>{const job=makeJob('W'.repeat(80),DEFAULT,measure);assert.ok(job.warnings.length>0);assert.ok(pageSVG(job,0).includes('W'.repeat(80)));});
test('used positions stay empty and outlines can be omitted',()=>{const job=makeJob('Only label',{...DEFAULT,used:[0,1],guides:false},measure);assert.equal(job.pages[0][2].label.title,'Only label');assert.ok(!pageSVG(job,0).includes('<rect'));assert.throws(()=>pageSVG(job,4));});
test('ruler has a 100 mm baseline and local measurement errors fail',()=>{assert.ok(rulerSVG({width:210,height:297}).includes('M 10 30 H 110'));assert.throws(()=>makeJob('A',DEFAULT,()=>NaN));});
