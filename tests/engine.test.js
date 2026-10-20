'use strict';
const assert=require('node:assert/strict');
const E=require('../engine.js');
let passed=0;
function test(name,fn){fn();passed++;console.log('OK '+name);}
test('CSV: BOM, CRLF, accents, cometes escapades, delimitador i salts dins una cel·la',()=>{
 const p=E.parseCSV('\uFEFFnom;valor\r\n"a;b";"una ""cita""\ni línia"\r\nPau;0\r\n');assert.equal(p.delimiter,';');assert.equal(p.rows.length,2);assert.equal(p.rows[0].nom,'a;b');assert.equal(p.rows[0].valor,'una "cita"\ni línia');assert.equal(p.rows[1].valor,'0');
 assert.equal(E.parseCSV('a\tb\n1\t2').delimiter,'\t');assert.equal(E.parseCSV('a,b\n1,"1,5"').rows[0].b,'1,5');
});
test('CSV: rebutja files malformades i capçaleres duplicades',()=>{assert.throws(()=>E.parseCSV('a;b\n1;2;3',';'));assert.throws(()=>E.parseCSV('a;a\n1;2',';'));assert.throws(()=>E.parseCSV('a;b\n"1;2',';'));});
test('Extrems etiquetats, zeros vàlids i no resposta',()=>{let d=E.definition('IDEOL_0_10');assert.equal(E.decode('Extrema esquerra',d).value,0);assert.equal(E.decode('Extrema dreta',d).value,10);assert.equal(E.decode('98',d).missing,true);assert.equal(E.decode('No ho sap',d).missing,true);assert.equal(E.decode('99',E.definition('EDAT')).value,99);assert.equal(E.decode('12',d).reason,'unknown');assert.equal(E.decode('Etiqueta nova',d).reason,'unknown');assert.equal(E.decode('98',E.definition('PREGUNTA_NOVA')).missing,false);});
test('Categories polítiques: codis i etiquetes convergeixen sense esdevenir escales',()=>{const d=E.definition('INT_PARLAMENT_VOT');assert.equal(d.type,'category');for(const v of ['4','PSC','PSC/PSOE','PSC/PSOE Partit dels Socialistes de Catalunya'])assert.equal(E.decode(v,d).key,'psc');assert.equal(E.decode('97',d).label,'No podria votar');});
const defs=Object.fromEntries(['IDEOL_0_10','INT_PARLAMENT_VOT','INT_PARLAMENT_VOT2','ESP_CAT_0_10','PES','PROBLEMES_1','PROBLEMES_2'].map(n=>[n,E.definition(n)]));
const rows=[{IDEOL_0_10:'Extrema esquerra',INT_PARLAMENT_VOT:'4',INT_PARLAMENT_VOT2:'ERC',PES:'1',PROBLEMES_1:'Habitatge',PROBLEMES_2:'Habitatge'},{IDEOL_0_10:'10',INT_PARLAMENT_VOT:'PSC/PSOE',INT_PARLAMENT_VOT2:'3',PES:'3',PROBLEMES_1:'Habitatge',PROBLEMES_2:'Sanitat'},{IDEOL_0_10:'No ho sap',INT_PARLAMENT_VOT:'3',INT_PARLAMENT_VOT2:'4',PES:'2',PROBLEMES_1:'No contesta',PROBLEMES_2:''},{IDEOL_0_10:'Etiqueta nova',INT_PARLAMENT_VOT:'ERC',INT_PARLAMENT_VOT2:'PSC',PES:'-1',PROBLEMES_1:'Sanitat',PROBLEMES_2:''}];
test('Bases, mitjana i pes invàlid',()=>{let s=E.summarize(rows,'IDEOL_0_10',defs,{denominator:'valid',weight:''});assert.equal(s.valid,2);assert.equal(s.missing,2);assert.equal(s.unknown,1);assert.equal(s.mean,5);assert.equal(s.median,5);s=E.summarize(rows,'IDEOL_0_10',defs,{denominator:'valid',weight:'PES'});assert.equal(s.mean,7.5);assert.equal(s.median,10);assert.equal(s.invalidWeight,1);assert.equal(s.valid,2);assert.equal(s.missing,1);});
test('Percentatges sobre vàlids versus total, amb i sense ponderació',()=>{const local=[{x:'A',w:'1'},{x:'B',w:'3'},{x:'No contesta',w:'2'}],ds={x:E.definition('x')};let s=E.summarize(local,'x',ds,{denominator:'valid',weight:'w'});assert.equal(s.counts[0].pct,25);s=E.summarize(local,'x',ds,{denominator:'all',weight:'w'});assert.equal(s.counts[0].pct,100/6);assert.equal(s.baseN,3);s=E.summarize(local,'x',ds,{denominator:'valid',weight:''});assert.equal(s.counts[0].pct,50);});
test('Filtres I/O, no resposta, límits i selecció buida',()=>{const a={variable:'INT_PARLAMENT_VOT',op:'in',values:['psc']},b={variable:'INT_PARLAMENT_VOT2',op:'in',values:['erc']};assert.equal(rows.filter(r=>E.matches(r,[a,b],defs)).length,2);assert.equal(rows.filter(r=>E.matches(r,[a,{...a,values:['erc']}],defs,'any')).length,4);assert.equal(E.match(rows[0],{variable:'IDEOL_0_10',op:'gte',value:'0'},defs),true);assert.equal(E.match(rows[0],{...a,op:'not',values:[]},defs),false);assert.throws(()=>E.match(rows[0],{variable:'ABSENT',op:'valid'},defs));});
test('Resposta múltiple: deduplica dins de cada entrevista i tracta absents',()=>{defs.MULTI={...E.definition('MULTI'),type:'multi',sources:['PROBLEMES_1','PROBLEMES_2']};const s=E.summarize(rows,'MULTI',defs,{weight:'',denominator:'valid'});assert.equal(s.valid,3);assert.equal(s.missing,1);assert.equal(s.counts.find(x=>x.label==='Habitatge').n,2);assert.equal(s.counts.find(x=>x.label==='Sanitat').n,2);assert.ok(s.counts.reduce((a,b)=>a+b.pct,0)>100);});
test('Recodificació i inversió manual no modifiquen la font',()=>{const d=E.definition('x');d.map={'a':{label:'Grup 1',missing:false},'b':{label:'Grup 1',missing:false}};assert.equal(E.decode('A',d).key,E.decode('B',d).key);const n=E.definition('IDEOL_0_10');n.reverse=true;assert.equal(E.decode('2',n).value,8);assert.equal(E.decode('2',n).key,'8');assert.equal(rows[0].IDEOL_0_10,'Extrema esquerra');});
test('Escala nacional bloquejada fins a confirmar; grup buit sense zero fals',()=>{const c={groups:[{name:'A',filters:[]}],globalFilters:[],indicators:[{variable:'ESP_CAT_0_10'}],denominator:'valid',weight:''};const out=E.analyze(rows,defs,c);assert.equal(out.indicators[0].blocked,true);assert.equal(E.summarize([],'IDEOL_0_10',defs,c).mean,null);});
test('Escapament HTML i fórmules CSV',()=>{assert.equal(E.escapeHTML('<script>'),'&lt;script&gt;');assert.equal(E.csvCell('=2+2'),'"\'=2+2"');assert.equal(E.csvCell('-3'),'"-3"');});
test('Valoració de líders: extrems etiquetats i absents es tracten correctament',()=>{
 const d=E.definition('VAL_S_ILLA_0_10');
 assert.equal(E.decode('Molt deficient',d).value,0);
 for(const label of ['Excel·lent','Excel.lent','Excel lent','Excelent'])assert.equal(E.decode(label,d).value,10);
 const rr=[{VAL_S_ILLA_0_10:'Molt deficient'},{VAL_S_ILLA_0_10:'Excel·lent'},{VAL_S_ILLA_0_10:'5'},{VAL_S_ILLA_0_10:'No contesta'}];
 const s=E.summarize(rr,'VAL_S_ILLA_0_10',{VAL_S_ILLA_0_10:d},{weight:'',denominator:'valid'});
 assert.equal(s.valid,3);assert.equal(s.mean,5);assert.equal(s.unknown,0);assert.equal(s.missing,1);
 assert.equal(E.decode('Excel·lent',E.definition('VAL_CORDO_SANITARI')).label,'Excel·lent');
});
test('Diagnòstic identifica etiquetes desconegudes i compta freqüències',()=>{
 const d=E.definition('VAL_S_ILLA_0_10');const r=[{x:'fora'},{x:'fora'},{x:'11'},{x:'98'},{x:'Molt deficient'}];
 assert.deepEqual(E.diagnostics(r,'x',d),[{raw:'fora',n:2},{raw:'11',n:1}]);
});
test('Restablir el diccionari recupera categories i deixa intactes originals i altres variables',()=>{
 const source=[{ESTUDIS_1_15:'10'},{ESTUDIS_1_15:'11'}];const old=E.definition('ESTUDIS_1_15');old.map={'10':{label:'Universitaris'},'11':{label:'Universitaris'}};
 assert.equal(E.options(source,'ESTUDIS_1_15',{ESTUDIS_1_15:old}).length,1);
 const reset=E.definition('ESTUDIS_1_15');assert.equal(E.options(source,'ESTUDIS_1_15',{ESTUDIS_1_15:reset}).length,2);
 assert.equal(source[0].ESTUDIS_1_15,'10');assert.equal(old.map['10'].label,'Universitaris');
 assert.equal(E.definition('ESP_CAT_0_10').confirmed,false);
});
console.log(`${passed} proves superades.`);
