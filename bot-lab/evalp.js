// Évalue un fichier de paramètres sur des graines fixes (mêmes dés pour chaque variante).
const fs=require('fs');const {Pool,summary}=require('./pool');
const botFile=process.argv[2],N=+process.argv[3]||2000;const files=process.argv.slice(4);
(async()=>{const pool=new Pool(botFile);const seeds=[...Array(N)].map((_,i)=>9e8+i);let base=null;
for(const f of files){const r=await pool.run(JSON.parse(fs.readFileSync(f)),seeds);
 const cm=[0,1,2,3,4].map(c=>(r.cols.reduce((a,x)=>a+x[c],0)/r.cols.length).toFixed(0));
 let diff='';if(!base)base=r.scores;else{const d=r.scores.map((x,i)=>x-base[i]);const m=d.reduce((a,b)=>a+b)/d.length;const sd=Math.sqrt(d.reduce((a,b)=>a+(b-m)**2,0)/d.length);diff=` diff=${m.toFixed(1)}±${(sd/Math.sqrt(d.length)).toFixed(1)}`;}
 console.log(f.padEnd(22),JSON.stringify(summary(r.scores)),cm.join(' '),diff);}
pool.close();})();
