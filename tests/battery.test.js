'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../engine.js'),R=require('../report-export.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const elements=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{value:'',innerHTML:'',hidden:false,open:false,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}}]));
const context=vm.createContext({CEO:E,CEOReport:R,structuredClone,console,Blob,alert:msg=>{throw Error(msg);},document:{getElementById:id=>{assert.ok(elements[id],id);return elements[id];},addEventListener(){},querySelectorAll(){return [];}}});
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'));
run(`install({headers:['IA_A','IA_B','IA_EMPTY','EDAT','CITY','W','REO'],rows:[
 {IA_A:'Sovint',IA_B:'Mai',IA_EMPTY:'',EDAT:'20',CITY:'BCN',W:'1',REO:'1169'},
 {IA_A:'Mai',IA_B:'Sovint',IA_EMPTY:'',EDAT:'30',CITY:'BCN',W:'3',REO:'1169'},
 {IA_A:'',IA_B:'Sovint',IA_EMPTY:'',EDAT:'40',CITY:'BCN',W:'2',REO:'1169'},
 {IA_A:'Sovint',IA_B:'',IA_EMPTY:'',EDAT:'50',CITY:'BCN',W:'0',REO:'1169'},
 {IA_A:'Sovint',IA_B:'Sovint',IA_EMPTY:'',EDAT:'60',CITY:'Other',W:'5',REO:'1167'}]},'battery.csv');
 config.globalFilters=[{variable:'CITY',op:'in',values:['bcn']}];
 config.groups=[{name:'Only never A',mode:'all',filters:[{variable:'IA_A',op:'in',values:['mai']}]}];
 config.weight='W';config.indicators=[{variable:'IA_A'},{variable:'IA_B'},{variable:'IA_EMPTY'}];
 defs.IA_A.label='Actualitat';defs.IA_B.label='Salut';render();
 globalThis.savedGroups=JSON.stringify(config.groups);`);
elements.tableMode.onchange({target:{value:'simple'}});
assert.equal(run('result.groups[0].n'),4);assert.equal(run('result.groups[0].name'),'Total');
assert.equal(run('JSON.stringify(config.groups)'),run('savedGroups'));
assert.equal(elements.groupControls.hidden,true);
assert.ok(run('reportData().tables[0].headers[1]').includes('Total'));
assert.ok(!run('notesText().join(" ")').includes('Only never A:'));
elements.tableMode.onchange({target:{value:'battery'}});
assert.equal(elements.copyBtn.disabled,false);
let table=run('batteryTable()');
assert.deepEqual(Array.from(table.headers),['Resposta','Actualitat\n(n vàlid = 2)','Salut\n(n vàlid = 3)','IA_EMPTY\n(n vàlid = 0)']);
const cells=label=>Array.from(run('batteryTable()').rows.find(r=>r.cells[0]===label).cells);
assert.deepEqual(cells('Sovint'),['Sovint','25,0 % (1)','83,3 % (2)','— % (0)']);
assert.deepEqual(cells('Mai'),['Mai','75,0 % (1)','16,7 % (1)','— % (0)']);
assert.deepEqual(Array.from(table.rows[0].cells),['Base vàlida · absents · pes invàlid','2 · 1 · 1','3 · 0 · 1','0 · 3 · 1']);
assert.ok(run('studyLines.join(" ")').includes('1169'));assert.ok(!run('studyLines.join(" ")').includes('1167'));
assert.ok(elements.tableContainer.innerHTML.includes('83,3 % (2)'));
assert.ok(run('reportData().notes.join(" ")').includes('propi denominador'));
assert.equal(run('tableData()[0][0]'),'Resposta');
run("config.denominator='all';render();");assert.equal(cells('Sovint')[1],'16,7 % (1)');
run("config.denominator='valid';config.showCellN=false;render();");
assert.equal(cells('Sovint')[1],'25,0 %');assert.equal(cells('Sovint')[3],'— %');
assert.ok(R.html(run('reportData()')).includes('83,3 %'));
assert.ok(R.parts(run('reportData()'))['word/document.xml'].includes('Salut'));
run('download=(data,name)=>{globalThis.captured={data,name};}');
elements.exportBtn.onclick();assert.ok(context.captured.data.includes('"Sovint";"25,0 %";"83,3 %";"— %"'));
context.ClipboardItem=class {constructor(items){this.items=items;}};
let clipboard;context.navigator={clipboard:{async write(items){clipboard=items[0].items;}}};
(async()=>{
 await elements.copyBtn.onclick();assert.ok((await clipboard['text/plain'].text()).includes('Sovint\t25,0 %\t83,3 %\t— %'));
 assert.ok((await clipboard['text/html'].text()).includes('Actualitat'));
 run("moveTableOrder('battery',1,0);moveTableOrder('indicators',1,0);");
 assert.equal(run('batteryTable().rows[1].cells[0]'),'Sovint');
 assert.ok(run('batteryTable().headers[1]').startsWith('Salut'));
 assert.equal(run('batteryTable().rows[1].cells[1]'),'83,3 %');
 elements.saveConfig.onclick();context.saved=JSON.parse(context.captured.data);
 assert.equal(context.saved.config.tableMode,'battery');assert.deepEqual(context.saved.config.batteryOrder,['sovint','mai']);
 run("validateSaved(saved);config.tableMode='groups';applySaved(saved,{});");
 assert.equal(elements.tableMode.value,'battery');assert.equal(run('result.groups[0].n'),4);
 run("saved.config.tableMode='invalid'");assert.throws(()=>run('validateSaved(saved)'));
 run("saved.config.tableMode='battery';saved.config.batteryOrder=['mai','mai']");assert.throws(()=>run('validateSaved(saved)'));
 // A category absent in one question stays aligned, never shifts by ordinal position.
 run("defs.IA_B.map['sovint']={label:'A vegades'};render();");
 assert.equal(cells('A vegades')[1],'83,3 %');assert.equal(cells('A vegades')[2],'0,0 %');
 assert.equal(cells('Sovint')[1],'0,0 %');
 // Numeric/multiple-response questions must be reviewed, not silently omitted.
 run("config.indicators.push({variable:'EDAT',stat:'mean'});render();");
 assert.equal(elements.copyBtn.disabled,true);assert.ok(elements.tableContainer.innerHTML.includes('resposta única'));
 assert.throws(()=>run('reportData()'));
 run("config.indicators.pop();render();");assert.equal(elements.copyBtn.disabled,false);
 // Wide batteries split for documents, but copy as a single table.
 run("config.indicators=Array.from({length:10},(_,i)=>{const variable='QUESTION_'+i;defs[variable]={...structuredClone(defs.IA_A),name:variable,label:'Pregunta '+i};for(const row of rows)row[variable]=row.IA_A;return {variable};});config.reportOrientation='auto';render();");
 let report=run('reportData()');assert.equal(report.orientation,'landscape');assert.equal(report.tables.length,2);
 assert.deepEqual(Array.from(report.tables,t=>t.headers.length),[9,3]);R.parts(report);
 assert.equal(run('reportData(true).tables.length'),1);
 await elements.copyBtn.onclick();assert.equal(((await clipboard['text/html'].text()).match(/<table\b/g)||[]).length,1);
 run("config.reportOrientation='portrait';render();");assert.equal(run('reportData().tables.length'),4);
 // Filtered empty sample keeps blank percentages and valid structure.
 run("config.globalFilters=[{variable:'CITY',op:'in',values:['missing']}];render();");
 assert.ok(run('batteryTable().headers[1]').includes('n vàlid = 0'));R.parts(run('reportData()'));
 elements.tableMode.onchange({target:{value:'groups'}});
 assert.equal(run('JSON.stringify(config.groups)'),run('savedGroups'));
 assert.equal(elements.groupControls.hidden,false);
 console.log('OK simple/battery modes: preserved groups, separate weighted bases, filters, missing/zero cells, label alignment, ordering, sessions, invalid selections, CSV/HTML/DOCX, wide clipboard and page splitting. Simulated DOM.');
})().catch(error=>{console.error(error);process.exitCode=1;});
