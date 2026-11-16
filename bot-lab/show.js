// Affiche une partie lisible : tour, lancers, gardes, case choisie.
const fs=require('fs');const E=require('./engine');
const M=require(process.argv[2]||'./bot2');const params=JSON.parse(fs.readFileSync(process.argv[3]||'params2.json'));
const seed=+process.argv[4]||42;const bot=new M.Bot(params);
const g=M.playGame(bot,seed,{log:true});
const cn={normal:'N',desc:'D',asc:'M',seche:'S',annonce:'A'};
for(const L of g.log){
  const rolls=L.rolls.map((x,i)=>{
    let s=x.dice.slice().sort().join('');
    if(i===0){const o=x.opts[0];s+= o.type==='keep'?' garde['+E.KEEPS.indexOf(o.k)+']':'';
      s+=' {'+x.opts.slice(0,3).map(o=>o.type[0]+(o.type==='announce'?E.ROWS[o.r]:'')+(o.cell?':'+E.COLS[o.cell[0]][0]+E.ROWS[o.cell[1]]:'')+'='+o.v).join(' ')+'}';}
    else if(x.k)s+=' (stop '+x.stop+' / relance '+x.keepV+')';
    return s;}).join(' | ');
  console.log(String(L.t).padStart(2),(L.ann?'ANN '+L.ann+' ':'')+rolls,'=>',L.final.join(''),cn[L.cell[0]]+':'+L.cell[1],L.pts+(L.cross?'X':''));
}
const s=g.state;
console.log('total',g.score);
E.COLS.forEach((c,i)=>console.log(c.padEnd(8),s.val[i].map(v=>String(v).padStart(3)).join(' '),' =',E.colTotal(s,i)));
