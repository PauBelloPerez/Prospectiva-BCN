'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../engine.js'),R=require('../report-export.js');
const rows=[
 {AGE:'18–24',SEXE:'Home',IA:'Sí',EDAT:'20',PES:'1',REGION:'BCN',REO:'1169'},
 {AGE:'18–24',SEXE:'Home',IA:'No',EDAT:'22',PES:'3',REGION:'BCN',REO:'1169'},
 {AGE:'18–24',SEXE:'Dona',IA:'Sí',EDAT:'23',PES:'2',REGION:'BCN',REO:'1169'},
 {AGE:'18–24',SEXE:'',IA:'No',EDAT:'24',PES:'1',REGION:'BCN',REO:'1169'},
 {AGE:'25–34',SEXE:'Home',IA:'No',EDAT:'30',PES:'1',REGION:'BCN',REO:'1169'},
 {AGE:'25–34',SEXE:'Dona',IA:'Sí',EDAT:'31',PES:'1',REGION:'BCN',REO:'1169'},
 {AGE:'25–34',SEXE:'Altre',IA:'Sí',EDAT:'32',PES:'1',REGION:'BCN',REO:'1169'},
 {AGE:'18–24',SEXE:'Dona',IA:'Sí',EDAT:'23',PES:'5',REGION:'OTHER',REO:'1169'},
 {AGE:'25–34',IA:'Sí',EDAT:'34',PES:'1',REGION:'BCN',REO:'1167'}];
