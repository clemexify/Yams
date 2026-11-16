// Liste les configurations distinctes (colonnes + lignes) du Parcours et du Défi, lues dans app.js.
const fs=require('fs');const src=fs.readFileSync(__dirname+'/../app.js','utf8');
const lit=n=>{const i=src.indexOf('const '+n+'=');let j=src.indexOf('[',i),d=0;for(;;j++){if(src[j]==='[')d++;if(src[j]===']'&&--d===0)break;}return eval(src.slice(src.indexOf('[',i),j+1));};
const PB=new Set(['t1l3b','t2l3b','t3l3b','t4l3b']);
const levels=[];
for(const t of lit('PARCOURS_TIERS'))for(const l of t.levels)levels.push({id:l.id,name:l.name,cols:l.cols,rowset:PB.has(l.id)?'pb':'base',boss:!!l.boss});
for(const v of lit('DAILY_NEW_VARIANTS'))levels.push({id:v.id,name:v.name,cols:v.cols,rowset:v.rows==='suites'?'suites':'base'});
levels.push({id:'expert',name:'Expert',cols:['normal','desc','asc','seche','annonce'],rowset:'base'});
const key=l=>l.cols.join('+')+'~'+l.rowset;
const configs={};for(const l of levels){(configs[key(l)]=configs[key(l)]||[]).push(l.id);}
module.exports={levels,configs,key};
if(require.main===module){console.log(Object.keys(configs).length,'configurations');for(const[k,v]of Object.entries(configs))console.log(k.padEnd(42),v.join(' '));}
