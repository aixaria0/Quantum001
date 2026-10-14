import {readFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'../dist'),files=[];
function walk(p){for(const n of readdirSync(p)){const f=join(p,n);statSync(f).isDirectory()?walk(f):files.push(f);}}walk(root);
const missing=[];for(const f of files.filter(p=>/\.(html|css|mjs)$/.test(p))){const content=readFileSync(f,'utf8');for(const m of content.matchAll(/(?:src=|href=)["'](\.\/[^"']+)["']|url\(['"]?(\.\/[^)'" ]+)/g)){const path=m[1]??m[2];if(path.includes('${'))continue;try{if(statSync(resolve(f,'..',path)).size===0)missing.push(path+' (empty)');}catch{missing.push(path);}}}
if(missing.length)throw new Error('Missing local assets: '+missing.join(', '));
console.log(`Static integrity passed: ${files.length} files, no missing or empty referenced assets.`);