const headers=[...new Set(rows.flatMap(r=>Object.keys(r)))],defs=Object.fromEntries(headers.map(n=>[n,E.definition(n)]));
const config={groups:[{name:'All',mode:'all',filters:[]}],globalFilters:[{variable:'REGION',op:'in',values:['bcn']}],indicators:[{variable:'IA'},{variable:'EDAT',stat:'mean'}],denominator:'valid',weight:'PES',difference:true};
const split=E.subdivideGroups(rows,defs,config,'AGE','SEXE',['home','dona']);
assert.equal(split.groups.length,4);assert.deepEqual(split.preview.map(p=>p.excluded),[1,2]);
let result=E.analyze(rows,defs,{...config,groups:split.groups});assert.deepEqual(result.groups.map(g=>g.n),[1,2,1,1]);
const youngMale=result.groups.findIndex(g=>g.name==='18–24 · Home');
assert.equal(result.indicators[0].stats[youngMale].counts.find(c=>c.key==='si').pct,25);
assert.equal(result.indicators[1].stats[youngMale].mean,21.5);
assert.ok(!result.studyLines.some(l=>l.includes('REO: 1167')));
// The additional condition is ANDed with the complete parent expression, even for OR groups.
const orConfig={...config,globalFilters:[],groups:[{name:'Young or outside',mode:'any',filters:[{variable:'AGE',op:'in',values:['18–24']},{variable:'REGION',op:'in',values:['other']}]}]};
const orSplit=E.subdivideGroups(rows,defs,orConfig,'','SEXE',['home']);
assert.equal(E.analyze(rows,defs,{...orConfig,groups:orSplit.groups}).groups[0].n,2);
// Repeated subdivision preserves earlier restrictions and keeps empty combinations visible.
const twice=E.subdivideGroups(rows,defs,{...config,groups:split.groups},'','IA',['si','no']);
const twiceResult=E.analyze(rows,defs,{...config,groups:twice.groups});assert.equal(twice.groups.length,8);assert.equal(twiceResult.groups.reduce((a,g)=>a+g.n,0),5);assert.ok(twiceResult.groups.some(g=>g.n===0));
assert.throws(()=>E.subdivideGroups(rows,defs,config,'AGE','AGE',['18–24']));
assert.throws(()=>E.subdivideGroups(rows,defs,config,'AGE','EDAT',['20']));
assert.throws(()=>E.subdivideGroups(rows,defs,config,'AGE','SEXE',[]));
assert.throws(()=>E.subdivideGroups(rows,defs,{...config,groups:Array.from({length:26},()=>config.groups[0])},'','SEXE',['home','dona']));
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),events={};
const elements=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{value:'',innerHTML:'',hidden:false,open:false,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}}]));
let boxes=[],copied,legacyMode='rich',legacyData={};
const document={getElementById:id=>elements[id],querySelectorAll:selector=>selector==='[data-subgroup-key]'?boxes:[],addEventListener(type,fn){events[type]=fn;},removeEventListener(type){delete events[type];},body:{append(){}},createElement:()=>({style:{},select(){},remove(){}}),execCommand(){if(legacyMode==='fail')return false;if(legacyMode==='rich')events.copy({clipboardData:{setData(type,data){legacyData[type]=data;}},preventDefault(){}});return true;}};
const context=vm.createContext({CEO:E,CEOReport:R,structuredClone,console,document,fixture:{headers,rows},settings:config,Blob,ClipboardItem:class{constructor(items){this.items=items;}},navigator:{clipboard:{async write(items){copied=items[0].items;}}}});
const run=s=>vm.runInContext(s,context),plain=v=>JSON.parse(JSON.stringify(v));
run(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'));
run("install(structuredClone(fixture),'fixture.csv');config={...config,...structuredClone(settings)};render();download=(data,name)=>{globalThis.captured={data,name};};");
const before=run('JSON.stringify(config)');elements.subgroupBtn.onclick();assert.equal(elements.subgroupDialog.open,true);
elements.subgroupCancel.onclick();assert.equal(run('JSON.stringify(config)'),before);
elements.subgroupBtn.onclick();elements.subgroupBase.value='AGE';elements.subgroupVariable.value='SEXE';elements.subgroupVariable.onchange();
boxes=[{checked:true,dataset:{subgroupKey:'dona'}},{checked:true,dataset:{subgroupKey:'home'}}];elements.subgroupBase.onchange();
assert.equal(elements.subgroupApply.disabled,false);assert.ok(elements.subgroupPreview.innerHTML.includes('18–24'));
elements.subgroupNone.onclick();assert.equal(elements.subgroupApply.disabled,true);elements.subgroupAll.onclick();elements.subgroupApply.onclick();
assert.equal(elements.subgroupDialog.open,false);assert.equal(run('config.groups.length'),4);assert.equal(run('config.difference'),false);assert.equal(run('config.weight'),'PES');
assert.deepEqual(plain(run('result.groups.map(g=>g.n)')),[1,2,1,1]);assert.ok(elements.tableContainer.innerHTML.includes('colspan="2">18–24'));
assert.ok(run('defaultNotes().join(" ")').includes('Sexe'));assert.ok(run('defaultNotes().join(" ")').includes(' I '));
let report=run('reportData()');assert.equal(R.headerRows(report.tables[0]).length,2);
assert.ok(R.html(report).includes('scope="colgroup" colspan="2">18–24'));
const word=R.parts(report)['word/document.xml'];assert.ok(word.includes('<w:gridSpan w:val="2"/>'));assert.equal((word.match(/<w:tblHeader\/>/g)||[]).length,2);
elements.exportBtn.onclick();assert.ok(context.captured.data.includes('18–24 · Home'));assert.ok(context.captured.data.includes('25,0 % (1)'));
// Saved subgroup filters are validated, listed for mapping and remapped on a new wave.
elements.saveConfig.onclick();context.saved=JSON.parse(context.captured.data);
assert.ok(run('usedColumns(saved)').includes('SEXE'));run('validateSaved(saved);applySaved(saved,{});');
assert.deepEqual(plain(run('result.groups.map(g=>g.n)')),[1,2,1,1]);
run("install({headers:fixture.headers.map(h=>h==='SEXE'?'SEX2':h),rows:fixture.rows.map(r=>({...r,SEX2:r.SEXE}))},'next.csv');applySaved(saved,{SEXE:'SEX2'});");
assert.equal(run('config.groups[0].columnFilters[0].variable'),'SEX2');assert.equal(run('result.groups[0].n'),1);
assert.throws(()=>run('applySaved(saved,{SEXE:""});'));
const bad=structuredClone(context.saved);bad.config.groups[0].columnFilters='wrong';context.bad=bad;assert.throws(()=>run('validateSaved(bad);'));
// Editing a subgroup condition uses its own filter list and updates the displayed label.
events.change({target:{dataset:{filter:'values'},selectedOptions:[{value:'home'}],closest:()=>({dataset:{scope:'column:0',index:'0'}})}});
assert.equal(run('result.groups[0].n'),2);assert.ok(run('config.groups[0].headerLabel').includes('Home'));
run("install(structuredClone(fixture),'fixture.csv');applySaved(saved,{});");
(async()=>{
 await elements.copyBtn.onclick();const pasted=await copied['text/html'].text();assert.ok(pasted.includes('background-color:#DB2828'));assert.ok(pasted.includes('colspan="2"'));assert.ok(pasted.includes('REO: 1169'));assert.ok((await copied['text/plain'].text()).includes('18–24 · Home'));
 // A wide table is copied as one editable table; exports still paginate.
 run("config.groups=Array.from({length:12},(_,i)=>({...structuredClone(config.groups[i%4]),headerKey:String(Math.floor(i/2))}));render();");
 assert.ok(run('reportData().tables.length')>1);await elements.copyBtn.onclick();assert.equal(((await copied['text/html'].text()).match(/<table\b/g)||[]).length,1);
 assert.equal(run('reportData(true).tables[0].headers.length'),13);
 // Clipboard permission rejection uses an HTML-aware legacy fallback.
 context.navigator.clipboard.write=async()=>{throw Error('denied');};await elements.copyBtn.onclick();assert.ok(legacyData['text/html'].includes('background-color:#DB2828'));assert.ok(legacyData['text/plain'].includes('18–24 · Home'));assert.ok(elements.status.textContent.includes('amb format'));
 legacyMode='plain';await elements.copyBtn.onclick();assert.ok(elements.status.textContent.includes('text amb tabuladors'));
 legacyMode='fail';await elements.copyBtn.onclick();assert.ok(elements.status.textContent.includes('no permet copiar'));
 // Escaping remains intact in merged headers and clipboard content.
 run("config.groups[0].headerParent='<script>alert(1)</script>';render();");const escaped=R.clipboardHTML(run('reportData(true)'));assert.ok(escaped.includes('&lt;script&gt;'));assert.ok(!escaped.includes('<script>'));
 console.log('OK column subgroups: AGE×SEX, OR parents AND child filters, weighted bases, exclusions/empty cells, preview/cancel, JSON/mapping/editing, grouped HTML/DOCX headers, CSV, wide rich clipboard and fallback. Simulated DOM.');
})().catch(error=>{console.error(error);process.exitCode=1;});

