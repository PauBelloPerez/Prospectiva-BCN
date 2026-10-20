'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../engine.js'),R=require('../report-export.js');
// Synthetic dates: these are not assertions about the dates of the real CEO studies.
const fixture={headers:['REO','MES','ANY','EDAT','CITY'],rows:[
 {REO:'1167',MES:'1',ANY:'2025',EDAT:'20',CITY:'BCN'},
 {REO:'1169',MES:'3',ANY:'2026',EDAT:'40',CITY:'BCN'},
 {REO:'1169',MES:'3',ANY:'2026',EDAT:'50',CITY:'OTHER'}]};
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const elements=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{value:'',innerHTML:'',hidden:false,open:false,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}}]));
const context=vm.createContext({CEO:E,CEOReport:R,fixture,structuredClone,console,alert:msg=>{throw Error(msg);},document:{getElementById:id=>{assert.ok(elements[id],id);return elements[id];},addEventListener(){},querySelectorAll(){return [];}}});
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'));
run("install(fixture,'REO1169.csv');config.indicators=[{variable:'EDAT',stat:'mean'}];config.globalFilters=[{variable:'CITY',op:'in',values:['bcn']}];render();");
assert.ok(elements.studyMetadata.innerHTML.includes('1167'));
assert.ok(elements.studyMetadata.innerHTML.includes('1169'));
assert.equal(elements.waveSelect.value,''); // Never filter by filename alone.
elements.waveSelect.value='1169';elements.waveSelect.onchange();
assert.equal(run('result.filtered'),1);assert.equal(run('result.groups[0].n'),1);
assert.equal(run('result.indicators[0].stats[0].mean'),40);
const expected='REO: 1169 · MES: març · ANY: 2026';
assert.deepEqual(Array.from(run('reportData().studyLines')),[expected]);
assert.ok(!elements.studyMetadata.innerHTML.includes('1167'));
assert.equal(run("config.globalFilters.filter(f=>f.variable==='CITY').length"),1);
run('download=(data,name)=>{globalThis.captured={data,name};}');
elements.exportBtn.onclick();assert.ok(context.captured.data.includes(expected));assert.ok(!context.captured.data.includes('REO: 1167'));
elements.htmlBtn.onclick();assert.ok(context.captured.data.includes(expected));assert.ok(!context.captured.data.includes('REO: 1167'));
elements.wordBtn.onclick();assert.ok(Buffer.from(context.captured.data).toString('utf8').includes(expected));assert.ok(!Buffer.from(context.captured.data).toString('utf8').includes('REO: 1167'));
context.Blob=Blob;context.ClipboardItem=class {constructor(items){this.items=items;}};
let clipboard;context.navigator={clipboard:{async write(items){clipboard=items[0].items;}}};
(async()=>{
 await elements.copyBtn.onclick();
 for(const type of ['text/plain','text/html']){const s=await clipboard[type].text();assert.ok(s.includes(expected));assert.ok(!s.includes('REO: 1167'));}
 elements.waveSelect.value='';elements.waveSelect.onchange();
 assert.equal(run('result.filtered'),2);assert.ok(elements.studyMetadata.innerHTML.includes('1167'));
 // Filtering only at group level also determines the report's actual studies.
 run("config.groups=[{name:'Actual',mode:'all',filters:[{variable:'REO',op:'in',values:['1169']}]}];render();");
 assert.deepEqual(Array.from(run('reportData().studyLines')),[expected]);
 run("config.groups[0].filters[0].values=['absent'];render();");
 assert.ok(elements.studyMetadata.innerHTML.includes('Sense entrevistes'));assert.ok(!elements.studyMetadata.innerHTML.includes('1167'));
 // Replacing the file never retains the previous study or month/year.
 run("install({headers:fixture.headers,rows:[fixture.rows[1]]},'only1169.csv');config.indicators=[{variable:'EDAT'}];render();");
 assert.deepEqual(Array.from(run('reportData().studyLines')),[expected]);
 assert.ok(!elements.studyMetadata.innerHTML.includes('1167'));
 run("install({headers:fixture.headers,rows:[{...fixture.rows[1],MES:'Setembre'},{...fixture.rows[2],MES:'Octubre'}]},'REO1169.csv');config.indicators=[{variable:'EDAT'}];render();");
 const combined='REO: 1169 · MES: Setembre–Octubre · ANY: 2026';
 assert.deepEqual(Array.from(run('reportData().studyLines')),[combined]);
 assert.equal(run('result.groups[0].n'),2);assert.equal(run('result.indicators[0].stats[0].mean'),45);
 assert.ok(!elements.studyMetadata.innerHTML.includes('Estudis / dates'));
 for(const button of ['exportBtn','htmlBtn','wordBtn']){elements[button].onclick();const text=typeof context.captured.data==='string'?context.captured.data:Buffer.from(context.captured.data).toString('utf8');assert.ok(text.includes(combined));}
 await elements.copyBtn.onclick();
 for(const type of ['text/plain','text/html'])assert.ok((await clipboard[type].text()).includes(combined));
 run("install({headers:['EDAT'],rows:[{EDAT:'25'}]},'unknown.csv');");
 assert.equal(elements.waveField.hidden,true);assert.ok(elements.studyMetadata.innerHTML.includes('no disponible'));
 console.log('OK REO 1167/1169: selecció, dates, càlculs, filtres generals/grups, mostra buida, recàrrega i totes les exportacions. Dades sintètiques, DOM simulat.');
})().catch(error=>{console.error(error);process.exitCode=1;});
