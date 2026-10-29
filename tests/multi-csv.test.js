'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../engine.js'),R=require('../report-export.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),events={};
const elements=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{value:'',innerHTML:'',hidden:false,disabled:false,addEventListener(type,fn){this[type]=fn;},showModal(){},close(){}}]));
const c=vm.createContext({CEO:E,CEOReport:R,structuredClone,TextDecoder,console,document:{getElementById:id=>elements[id],querySelectorAll(){return [];},addEventListener(type,fn){events[type]=fn;}}});
const run=s=>vm.runInContext(s,c),plain=v=>JSON.parse(JSON.stringify(v));
run(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'));
const a='REO;MES;ANY;ID;EDAT;VOTE;ONLY_A;PES\n1167;Gener;2026;1;20;PSC;yes;1\n1167;Gener;2026;2;40;ERC;no;3';
const b='REO;MES;ANY;ID;EDAT;VOTE;ONLY_B\n1169;Octubre;2026;1;60;ERC;alpha\n1169;Octubre;2026;2;80;PSC;beta';
const file=(name,text)=>({name,arrayBuffer:async()=>new TextEncoder().encode(text).buffer});
const load=async files=>elements.csvFile.change({target:{files,value:'selected'}});
const active=(index,checked)=>events.change({target:{dataset:{sourceActive:String(run('datasets['+index+'].id'))},checked}});
const remove=index=>events.click({target:{closest:()=>({dataset:{sourceRemove:String(run('datasets['+index+'].id'))}})}});
(async()=>{
 assert.match(html,/id="csvFile" type="file" multiple/);
 elements.encoding.value='auto';elements.delimiter.value='auto';
 await load([file('A.csv',a)]);
 run("config.indicators=[{variable:'EDAT',stat:'mean'},{variable:'VOTE',categoryOrder:['psc','erc']},{variable:'ONLY_A'}];defs.VOTE.map.psc={label:'Socialistes'};config.title='My analysis';config.reportNotes={custom:true,text:'My note'};config.exportName='my_export';render();");
 const originalConfig=run('JSON.stringify(config)'),originalMap=run('JSON.stringify(defs.VOTE.map)');
 await load([file('B.csv',b)]);
 assert.equal(run('datasets.length'),2);assert.equal(run('rows.length'),4);assert.equal(run('result.indicators[0].stats[0].mean'),50);
 assert.equal(run('JSON.stringify(config)'),originalConfig);assert.equal(run('JSON.stringify(defs.VOTE.map)'),originalMap);
 assert.equal(run('datasets[0].data.headers.includes("ONLY_B")'),false);
 assert.equal(run('result.indicators[2].stats[0].valid'),2);assert.equal(run('result.indicators[2].stats[0].missing'),2);
 assert.ok(elements.fileSchemaHint.textContent.includes('B.csv'));assert.ok(elements.fileSchemaHint.textContent.includes('ONLY_A'));
 assert.ok(elements.studyMetadata.innerHTML.includes('1167'));assert.ok(elements.studyMetadata.innerHTML.includes('1169'));
 // Source identity is independent of repeated respondent IDs; both waves retain all interviews.
 assert.equal(run('rows.filter(r=>r.ID==="1").length'),2);
 // Exact duplicates, including renamed files, are skipped without changing the sample.
 await load([file('A.csv',a),file('renamed.csv',b)]);assert.equal(run('datasets.length'),2);assert.equal(run('rows.length'),4);
 // Removing a source from analysis refreshes every export and preserves its definitions.
 active(0,false);assert.equal(run('rows.length'),2);assert.equal(run('result.indicators[0].stats[0].mean'),70);
 assert.ok(!elements.studyMetadata.innerHTML.includes('1167'));
 for(const output of [run('exportHTML()'),R.parts(run('reportData()'))['word/document.xml']]){assert.ok(!output.includes('REO: 1167'));assert.ok(output.includes('REO: 1169'));}
 run('download=(data,name)=>{globalThis.captured={data,name};};');elements.exportBtn.onclick();assert.ok(!c.captured.data.includes('REO: 1167'));assert.ok(c.captured.data.includes('REO: 1169'));
 // JSON persists source selections without microdata, after reloading the CSVs.
 elements.saveConfig.onclick();c.saved=JSON.parse(c.captured.data);assert.equal(c.saved.sourceFiles[0].active,false);assert.ok(!('rows' in c.saved.sourceFiles[0]));
 active(0,true);run('validateSaved(saved);applySaved(saved,{});');assert.equal(run('datasets[0].active'),false);assert.equal(run('rows.length'),2);
 // None active is permitted; analysis and save settings remain available.
 active(1,false);assert.equal(run('result'),null);assert.equal(elements.exportBtn.disabled,true);assert.equal(elements.saveConfig.disabled,false);
 active(0,true);active(1,true);
 run("config.weight='PES';render();");assert.equal(run('result.indicators[0].stats[0].invalidWeight'),2);assert.equal(run('result.indicators[0].stats[0].mean'),35);
 run("config.weight='';config.globalFilters=[{variable:'ONLY_A',op:'not',values:['yes']}];render();");assert.equal(run('result.filtered'),1);
 // Structural absence must not turn into a response via a recoding of blank values.
 run("defs.ONLY_A.map['']={label:'Blank'};config.globalFilters=[];render();");assert.equal(run('result.indicators[2].stats[0].missing'),2);
 // REO groups compare waves separately while retaining the combined source pool.
 run("config.groups=['1167','1169'].map(name=>({name,mode:'all',filters:[{variable:'REO',op:'in',values:[name]}]}));render();");
 assert.deepEqual(plain(run('result.groups.map(g=>g.n)')),[2,2]);assert.deepEqual(plain(run('result.indicators[0].stats.map(s=>s.mean)')),[30,70]);
 // Invalid batches are atomic, including a valid first file followed by a bad one.
 const before=run('JSON.stringify(sourceManifest())');await load([file('new.csv',b.replaceAll('1169','1170')),file('bad.csv','not a csv')]);
 assert.equal(run('JSON.stringify(sourceManifest())'),before);assert.ok(elements.status.textContent.includes('bad.csv'));
 // A new import wins over a slower, older import.
 let release;const delayed=elements.csvFile.change({target:{files:[{name:'slow.csv',arrayBuffer:()=>new Promise(resolve=>release=resolve)}],value:'slow'}});
 await load([file('fast.csv',a.replaceAll('1167','1171'))]);release(new TextEncoder().encode(a.replaceAll('1167','1172')).buffer);await delayed;
 assert.equal(run('datasets.length'),3);assert.equal(run('datasets.some(d=>d.name==="slow.csv")'),false);
 // Removal keeps filters instead of silently broadening the sample; files can be added again.
 remove(0);assert.deepEqual(plain(run('result.groups.map(g=>g.n)')),[0,2]);assert.equal(run('config.groups[0].filters[0].values[0]'),'1167');
 await load([file('A.csv',a)]);assert.deepEqual(plain(run('result.groups.map(g=>g.n)')),[2,2]);
 while(run('datasets.length'))remove(0);assert.equal(run('rows.length'),0);assert.equal(run('config.title'),'My analysis');
 await load([file('A.csv',a),file('A-copy.csv',a),file('B.csv',b)]);assert.equal(run('datasets.length'),2);assert.equal(run('rows.length'),4);assert.equal(run('config.title'),'My analysis');
 // Demo rows are replaced when real CSV files arrive.
 elements.demoBtn.onclick();await load([file('A.csv',a),file('B.csv',b)]);assert.equal(run('isDemo'),false);assert.equal(run('rows.length'),4);assert.equal(run('datasets.length'),2);
 // Metadata is found even if the first source has no study columns.
 const defs={EDAT:E.definition('EDAT')};const mixed=E.analyze([{EDAT:'20'},{REO:'1169',MES:'10',ANY:'2026',EDAT:'40'}],defs,{groups:[{name:'All',filters:[]}],indicators:[{variable:'EDAT'}],globalFilters:[],denominator:'valid'});
 assert.ok(mixed.studyLines.some(line=>line.includes('REO: 1169')));assert.ok(mixed.studyLines.some(line=>line.includes('no disponible')));
 console.log('OK multiple CSVs: batch/additive loading, active selection, counts/bases/weights, REO groups and exports, structural missingness, atomic failures, duplicates, races, removal, demo and JSON. Simulated DOM.');
})().catch(error=>{console.error(error);process.exitCode=1;});

