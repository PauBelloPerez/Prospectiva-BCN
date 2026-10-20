/* Motor descriptiu independent de la interfície. Sense dependències ni xarxa. */
(function(root){
'use strict';
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const number=v=>{const s=String(v??'').trim().replace(',','.');return /^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;};
const textMissing=new Set(['','na','n/a','nan','null','no ho sap','no sap','no contesta','no respon','no procedeix','no es procedent','no aplicable']);
const parties={'1':'PP','3':'ERC','4':'PSC','10':'CUP','18':'Comuns','21':'Junts','23':'Vox','25':'Aliança Catalana','80':'Altres partits','93':'Nul','94':'En blanc','95':'Cap altre','96':'No votaria','97':'No podria votar','98':'No ho sap','99':'No contesta'};
const ageGroups={'1':'De 18 a 24 anys','2':'De 25 a 34 anys','3':'De 35 a 49 anys','4':'De 50 a 64 anys','5':'65 anys o més'};
const birth={'1':'A Catalunya','2':'A altres comunitats autònomes','5':'Fora d’Espanya'};
const education={'1':'Menys de 5 anys d’escolarització','2':'Educació Primària','3':'Qualificació professional de grau inicial','4':'Educació secundària','5':'FP de Grau Mitjà','6':'Batxillerat','7':'FP de Grau Superior','8':'Arquitectura/Enginyeria Tècnica','9':'Diplomatura','10':'Grau','11':'Llicenciatura','12':'Arquitectura/Enginyeria','13':'Màster oficial universitari','14':'Doctorat','15':'Títols propis de postgrau','80':'Altres'};
const names={IDEOL_0_10:'Autoubicació esquerra–dreta',ESP_CAT_0_10:'Autoubicació espanyolisme–catalanisme',EDAT:'Edat',EDAT_GR:'Grups d’edat',ESTUDIS_1_15:'Nivell d’estudis',LLOC_NAIX:'Lloc de naixement',INT_PARLAMENT_VOT:'Intenció de vot · Parlament',INT_PARLAMENT_VOT2:'Segona opció · Parlament',REC_PARLAMENT_VOT:'Record de vot · Parlament',REC_PARLAMENT_VOT_CENS:'Record de vot · Parlament (cens)',SEXE:'Sexe',GENERE:'Gènere',VAL_GOV_CAT_0_10:'Valoració del Govern de Catalunya',VAL_GOV_ESP_0_10:'Valoració del Govern espanyol',EUR_0_10:'Europeisme',INGRESSOS_1_15:'Ingressos de la llar',SENTIMENT_PERTINENÇA:'Sentiment de pertinença',INTERES_POL:'Interès per la política'};
function parseDelimited(text,delimiter){
 text=String(text).replace(/^\uFEFF/,'');let rows=[],row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}
 else if(c==='"'&&!cell&&!closed){quoted=true;}
 else if(c===delimiter){row.push(cell);cell='';closed=false;}
 else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()!==''))rows.push(row);row=[];cell='';closed=false;}
 else {if(closed&&c.trim())throw Error('Text inesperat després de les cometes. Revisa el separador.');if(!closed)cell+=c;}}
 if(quoted)throw Error('El CSV té cometes sense tancar.');row.push(cell);if(row.some(v=>v.trim()!==''))rows.push(row);return rows;
}
function parseCSV(text,delimiter='auto'){
 if(delimiter==='tab')delimiter='\t';
 if(delimiter==='auto'){
  let best=null;for(const d of [';',',','\t']){try{const r=parseDelimited(text,d);if(!r.length)continue;const width=r[0].length,ok=r.slice(1,101).filter(x=>x.length===width).length;const score=width>1?ok*100+Math.min(width,99):-1;if(!best||score>best.score)best={d,score};}catch{}}
  if(!best||best.score<0)throw Error('No es detecta un CSV amb diverses columnes. Tria el separador manualment.');delimiter=best.d;
 }
 const r=parseDelimited(text,delimiter);if(r.length<2)throw Error('Cal una capçalera i almenys una entrevista.');
 const headers=r.shift().map(x=>x.trim());if(headers.some(x=>!x)||new Set(headers).size!==headers.length)throw Error('La capçalera té noms buits o duplicats. Cal corregir-los abans de carregar.');
 const wrong=r.findIndex(x=>x.length!==headers.length);if(wrong>=0)throw Error(`El registre ${wrong+2} té ${r[wrong].length} camps; se n’esperaven ${headers.length}. No s’ha omès cap registre.`);
 return {headers,rows:r.map(c=>Object.fromEntries(headers.map((h,i)=>[h,c[i].trim()]))),delimiter};
}
function definition(name){
 const upper=name.toUpperCase();const d={name,label:names[upper]||name,type:'category',map:{},aliases:{},labels:{},missingCodes:[],min:null,max:null,confirmed:true,source:'Variable nova · revisa el tipus',reverse:false};
 if(/(?:^|_)0_10(?:_|$)/.test(upper)){Object.assign(d,{type:'number',min:0,max:10,missingCodes:['98','99'],source:'Escala 0–10 · regla CEO'});if(/IDEOL/.test(upper)){d.aliases[norm('Extrema esquerra')]='0';d.aliases[norm('Extrema dreta')]='10';}if(/^ESP_CAT_0_10/.test(upper)){d.confirmed=false;d.aliases[norm('Màxim espanyolisme')]='0';d.aliases[norm('Màxim catalanisme')]='10';}if(/^EUR_/.test(upper)){d.aliases[norm('Mínim europeisme')]='0';d.aliases[norm('Màxim europeisme')]='10';}if(/^VAL_GOV_/.test(upper)){d.aliases[norm('Molt dolenta')]='0';d.aliases[norm('Molt bona')]='10';}if(/^SIMPATIA_/.test(upper)){d.aliases[norm('Molta antipatia')]='0';d.aliases[norm('Molta simpatia')]='10';}}
 // Valoració de líders: els extrems del qüestionari són 0=molt deficient i 10=excel·lent.
 // No apliquem aquesta equivalència a totes les preguntes que comencen per VAL_.
 if(/^VAL_(?!GOV_).+_0_10$/.test(upper)){
  d.aliases[norm('Molt deficient')]='0';
  for(const label of ['Excel·lent','Excel.lent','Excel lent','Excelent'])d.aliases[norm(label)]='10';
 }
 if(['EDAT','FILLS','PERSONES_LLAR'].includes(upper)){Object.assign(d,{type:'number',min:upper==='EDAT'?18:0,source:'Quantitat · regla CEO'});if(upper==='FILLS')d.missingCodes=['99'];}
 if(/^IDEOL_(PARE|MARE)_/.test(upper))d.missingCodes=['97','98','99'];
 if(/^(INT|REC)_(PARLAMENT|CONGRES)_VOT(?:2)?(?:_CENS)?$/.test(upper)||/^SIMPATIA_PARTIT(?:_PROPER)?$/.test(upper)){
  d.labels={...parties};d.missingCodes=['98','99'];d.source='Partit · codificació CEO revisable';
  const a={'PSC/PSOE':'4','PSC/PSOE Partit dels Socialistes de Catalunya':'4','PSC Partit dels Socialistes de Catalunya':'4','ERC Esquerra Republicana de Catalunya':'3','PP Partit Popular':'1','CUP Candidatura d’Unitat Popular':'10','Junts per Catalunya':'21','Comuns Sumar':'18','Comuns / Sumar':'18','Sumar - En Comú Podem':'18','Podemos':'12','Ciudadanos':'6'};
  for(const [k,v] of Object.entries(a))d.aliases[norm(k)]=v;
 }
 if(upper==='EDAT_GR'){d.labels={...ageGroups};d.source='Grups d’edat · regla CEO';}
 if(upper==='LLOC_NAIX'){d.labels={...birth};d.source='Lloc de naixement · regla CEO';}
 if(upper==='ESTUDIS_1_15'){d.labels={...education};d.source='Estudis · regla CEO';d.missingCodes=['98','99'];}
 if(['SEXE','GENERE','INTERES_POL','INGRESSOS_1_15','SENTIMENT_PERTINENÇA'].includes(upper))d.missingCodes=['98','99'];
 if(upper==='SEXE')d.labels={'1':'Masculí','2':'Femení'};
 if(upper==='GENERE')d.labels={'1':'Home','2':'Dona','80':'Altres/No binari'};
 if(upper==='INTERES_POL')d.labels={'1':'Molt','2':'Bastant','3':'Poc','4':'Gens'};
 for(const [code,label] of Object.entries(d.labels))d.aliases[norm(label)]=code;
 return d;
}
function decode(raw,d){
 const key=norm(raw);const custom=d.map&&Object.hasOwn(d.map,key)?d.map[key]:null;
 if(custom){if(custom.missing)return {missing:true,reason:'excluded'};if(d.type==='number'){const v=number(custom.value);if(v===null)return {missing:true,reason:'unknown'};return numeric(v,d);}return {missing:false,key:norm(custom.label??raw),label:String(custom.label??raw)};}
 if(textMissing.has(key))return {missing:true,reason:'missing'};
 const token=Object.hasOwn(d.aliases||{},key)?d.aliases[key]:String(raw).trim();
 if((d.missingCodes||[]).includes(token))return {missing:true,reason:'missing'};
 if(d.type==='number'){const v=number(token);if(v===null)return {missing:true,reason:'unknown'};return numeric(v,d);}
 const label=Object.hasOwn(d.labels||{},token)?d.labels[token]:String(raw).trim();return {missing:false,key:norm(label),label};
}
function numeric(v,d){if((d.min!==null&&d.min!==''&&v<Number(d.min))||(d.max!==null&&d.max!==''&&v>Number(d.max)))return {missing:true,reason:'unknown'};const value=d.reverse?Number(d.min)+Number(d.max)-v:v;return {missing:false,value,key:String(value),label:String(value)};}
function cell(row,name,defs){const d=defs[name];if(!d)throw Error(`Variable absent: ${name}`);if(d.type==='multi'){let vals=new Map();for(const f of d.sources||[]){const x=decode(row[f],defs[f]);if(!x.missing)vals.set(x.key,x.label);}return vals.size?{missing:false,values:vals}:{missing:true,reason:'missing'};}return decode(row[name],d);}
function match(row,filter,defs){
 if(!defs[filter.variable])throw Error(`Filtre sense columna: ${filter.variable}`);
 const x=cell(row,filter.variable,defs);if(filter.op==='missing')return x.missing;if(filter.op==='valid')return !x.missing;if(x.missing)return false;
 if(filter.op==='gte'||filter.op==='lte'){const n=number(filter.value);if(n===null||defs[filter.variable].type!=='number')return false;return filter.op==='gte'?x.value>=n:x.value<=n;}
 const values=filter.values||[];if(!values.length)return false;const hit=x.values?[...x.values.keys()].some(k=>values.includes(k)):values.includes(x.key);return filter.op==='not'? !hit:hit;
}
const matches=(row,filters,defs,mode='all')=>!filters.length||(mode==='any'?filters.some(f=>match(row,f,defs)):filters.every(f=>match(row,f,defs)));
function options(rows,name,defs){const map=new Map();for(const r of rows){const c=cell(r,name,defs);if(c.missing)continue;if(c.values){for(const [k,l] of c.values)map.set(k,l);}else map.set(c.key,c.label);}const d=defs[name];const order=new Map(Object.values(d.labels||{}).map((l,i)=>[norm(l),i]));return [...map].map(([key,label])=>({key,label})).sort((a,b)=>{if(order.has(a.key)&&order.has(b.key))return order.get(a.key)-order.get(b.key);return a.label.localeCompare(b.label,'ca',{numeric:true});});}
function median(items,weighted){const a=[...items].sort((a,b)=>a.v-b.v);if(!a.length)return null;if(!weighted){const n=a.length;return n%2?a[(n-1)/2].v:(a[n/2-1].v+a[n/2].v)/2;}const half=a.reduce((s,x)=>s+x.w,0)/2;let s=0;for(const x of a){s+=x.w;if(s>=half)return x.v;}return a.at(-1).v;}
function summarize(rows,name,defs,settings){
 const d=defs[name];let valid=0,missing=0,unknown=0,invalidWeight=0,totalWeight=0,validWeight=0,sum=0,items=[],counts=new Map();
 for(const r of rows){const w=settings.weight?number(r[settings.weight]):1;if(w===null||w<=0){invalidWeight++;continue;}totalWeight+=w;const x=cell(r,name,defs);if(x.missing){missing++;if(x.reason==='unknown')unknown++;continue;}valid++;validWeight+=w;
  if(d.type==='number'){sum+=x.value*w;items.push({v:x.value,w});}else{const values=x.values||new Map([[x.key,x.label]]);for(const [key,label] of values){const t=counts.get(key)||{key,label,n:0,w:0};t.n++;t.w+=w;counts.set(key,t);}}
 }
 const base=settings.denominator==='all'?totalWeight:validWeight;
 return {n:rows.length,valid,missing,unknown,invalidWeight,totalWeight,validWeight,mean:validWeight?sum/validWeight:null,median:median(items,!!settings.weight),counts:[...counts.values()].map(c=>({...c,pct:base?100*c.w/base:null})),base,baseN:settings.denominator==='all'?rows.length-invalidWeight:valid};
}
function analyze(rows,defs,config){
 const filtered=rows.filter(r=>matches(r,config.globalFilters||[],defs));const groups=config.groups.map(g=>({...g,rows:filtered.filter(r=>matches(r,g.filters||[],defs,g.mode))}));
 const result={filtered:filtered.length,groups:groups.map(({rows,...g})=>({...g,n:rows.length})),indicators:[],overlap:0};
 if(groups.length>=2){const a=new Set(groups[0].rows);result.overlap=groups[1].rows.filter(r=>a.has(r)).length;}
 for(const sel of config.indicators){const name=sel.variable,d=defs[name];if(!d)throw Error(`Indicador absent: ${name}`);if(d.type==='number'&&!d.confirmed){result.indicators.push({name,label:d.label,type:d.type,blocked:true});continue;}
  const stats=groups.map(g=>summarize(g.rows,name,defs,config));const cats=options(filtered,name,defs);result.indicators.push({name,label:d.label,type:d.type,stat:sel.stat||'mean',stats,categories:cats});
 }
 return result;
}
function diagnostics(rows,name,d){
 const counts=new Map();
 for(const row of rows){const raw=String(row[name]??'');const x=decode(raw,d);if(x.reason==='unknown')counts.set(raw,(counts.get(raw)||0)+1);}
 return [...counts].map(([raw,n])=>({raw,n})).sort((a,b)=>b.n-a.n||a.raw.localeCompare(b.raw,'ca',{numeric:true}));
}
function escapeHTML(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function csvCell(v){let s=String(v??'');if(/^[=+@-]/.test(s)&&number(s)===null)s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
const api={norm,number,parseCSV,definition,decode,cell,match,matches,options,summarize,analyze,diagnostics,escapeHTML,csvCell};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CEO=api;
})(typeof globalThis!=='undefined'?globalThis:this);
