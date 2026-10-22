/* Informes HTML i DOCX editables, A4 vertical o horitzontal. Sense dependències ni xarxa. */
(function(root){
'use strict';
const PAGE_WIDTH=11906,PAGE_HEIGHT=16838,MARGIN=1020,TABLE_WIDTH=PAGE_WIDTH-2*MARGIN;
const xml=v=>String(v??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const header='Indicador';
function layout(mode='portrait',dataColumns=0){
 if(!['auto','portrait','landscape'].includes(mode))throw Error("Orientació de l'informe no vàlida.");
 const orientation=mode==='auto'?(dataColumns>3?'landscape':'portrait'):mode;
 const wide=orientation==='landscape',width=wide?PAGE_HEIGHT:PAGE_WIDTH,height=wide?PAGE_WIDTH:PAGE_HEIGHT;
 return {orientation,width,height,margin:MARGIN,tableWidth:width-2*MARGIN,maxDataColumns:wide?8:3,fontSize:wide?9:10};
}
function validate(report){
 if(!report||!Array.isArray(report.tables)||!report.tables.length)throw Error('No hi ha cap taula per exportar.');
 const page=layout(report.orientation||'portrait');
 for(const t of report.tables){if(!Array.isArray(t.headers)||t.headers.length<2||t.headers.length>page.maxDataColumns+1)throw Error('Massa columnes per a l’orientació seleccionada.');if(!Array.isArray(t.rows))throw Error('Taula incompleta.');for(const r of t.rows){if(!['section','base','data','numeric','notice'].includes(r.kind)||!Array.isArray(r.cells))throw Error('Fila no vàlida.');if(r.cells.length!==(['section','notice'].includes(r.kind)?1:t.headers.length))throw Error('El nombre de cel·les no coincideix amb les columnes.');}}
}
// Una pàgina vertical admet tres columnes de resultats sense reduir excessivament la lletra.
// La diferència acompanya sempre els dos grups als quals es refereix.
function columnSets(groups,difference,orientation='portrait'){
 const max=layout(orientation).maxDataColumns;
 const columns=groups.map((g,i)=>({index:i,label:g.name+'\n(n = '+g.n+')'})),sets=[];
 if(difference&&groups.length>=2){sets.push([...columns.splice(0,2),{index:'difference',label:'Diferència\n'+groups[0].name+' − '+groups[1].name},...columns.splice(0,max-3)]);}
 while(columns.length)sets.push(columns.splice(0,max));return sets;
}
function widths(count,orientation='portrait'){const page=layout(orientation),total=page.tableWidth;const first=Math.round(total*(count===2?.48:orientation==='landscape'?(count>5?.24:.32):.40)),remaining=total-first;const each=Math.floor(remaining/(count-1));return [first,...Array.from({length:count-1},(_,i)=>i===count-2?remaining-each*(count-2):each)];}
const style=page=>`@page{size:A4 ${page.orientation};margin:18mm}*{box-sizing:border-box}body{font:10pt/1.35 Calibri,Arial,sans-serif;color:#292326;max-width:${page.orientation==='landscape'?261:174}mm;margin:24px auto;background:#fff}h1{font-size:18pt;line-height:1.2;color:#000;margin:0 0 16pt;font-weight:600;overflow-wrap:anywhere}h2{font-size:11pt;color:#000;margin:14pt 0 7pt;break-after:avoid}table{font-size:${page.fontSize}pt;border-collapse:collapse;table-layout:fixed;width:100%;margin:0 0 12pt}th,td{padding:${page.orientation==='landscape'?'4pt 4pt':'5pt 6pt'};border-bottom:1px solid #e8dfe1;text-align:right;vertical-align:top;overflow-wrap:anywhere;white-space:normal;font-variant-numeric:tabular-nums}th{font-weight:600;background:#DB2828;color:#ffffff}th:first-child,td:first-child{text-align:left}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}.section td{background:#fcf5f5;font-weight:600;text-align:left;padding-top:7pt}.numeric td:first-child{background:#FDECEC;color:#A21D1D;font-weight:600}.section,.base{break-after:avoid;page-break-after:avoid}.base{font-size:8pt;color:#73696d}.notice td{text-align:left;color:#795717;background:#fff6e5}.notes{font-size:9pt;color:#64565b;line-height:1.4}.notes p{margin:0 0 6pt;orphans:2;widows:2}.study-meta{font-size:10pt;color:#64565b;margin:0 0 12pt;break-after:avoid;page-break-after:avoid}.study-meta p{margin:0 0 4pt;break-after:avoid}.table-block+.table-block{break-before:page;page-break-before:always}@media print{body{margin:0;max-width:none;width:auto}table{width:100%}h1{font-size:18pt}th,td{-webkit-print-color-adjust:exact;print-color-adjust:exact}}@media screen and (max-width:720px){body{margin:20px 12px}}`;
const htmlText=v=>xml(v).replace(/\r\n?|\n/g,'<br>');
const noteFonts=['Calibri','Arial','Aptos','Verdana','Georgia','Times New Roman'];
function noteStyle(value={}){
 value=value&&typeof value==='object'?value:{};
 const size=Number(value.size);
 return {font:noteFonts.includes(value.font)?value.font:'Calibri',size:Number.isFinite(size)?Math.min(24,Math.max(8,Math.round(size))):9,color:/^#[0-9a-f]{6}$/i.test(value.color)?value.color:'#64565b',bold:value.bold===true,italic:value.italic===true};
}
function notesHTML(report){
 const lines=report.notes||[];if(!lines.some(line=>String(line).trim()))return '';
 const s=noteStyle(report.notesStyle),title=report.notesTitle??'Notes de l’anàlisi';
 const css=`font-family:'${s.font}',serif;font-size:${s.size}pt;color:${s.color};font-weight:${s.bold?'700':'400'};font-style:${s.italic?'italic':'normal'};line-height:1.4;overflow-wrap:anywhere`;
 return `<section class="report-notes" style="${xml(css)}">${title?`<h2 style="font-family:inherit;font-size:inherit;font-style:inherit;color:inherit;font-weight:700;margin:14pt 0 7pt;break-after:avoid">${htmlText(title)}</h2>`:''}${lines.map(n=>`<p style="margin:0 0 6pt;min-height:1em;white-space:pre-wrap;orphans:2;widows:2">${htmlText(n)}</p>`).join('')}</section>`;
}
function noteStyles(settings){
 const s=noteStyle(settings);
 const rpr=`<w:rFonts w:ascii="${xml(s.font)}" w:hAnsi="${xml(s.font)}" w:eastAsia="${xml(s.font)}" w:cs="${xml(s.font)}"/><w:color w:val="${s.color.slice(1)}"/><w:sz w:val="${s.size*2}"/><w:szCs w:val="${s.size*2}"/>${s.italic?'<w:i/>':''}`;
 return ['Note','NoteHeading'].map(id=>`<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${id}"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="${id==='NoteHeading'?240:0}" w:after="100" w:line="280" w:lineRule="auto"/></w:pPr><w:rPr>${rpr}${s.bold||id==='NoteHeading'?'<w:b/>':''}</w:rPr></w:style>`).join('');
}

function html(report){
 validate(report);const page=layout(report.orientation||'portrait');
 const metadata=(report.studyLines||[]).map(line=>`<p>${htmlText(line)}</p>`).join('');
 const tables=report.tables.map((t,i)=>`<section class="table-block">${report.tables.length>1?`<h2>Taula ${i+1} · ${htmlText(t.label||'Comparació de grups')}</h2>`:''}${metadata?`<div class="study-meta">${metadata}</div>`:''}<table><colgroup>${widths(t.headers.length,page.orientation).map(w=>`<col style="width:${100*w/page.tableWidth}%">`).join('')}</colgroup><thead><tr>${t.headers.map(h=>`<th scope="col">${htmlText(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr class="${r.kind}">${r.cells.map(c=>`<td${['section','notice'].includes(r.kind)?` colspan="${t.headers.length}"`:''}>${htmlText(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>`).join('');
 return `<!doctype html><html lang="ca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${xml(report.fileTitle||report.title)}</title><style>${style(page)}</style></head><body><h1>${htmlText(report.title)}</h1>${tables}${notesHTML(report)}</body></html>`;
}
function runs(text){return String(text??'').split(/\r\n?|\n/).map((s,i)=>(i?'<w:r><w:br/></w:r>':'')+`<w:r><w:t xml:space="preserve">${xml(s)}</w:t></w:r>`).join('');}
function para(text,opts={}){
 const properties=`${opts.style?`<w:pStyle w:val="${opts.style}"/>`:''}${opts.keep?'<w:keepNext/>':''}<w:widowControl/>${opts.align?`<w:jc w:val="${opts.align}"/>`:''}`;
 return `<w:p><w:pPr>${properties}</w:pPr>${runs(text)}</w:p>`;
}
function cell(text,width,opts={}){return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${opts.span?`<w:gridSpan w:val="${opts.span}"/>`:''}${opts.fill?`<w:shd w:val="clear" w:color="auto" w:fill="${opts.fill}"/>`:''}<w:vAlign w:val="top"/></w:tcPr>${para(text,opts)}</w:tc>`;}
function tableXML(t,orientation='portrait'){
 const page=layout(orientation),TABLE_WIDTH=page.tableWidth;const ws=widths(t.headers.length,orientation);let s=`<w:tbl><w:tblPr><w:tblW w:w="${TABLE_WIDTH}" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="single" w:sz="4" w:color="E8DFE1"/><w:right w:val="nil"/><w:insideH w:val="single" w:sz="4" w:color="E8DFE1"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="110" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${ws.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`;
 s+=`<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>${t.headers.map((h,i)=>cell(h,ws[i],{style:'TableHeader',fill:'DB2828',align:i?'right':'left',keep:true})).join('')}</w:tr>`;
 for(const r of t.rows){const merged=['section','notice'].includes(r.kind);s+=`<w:tr><w:trPr><w:cantSplit/></w:trPr>${r.cells.map((c,i)=>cell(c,merged?TABLE_WIDTH:ws[i],{span:merged?t.headers.length:null,style:r.kind==='numeric'&&i===0?'NumericIndicator':r.kind==='section'?'TableSection':r.kind==='base'?'TableBase':r.kind==='notice'?'TableNotice':'TableText',align:merged||!i?'left':'right',fill:r.kind==='numeric'&&i===0?'FDECEC':r.kind==='section'?'FCF5F5':r.kind==='notice'?'FFF6E5':null,keep:r.kind==='section'||r.kind==='base'})).join('')}</w:tr>`;}
 return s+'</w:tbl>';
}
const declaration='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
function styles(page,notesStyle){const tableSize=page.fontSize*2;const st=(id,name,size,color,bold=false,after=0,before=0)=>`<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="${before}" w:after="${after}" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr>${bold?'<w:b/>':''}<w:color w:val="${color}"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr></w:style>`;
 return declaration+`<w:styles xmlns:w="${ns}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:color w:val="292326"/><w:sz w:val="20"/><w:lang w:val="ca-ES"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>${st('Title','Title',36,'000000',true,260)}${st('StudyMeta','Study metadata',20,'64565B',false,120)}${st('Heading2','heading 2',22,'000000',true,120,240)}${st('TableHeader','Table Header',tableSize,'FFFFFF',true)}${st('TableSection','Table Section',tableSize,'292326',true)}${st('TableText','Table Text',tableSize,'292326')}${st('NumericIndicator','Numeric Indicator',tableSize,'A21D1D',true)}${st('TableBase','Table Base',16,'73696D')}${st('TableNotice','Table Notice',18,'795717')}${noteStyles(notesStyle)}</w:styles>`;
}
function parts(report){
 validate(report);const page=layout(report.orientation||'portrait');let body=para(report.title,{style:'Title',keep:true});
 for(let i=0;i<report.tables.length;i++){const t=report.tables[i];if(i)body+='<w:p><w:r><w:br w:type="page"/></w:r></w:p>';if(report.tables.length>1)body+=para(`Taula ${i+1} · ${t.label||'Comparació de grups'}`,{style:'Heading2',keep:true});body+=(report.studyLines||[]).map(line=>para(line,{style:'StudyMeta',keep:true})).join('');body+=tableXML(t,page.orientation);}
 if((report.notes||[]).some(n=>String(n).trim())){const title=report.notesTitle??'Notes de l’anàlisi';if(title)body+=para(title,{style:'NoteHeading',keep:true});body+=(report.notes||[]).map(n=>para(n,{style:'Note'})).join('');}
 body+=`<w:sectPr><w:pgSz w:w="${page.width}" w:h="${page.height}" w:orient="${page.orientation}"/><w:pgMar w:top="${MARGIN}" w:right="${MARGIN}" w:bottom="${MARGIN}" w:left="${MARGIN}" w:header="400" w:footer="400" w:gutter="0"/></w:sectPr>`;
 return {
  '[Content_Types].xml':declaration+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>',
  '_rels/.rels':declaration+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
  'word/document.xml':declaration+`<w:document xmlns:w="${ns}"><w:body>${body}</w:body></w:document>`,
  'word/styles.xml':styles(page,report.notesStyle),
  'word/_rels/document.xml.rels':declaration+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
  'docProps/core.xml':declaration+`<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${xml(report.title)}</dc:title><dc:creator>Prospectiva · Explorador CEO</dc:creator><dc:language>ca-ES</dc:language></cp:coreProperties>`,
  'docProps/app.xml':declaration+'<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Prospectiva · Explorador CEO</Application><AppVersion>1.8</AppVersion></Properties>'
 };
}
// ZIP estàndard sense compressió: evita carregar biblioteques des d’Internet.
const crcTable=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function zip(files){
 const enc=new TextEncoder(),entries=Object.entries(files).map(([name,text])=>{const n=enc.encode(name),data=enc.encode(text);return {n,data,crc:crc32(data),offset:0};});
 const localSize=entries.reduce((s,e)=>s+30+e.n.length+e.data.length,0),centralSize=entries.reduce((s,e)=>s+46+e.n.length,0);if(localSize+centralSize>0xFFFFFFFF)throw Error('L’informe és massa gran.');
 const out=new Uint8Array(localSize+centralSize+22),view=new DataView(out.buffer);let p=0;const u16=n=>{view.setUint16(p,n,true);p+=2;},u32=n=>{view.setUint32(p,n,true);p+=4;},bytes=b=>{out.set(b,p);p+=b.length;};
 for(const e of entries){e.offset=p;u32(0x04034b50);u16(20);u16(0x800);u16(0);u16(0);u16(33);u32(e.crc);u32(e.data.length);u32(e.data.length);u16(e.n.length);u16(0);bytes(e.n);bytes(e.data);}
 for(const e of entries){u32(0x02014b50);u16(20);u16(20);u16(0x800);u16(0);u16(0);u16(33);u32(e.crc);u32(e.data.length);u32(e.data.length);u16(e.n.length);u16(0);u16(0);u16(0);u16(0);u32(0);u32(e.offset);bytes(e.n);}
 u32(0x06054b50);u16(0);u16(0);u16(entries.length);u16(entries.length);u32(centralSize);u32(localSize);u16(0);return out;
}
const api={noteStyle,notesHTML,layout,columnSets,widths,html,parts,docx:report=>zip(parts(report)),mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',page:{width:PAGE_WIDTH,height:PAGE_HEIGHT,margin:MARGIN,tableWidth:TABLE_WIDTH},header};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CEOReport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
