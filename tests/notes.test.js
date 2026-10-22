'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../engine.js'),R=require('../report-export.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const elements=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{value:'',innerHTML:'',hidden:false,open:false,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}}]));
const context=vm.createContext({CEO:E,CEOReport:R,structuredClone,console,alert:msg=>{throw Error(msg);},document:{getElementById:id=>{assert.ok(elements[id],id);return elements[id];},addEventListener(){},querySelectorAll(){return [];}}});
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'));
assert.equal(elements.notesEditor.hidden,true);
run("install({headers:['EDAT'],rows:[{EDAT:'20'},{EDAT:'40'}]},'source.csv');config.indicators=[{variable:'EDAT',stat:'mean'}];render();download=(data,name)=>{globalThis.captured={data,name};};");
assert.equal(elements.notesEditor.hidden,false);assert.equal(elements.notesEditor.open,false);
assert.ok(elements.notesText.value.includes('source.csv'));
run("config.groups[0].name='Grup actualitzat';render();");assert.ok(elements.notesText.value.includes('Grup actualitzat'));
const originalMean=run('result.indicators[0].stats[0].mean');
elements.notesTitle.value='Comentari propi';elements.notesTitle.oninput();
elements.notesText.value='Primera línia & context\n\nSegona línia <script>alert(1)</script>';elements.notesText.oninput();
for(const [id,value] of [['notesFont','Georgia'],['notesSize','14'],['notesColor','#db2828']]){elements[id].value=value;elements[id].onchange();}
elements.notesBold.checked=true;elements.notesBold.onchange();elements.notesItalic.checked=true;elements.notesItalic.onchange();
assert.equal(elements.notesState.textContent,'Personalitzades');
let report=run('reportData()'),exported=R.html(report),parts=R.parts(report);
assert.equal(report.notesTitle,'Comentari propi');assert.equal(report.notes.length,3);assert.equal(report.notes[1],'');
assert.equal(report.notesStyle.font,'Georgia');assert.equal(report.notesStyle.size,14);
assert.ok(exported.includes('font-size:14pt'));assert.ok(exported.includes('font-weight:700'));assert.ok(exported.includes('font-style:italic'));
assert.ok(exported.includes('color:#db2828'));assert.ok(exported.includes('font-family:&apos;Georgia&apos;'));
assert.ok(exported.includes('&lt;script&gt;'));assert.ok(!exported.includes('<script>'));
assert.ok(elements.tableNotes.innerHTML.includes('Comentari propi'));
assert.ok(parts['word/document.xml'].includes('Comentari propi'));assert.ok(parts['word/document.xml'].includes('Primera línia &amp; context'));
const noteStyle=parts['word/styles.xml'].match(/<w:style[^>]*w:styleId="Note">[\s\S]*?<\/w:style>/)[0];
assert.ok(noteStyle.includes('w:ascii="Georgia"'));assert.ok(noteStyle.includes('w:sz w:val="28"'));assert.ok(noteStyle.includes('w:color w:val="db2828"'));assert.ok(noteStyle.includes('<w:b/>'));assert.ok(noteStyle.includes('<w:i/>'));
elements.exportBtn.onclick();assert.ok(context.captured.data.includes('Comentari propi'));assert.ok(context.captured.data.includes('Primera línia & context'));assert.ok(!context.captured.data.includes('Mostra carregada'));
elements.wordBtn.onclick();assert.ok(Buffer.from(context.captured.data).toString('utf8').includes('w:ascii="Georgia"'));
context.Blob=Blob;context.ClipboardItem=class {constructor(items){this.items=items;}};
let clipboard;context.navigator={clipboard:{async write(items){clipboard=items[0].items;}}};
(async()=>{
 await elements.copyBtn.onclick();assert.ok((await clipboard['text/plain'].text()).includes('Comentari propi\nPrimera línia & context'));
 assert.ok((await clipboard['text/html'].text()).includes('font-size:14pt'));
 // Personal text remains stable as the actual analysis changes.
 run("config.globalFilters=[{variable:'EDAT',op:'gte',value:30}];render();");assert.equal(run('result.filtered'),1);assert.equal(run('notes()[0]'),'Primera línia & context');
 elements.toggleNotes.onclick();assert.equal(elements.tableNotes.innerHTML,'');assert.equal(run('notes().length'),0);
 exported=run('exportHTML()');assert.ok(!exported.includes('class="report-notes"'));assert.ok(!exported.includes('Comentari propi'));
 assert.ok(!R.parts(run('reportData()'))['word/document.xml'].includes('Comentari propi'));
 elements.exportBtn.onclick();assert.ok(!context.captured.data.includes('Primera línia'));
 await elements.copyBtn.onclick();assert.ok(!(await clipboard['text/plain'].text()).includes('Primera línia'));
 elements.toggleNotes.onclick();assert.ok(elements.tableNotes.innerHTML.includes('Primera línia'));assert.equal(run('noteSettings().style.font'),'Georgia');
 // Exported JSON restores the complete editor state, including appearance.
 elements.saveConfig.onclick();context.saved=JSON.parse(context.captured.data);
 elements.resetNotes.onclick();assert.equal(elements.notesState.textContent,'Predeterminades');assert.equal(elements.notesFont.value,'Calibri');assert.ok(elements.notesText.value.includes('mostra filtrada: 1'));
 run('validateSaved(saved);applySaved(saved,{});');assert.equal(elements.notesState.textContent,'Personalitzades');assert.equal(elements.notesFont.value,'Georgia');
 // Empty text removes the heading as well. A deliberately empty title is respected.
 elements.notesText.value='   \n';elements.notesText.oninput();assert.equal(elements.tableNotes.innerHTML,'');assert.ok(!run('exportHTML()').includes('Comentari propi'));
 elements.notesText.value='Nota sense títol';elements.notesText.oninput();elements.notesTitle.value='';elements.notesTitle.oninput();
 assert.ok(!R.parts(run('reportData()'))['word/document.xml'].includes('w:pStyle w:val="NoteHeading"'));assert.ok(run('exportHTML()').includes('Nota sense títol'));
 // Old configurations have no notes settings; importing them restores automatic notes.
 run('delete saved.config.reportNotes;validateSaved(saved);applySaved(saved,{});');assert.equal(elements.notesState.textContent,'Predeterminades');
 assert.equal(run('result.indicators[0].stats[0].mean'),40);assert.equal(originalMean,30);
 // Imported style fields cannot introduce markup/CSS; numeric bounds are enforced.
 const safe=R.noteStyle({font:'Arial; background:url(https://bad.invalid)',color:'red" onload="bad',size:1000,bold:'true'});
 assert.equal(safe.font,'Calibri');assert.equal(safe.color,'#64565b');assert.equal(safe.size,24);assert.equal(safe.bold,false);
 assert.equal(R.noteStyle({size:1}).size,8);
 assert.throws(()=>run('saved.config.reportNotes={text:123};validateSaved(saved);'));
 console.log('OK notes: text automàtic/person., títol, format, ocultació, restauració, JSON, totes les exportacions i escapament. DOM simulat.');
})().catch(error=>{console.error(error);process.exitCode=1;});
