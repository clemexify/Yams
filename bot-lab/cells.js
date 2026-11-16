// Moyenne par case sur N parties (sans exploration), même format que les grilles humaines.
const fs=require('fs');const E=require('./engine');const {Pool,summary}=require('./pool');
const botFile=process.argv[2],pf=process.argv[3],N=+process.argv[4]||2000;
(async()=>{
const params=JSON.parse(fs.readFileSync(pf));const pool=new Pool(botFile);
const seeds=[...Array(N)].map((_,i)=>5e8+i);
const r=await pool.run(params,seeds);pool.close();
console.log(JSON.stringify(summary(r.scores)));
const H={normal:[1.9,5.4,8.8,12.3,15.8,18.7,28.1,21.6,16.4,40.0,42.9,57.1,43.6,279.8],desc:[2.5,5.7,9.1,12.1,16.3,17.7,28.0,21.4,14.5,35.5,36.1,43.7,11.5,225.2],asc:[1.4,3.7,6.5,9.9,13.2,17.6,16.8,21.0,15.1,36.1,42.8,55.8,19.0,228.6],seche:[2.2,4.8,8.4,11.4,13.8,17.3,22.0,20.9,14.8,35.7,43.9,45.5,5.1,216.3],annonce:[2.9,6.2,9.1,12.2,15.1,18.1,22.7,24.1,10.2,30.6,37.2,38.4,12.6,219.1]};
const names=['1','2','3','4','5','6','plus','minus','full','suite','carre','yams'];
console.log('case    '+E.COLS.map(c=>c.padStart(14)).join(''));
const lines=[...names.slice(0,6),'bonus','plus','minus','full','suite','carre','yams','total'];
const hi={'1':0,'2':1,'3':2,'4':3,'5':4,'6':5,bonus:6,plus:7,minus:8,full:9,suite:10,carre:11,yams:12,total:13};
// bonus et total depuis les colonnes : recalcul via cols
const colMean=[0,1,2,3,4].map(c=>r.cols.reduce((a,x)=>a+x[c],0)/r.cols.length);
for(const l of lines){
  let row=l.padEnd(8);
  E.COLS.forEach((c,ci)=>{
    let v;
    if(l==='total')v=colMean[ci];
    else if(l==='bonus')v=NaN;
    else{const k=names.indexOf(l);v=r.cnt[ci][k]?Math.abs(r.sum[ci][k]/r.cnt[ci][k]):0;}
    const h=H[c][hi[l]];
    row+=(isNaN(v)?'   ?':v.toFixed(1).padStart(6))+' ('+h.toFixed(0).padStart(3)+')   ';
  });
  console.log(row);
}
})();
