#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function exists(p){ return fs.existsSync(p); }
function read(p){ return fs.readFileSync(p,'utf8'); }
function parseRefs(html, tag){
  const re = tag==='script' ? /<script[^>]+src="([^"]+)"/g : /<link[^>]+href="([^"]+)"/g;
  const out=[]; let m;
  while((m=re.exec(html))) out.push(m[1]);
  return out;
}
function localRefs(refs){ return refs.filter(r=>!r.startsWith('http') && !r.startsWith('/')); }

const root = process.cwd();
const versionsPath = path.join(root,'versions.json');
if(!exists(path.join(root,'index.html'))) throw new Error('Missing root index.html');
const versions = JSON.parse(read(versionsPath));
let fail=0;
for(const v of versions){
  const isCurrent = v.path === '/ExamQuestions/';
  const base = isCurrent ? root : path.join(root,'versions',v.version);
  const idx = path.join(base,'index.html');
  if(!exists(idx)){ console.log('FAIL missing index',v.version,idx); fail++; continue; }
  const html = read(idx);
  for(const href of localRefs(parseRefs(html,'link'))){
    const p = path.join(base,href.split('?')[0]);
    if(!exists(p)){ console.log('FAIL missing css/link',v.version,href); fail++; }
  }
  for(const src of localRefs(parseRefs(html,'script'))){
    const p = path.join(base,src.split('?')[0]);
    if(!exists(p)){ console.log('FAIL missing script',v.version,src); fail++; }
  }
  const commonData=['data/questions.json','data/manifest.json','data/command-explainers.json'];
  for(const d of commonData){
    if(html.includes(d) && !exists(path.join(base,d))){ console.log('FAIL missing data',v.version,d); fail++; }
  }
}
if(fail===0) console.log('PASS verify-archives: all checks passed');
else { console.log(`FAIL verify-archives: ${fail} issue(s)`); process.exit(1); }
