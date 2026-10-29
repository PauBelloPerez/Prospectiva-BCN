'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../engine.js'),R=require('../report-export.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),events={};
const elements=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{value:'',innerHTML:'',hidden:false,disabled:false,open:false,addEventListener(){},showModal(){},close(){}}]));
const fixture={headers:['ORIGIN','DEST','EDAT','WEIGHT','REGION'],rows:[
 {ORIGIN:'ERC',DEST:'PSC',EDAT:'20',WEIGHT:'1',REGION:'A'},
 {ORIGIN:'ERC',DEST:'ERC',EDAT:'40',WEIGHT:'3',REGION:'A'},
 {ORIGIN:'PSC',DEST:'ERC',EDAT:'30',WEIGHT:'1',REGION:'A'},
 {ORIGIN:'PSC',DEST:'PSC',EDAT:'50',WEIGHT:'1',REGION:'A'},
 {ORIGIN:'PSC',DEST:'JUNTS',EDAT:'60',WEIGHT:'2',REGION:'B'},
 {ORIGIN:'JUNTS',DEST:'JUNTS',EDAT:'45',WEIGHT:'1',REGION:'B'},
 {ORIGIN:'PP',DEST:'PSC',EDAT:'55',WEIGHT:'1',REGION:'A'}]};
const context=vm.createContext({CEO:E,CEOReport:R,structuredClone,fixture,console,document:{getElementById:id=>elements[id],querySelectorAll(){return [];},addEventListener(type,fn){events[type]=fn;}}});
const run=s=>vm.runInContext(s,context),plain=v=>JSON.parse(JSON.stringify(v));
const move=(kind,from,to)=>events.change({target:{dataset:{orderKind:kind,orderIndex:String(from)},value:String(to+1)}});
run(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'));
assert.equal(elements.orderEditor.hidden,true);
run("install(structuredClone(fixture),'test.csv');config.groups=['ERC','PSC','JUNTS','PP'].map(name=>({name,mode:'all',filters:[{variable:'ORIGIN',op:'in',values:[E.norm(name)]}]}));config.indicators=[{variable:'DEST'},{variable:'EDAT',stat:'mean'}];config.weight='WEIGHT';render();download=(data,name)=>{globalThis.captured={data,name};};");
assert.equal(elements.orderEditor.hidden,false);assert.equal(elements.orderEditor.open,false);
assert.equal(elements.orderRowsVariable.value,'category:DEST');
const baseline=plain(run('result'));
move('groups',0,-1);assert.deepEqual(plain(run('result')),baseline);assert.ok(elements.orderStatus.textContent.includes('entre 1 i 4'));
// Both the keyboard-friendly position field and arrow buttons call the same operation.
move('groups',1,0);
events.click({target:{closest:()=>({dataset:{orderKind:'groups',orderIndex:'2',orderStep:'-1'},disabled:false})}});
assert.deepEqual(plain(run('result.groups.map(g=>g.name)')),['PSC','JUNTS','ERC','PP']);
assert.ok(elements.orderDifferenceHint.textContent.includes('PSC − JUNTS'));
move('categories',2,0);assert.deepEqual(plain(run('result.indicators[0].categories.map(c=>c.label)')),['PSC','ERC','JUNTS']);
const changed=plain(run('result'));
for(let j=0;j<changed.groups.length;j++){
 const old=baseline.groups.findIndex(g=>g.name===changed.groups[j].name);
 assert.equal(changed.groups[j].n,baseline.groups[old].n);
 for(let i=0;i<changed.indicators.length;i++)assert.deepEqual(changed.indicators[i].stats[j],baseline.indicators[i].stats[old]);
}
assert.equal(changed.filtered,baseline.filtered);
assert.ok(elements.tableContainer.innerHTML.indexOf('<td>PSC</td>')<elements.tableContainer.innerHTML.indexOf('<td>ERC</td>'));
// Reorder complete indicator blocks, including numeric rows.
elements.orderRowsVariable.value='@indicators';elements.orderRowsVariable.onchange();move('indicators',1,0);
assert.deepEqual(plain(run('result.indicators.map(ind=>ind.name)')),['EDAT','DEST']);
run("config.reportOrientation='portrait';render();");
let report=run('reportData()');assert.ok(report.tables.length>1);
assert.ok(report.tables[0].headers[1].startsWith('PSC'));assert.ok(report.tables[0].headers[2].startsWith('JUNTS'));
assert.equal(report.tables[0].rows[0].kind,'numeric');
for(const table of report.tables)assert.deepEqual(plain(table.rows.filter(r=>r.kind==='data').map(r=>r.cells[0])),['PSC','ERC','JUNTS']);
const t=plain(run('tableData()'));
assert.ok(t[0][1].startsWith('PSC'));assert.equal(t[3][0],'PSC');assert.equal(t[3].at(-1),'+25,0 pp');
elements.exportBtn.onclick();assert.ok(context.captured.data.includes(t[3].map(E.csvCell).join(';')));
for(const output of [R.html(report),R.parts(report)['word/document.xml']]){
 // Extract data row labels, ignoring group names in headers and notes.
 const labels=output.includes('<w:tbl>')?[...output.matchAll(/<w:tr>([\s\S]*?)<\/w:tr>/g)].map(m=>m[1].match(/<w:t\b[^>]*>(.*?)<\/w:t>/)?.[1]).filter(label=>['PSC','ERC','JUNTS'].includes(label)):[...output.matchAll(/<tr class="data"><td>(PSC|ERC|JUNTS)<\/td>/g)].map(m=>m[1]);
 assert.deepEqual(labels.slice(0,3),['PSC','ERC','JUNTS']);
}
context.Blob=Blob;context.ClipboardItem=class{constructor(items){this.items=items;}};
let copied;context.navigator={clipboard:{async write(items){copied=items[0].items;}}};
(async()=>{
 await elements.copyBtn.onclick();assert.ok((await copied['text/plain'].text()).includes(t[3].join('\t')));
 assert.match(await copied['text/html'].text(),/<td[^>]*>PSC<\/td>/);
 elements.saveConfig.onclick();context.saved=JSON.parse(context.captured.data);
 run('validateSaved(saved);install(structuredClone(fixture),"again.csv");applySaved(saved,{});');
 assert.deepEqual(plain(run('result.groups.map(g=>g.name)')),['PSC','JUNTS','ERC','PP']);
 assert.deepEqual(plain(run('result.indicators.map(ind=>ind.name)')),['EDAT','DEST']);
 assert.deepEqual(plain(run('result.indicators[1].categories.map(c=>c.label)')),['PSC','ERC','JUNTS']);
 // Hidden categories retain their positions while visible rows move.
 run("config.globalFilters=[{variable:'REGION',op:'in',values:['a']}];render();");
 elements.orderRowsVariable.value='category:DEST';elements.orderRowsVariable.onchange();
 assert.deepEqual(plain(run('result.indicators[1].categories.map(c=>c.label)')),['PSC','ERC']);move('categories',1,0);
 run('config.globalFilters=[];render();');assert.deepEqual(plain(run('result.indicators[1].categories.map(c=>c.label)')),['ERC','PSC','JUNTS']);
 // A new category appends after the ordered ones, with the correct original data.
 run("rows.push({ORIGIN:'PP',DEST:'AAA',EDAT:'70',WEIGHT:'1',REGION:'A'});render();");
 assert.deepEqual(plain(run('result.indicators[1].categories.map(c=>c.label)')),['ERC','PSC','JUNTS','AAA']);
 elements.resetRowOrder.onclick();assert.deepEqual(plain(run('result.indicators[1].categories.map(c=>c.label)')),['AAA','ERC','JUNTS','PSC']);
 // Mapping a variable to a new wave keeps the saved response order.
 run("install({headers:fixture.headers.map(h=>h==='DEST'?'DEST2':h),rows:fixture.rows.map(r=>({...r,DEST2:r.DEST}))},'wave.csv');applySaved(saved,{DEST:'DEST2'});");
 assert.deepEqual(plain(run('result.indicators[1].categories.map(c=>c.label)')),['PSC','ERC','JUNTS']);
 // Older analyses have no saved category order. Invalid imported orders are rejected.
 run("delete saved.config.indicators[1].categoryOrder;validateSaved(saved);applySaved(saved,{DEST:'DEST2'});");
 assert.deepEqual(plain(run('result.indicators[1].categories.map(c=>c.label)')),['ERC','JUNTS','PSC']);
 for(const bad of ['[1]','["psc","psc"]','{}'])assert.throws(()=>run('saved.config.indicators[1].categoryOrder='+bad+';validateSaved(saved);'));
 // Reordering multi-response categories retains their counts and bases too.
 const d={A:E.definition('A'),B:E.definition('B'),MULTI:{...E.definition('MULTI'),type:'multi',sources:['A','B']}};
 const multi=E.analyze([{A:'PSC',B:'ERC'},{A:'JUNTS',B:'PSC'}],d,{groups:[{name:'Total',filters:[]}],indicators:[{variable:'MULTI',categoryOrder:['psc','junts','erc']}],globalFilters:[],denominator:'valid'}).indicators[0];
 assert.deepEqual(multi.categories.map(c=>c.label),['PSC','JUNTS','ERC']);assert.equal(multi.stats[0].valid,2);assert.equal(multi.stats[0].counts.find(c=>c.key==='psc').n,2);
 console.log('OK manual ordering: group identity and statistics, rows, indicators, differences, all exports, JSON, filters, new categories, wave mapping, multi-response. Simulated DOM.');
})().catch(error=>{console.error(error);process.exitCode=1;});
