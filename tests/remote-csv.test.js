'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../engine.js'),R=require('../report-export.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const elements=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{value:'',innerHTML:'',hidden:false,disabled:false,addEventListener(type,fn){this[type]=fn;},showModal(){},close(){}}]));
let request,reply;
const context=vm.createContext({CEO:E,CEOReport:R,structuredClone,console,TextDecoder,URL,AbortController,setTimeout:()=>1,clearTimeout(){},location:{protocol:'https:'},fetch:async(url,options)=>{request={url,options};return reply();},document:{baseURI:'https://example.test/Prospectiva-BCN/index.html',getElementById:id=>elements[id],addEventListener(){},querySelectorAll(){return [];}}});
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'));
elements.encoding.value='auto';elements.delimiter.value='auto';
const buffer=text=>new TextEncoder().encode(text).buffer;
const response=text=>({ok:true,arrayBuffer:async()=>buffer(text)});
const csv='REO;EDAT;TEXT\n1169;40;Català\n1169;20;Barcelona';
(async()=>{
 reply=()=>response(csv);await elements.latestCeoBtn.onclick();
 assert.equal(request.url,'https://example.test/Prospectiva-BCN/REO1169_microdades_anonimitzades.csv');
 assert.equal(request.options.credentials,'omit');assert.equal(run('rows.length'),2);assert.equal(run('rows[0].TEXT'),'Català');
 assert.equal(run('fileName'),'REO1169_microdades_anonimitzades.csv');assert.equal(run('isDemo'),false);assert.equal(elements.latestCeoBtn.disabled,false);
 run("config.title='Keep this analysis'");
 for(const bad of [()=>({ok:false,status:404}),()=>({ok:false,status:503}),()=>{throw Error('Network unavailable');},()=>response('<!doctype html><html>Error</html>'),()=>response('version https://git-lfs.github.com/spec/v1\noid sha256:123'),()=>response('bad CSV'),()=>{const e=Error('timeout');e.name='AbortError';throw e;}]){
  reply=bad;await elements.latestCeoBtn.onclick();assert.equal(run('config.title'),'Keep this analysis');assert.equal(run('rows.length'),2);assert.equal(elements.latestCeoBtn.disabled,false);assert.ok(elements.status.className.includes('error'));
 }
 // A local load completed during a pending download wins; the old response must not replace it.
 let release;reply=()=>new Promise(resolve=>release=resolve);const pending=elements.latestCeoBtn.onclick();assert.equal(elements.latestCeoBtn.disabled,true);
 await elements.csvFile.change({target:{files:[{name:'local.csv',arrayBuffer:async()=>buffer('EDAT;NAME\n55;Local')}],value:'local.csv'}});
 release(response(csv));await pending;assert.equal(run('fileName'),'local.csv');assert.equal(run('rows[0].EDAT'),'55');
 context.location.protocol='file:';reply=()=>response(csv);await elements.latestCeoBtn.onclick();
 assert.equal(request.url,'https://raw.githubusercontent.com/PauBelloPerez/Prospectiva-BCN/main/REO1169_microdades_anonimitzades.csv');
 // Both loading paths share the decoder, including Windows-1252 fallback.
 context.latin=Uint8Array.from([...Buffer.from('EDAT;TEXT\n20;Catal','ascii'),0xe0]).buffer;
 assert.equal(run("readCSVBuffer(latin).rows[0].TEXT"),'Català');
 console.log('OK remote CSV: published and file URLs, decoding, errors preserve analysis, local/remote race. Simulated network.');
})().catch(error=>{console.error(error);process.exitCode=1;});
