#!/usr/bin/env node
const fs=require('fs');const path=require('path');
const root=process.cwd();
const exists=p=>fs.existsSync(p);const read=p=>fs.readFileSync(p,'utf8');
const parse=(html,re)=>{const out=[];let m;while((m=re.exec(html)))out.push(m[1]);return out;};
const isLocal=r=>!/^https?:/.test(r)&&!r.startsWith('//')&&!(r.startsWith('/')&&!r.includes('versions.json'));
let fail=0;
function failMsg(msg){console.log(`FAIL ${msg}`);fail++;}
function checkVersionFile(file,expected,regex,label,v){if(!exists(file))return;const m=read(file).match(regex);if(m&&m[1]!==expected)failMsg(`${v} ${label} is ${m[1]}, expected ${expected}`);}
const versions=JSON.parse(read(path.join(root,'versions.json')));
if(!exists(path.join(root,'index.html'))) failMsg('missing root index.html');
for(const entry of versions){const v=entry.version;const isCurrent=entry.path==='/ExamQuestions/';const base=isCurrent?root:path.join(root,'versions',v);
 const idx=path.join(base,'index.html');if(!exists(idx)){failMsg(`${v} missing index.html`);continue;}
 const html=read(idx);
 for(const href of parse(html,/<link[^>]+href="([^"]+)"/g).filter(isLocal)){if(!exists(path.join(base,href.split('?')[0]))) failMsg(`${v} missing css ${href}`);}
 for(const src of parse(html,/<script[^>]+src="([^"]+)"/g).filter(isLocal)){if(!exists(path.join(base,src.split('?')[0]))) failMsg(`${v} missing js ${src}`);}
 for(const d of ['data/questions.json','data/manifest.json','data/command-explainers.json']){if(html.includes(d)&&!exists(path.join(base,d))) failMsg(`${v} missing data ${d}`);}
 if(!isCurrent){
   checkVersionFile(path.join(base,'app-config.js'),v,/APP_VERSION:\s*'([^']+)'/,'app-config APP_VERSION',v);
   checkVersionFile(path.join(base,'command-groove-fallback-fix.js'),v,/const VERSION\s*=\s*'([^']+)'/,'fallback VERSION',v);
 }
}
if(fail){console.log(`FAIL verify-archives: ${fail} issue(s)`);process.exit(1);}console.log('PASS verify-archives: all checks passed');
