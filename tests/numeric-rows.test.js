'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../engine.js'),R=require('../report-export.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const elements=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{value:'',innerHTML:'',hidden:false,open:false,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}}]));
const context=vm.createContext({CEO:E,CEOReport:R,structuredClone,console,alert:msg=>{throw Error(msg);},document:{getElementById:id=>{assert.ok(elements[id],id);return elements[id];},addEventListener(){},querySelectorAll(){return [];}}});
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'));
run(`install({headers:['EDAT','VAL_S_ILLA_0_10','ESP_CAT_0_10','CATEGORY','GROUP','WEIGHT'],rows:[
 {EDAT:'20',VAL_S_ILLA_0_10:'1',CATEGORY:'X',GROUP:'A',WEIGHT:'1'},
 {EDAT:'40',VAL_S_ILLA_0_10:'3',CATEGORY:'Y',GROUP:'A',WEIGHT:'3'},
 {EDAT:'',VAL_S_ILLA_0_10:'',CATEGORY:'X',GROUP:'A',WEIGHT:'1'},
 {EDAT:'70',VAL_S_ILLA_0_10:'7',CATEGORY:'Y',GROUP:'A',WEIGHT:'0'},
 {EDAT:'40',VAL_S_ILLA_0_10:'4',CATEGORY:'X',GROUP:'B',WEIGHT:'1'},
 {EDAT:'60',VAL_S_ILLA_0_10:'6',CATEGORY:'Y',GROUP:'B',WEIGHT:'1'}]},'fixture.csv');
 defs.EDAT.label='Edat';defs.VAL_S_ILLA_0_10.label='Valoració';
 config.groups=['A','B'].map(name=>({name,mode:'all',filters:[{variable:'GROUP',op:'in',values:[name.toLowerCase()]}]}));
 config.weight='WEIGHT';config.indicators=[{variable:'EDAT',stat:'mean'},{variable:'VAL_S_ILLA_0_10',stat:'median'},{variable:'CATEGORY'},{variable:'ESP_CAT_0_10'}];render();`);
const report=run('reportData()');
assert.equal(report.tables[0].rows.length,7); // Two numeric, four categorical, one blocked.
assert.deepEqual(Array.from(report.tables[0].rows[0].cells),['Edat (mitjana)','35,0 (n = 2)','50,0 (n = 2)','-15,0 punts']);
assert.deepEqual(Array.from(report.tables[0].rows[1].cells),['Valoració (mediana)','3,0 (n = 2)','4,0 (n = 2)','-1,0 punts']);
assert.equal(report.tables[0].rows.filter(r=>r.kind==='section').length,1);
assert.equal(report.tables[0].rows.filter(r=>r.kind==='base').length,1);
assert.equal(report.tables[0].rows.at(-1).kind,'notice');
assert.ok(report.notes.some(n=>n.includes('Edat (mitjana)')&&n.includes('A: absents = 1; pes invàlid = 1')));
assert.equal((elements.tableContainer.innerHTML.match(/class="numeric-row"/g)||[]).length,3);
assert.ok(elements.tableContainer.innerHTML.includes('Base vàlida: 2; absents: 1; pes invàlid: 1'));
const flat=run('tableData()');assert.equal(flat.length,7);assert.deepEqual(Array.from(flat[1]),Array.from(report.tables[0].rows[0].cells));
assert.deepEqual(Array.from(flat[2]),Array.from(report.tables[0].rows[1].cells));
const doc=R.parts(report)['word/document.xml'],exported=R.html(report);
assert.equal((doc.match(/<w:tr>/g)||[]).length,8);assert.equal((exported.match(/<tr class=/g)||[]).length,7);
assert.ok(doc.includes('Edat (mitjana)'));assert.ok(doc.includes('35,0 (n = 2)'));
run('download=(data,name)=>{globalThis.captured={data,name};}');
elements.exportBtn.onclick();assert.ok(context.captured.data.includes('"Edat (mitjana)";"35,0 (n = 2)"'));
elements.wordBtn.onclick();assert.ok(Buffer.from(context.captured.data).toString('utf8').includes('35,0 (n = 2)'));
context.Blob=Blob;context.ClipboardItem=class {constructor(items){this.items=items;}};
let clipboard;context.navigator={clipboard:{async write(items){clipboard=items[0].items;}}};
(async()=>{
 await elements.copyBtn.onclick();assert.ok((await clipboard['text/plain'].text()).includes('Edat (mitjana)\t35,0 (n = 2)'));
 assert.ok((await clipboard['text/html'].text()).includes('Edat (mitjana)'));
 run("config.groups=Array.from({length:6},(_,i)=>({...config.groups[i%2],name:'Grup '+i}));config.reportOrientation='portrait';render();");
 const split=run('reportData()');assert.equal(split.tables.length,3);assert.ok(split.tables.every(t=>t.rows.length===7&&t.rows[0].cells[0]==='Edat (mitjana)'));
 run("config.groups=[{name:'Buit',mode:'all',filters:[{variable:'GROUP',op:'in',values:[]}]}];config.weight='';render();");
 assert.equal(run('reportData().tables[0].rows[0].cells[1]'),'— (n = 0)');
 console.log('OK numèriques compactes: una fila per mitjana/mediana, bases, absents, pesos invàlids, diferències, cel·les buides, categories i totes les exportacions. DOM simulat.');
})().catch(error=>{console.error(error);process.exitCode=1;});
