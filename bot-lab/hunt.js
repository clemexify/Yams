const M=require('./bot3');const E=require('./engine');const b=new M.Bot(require('./snap4.json'));
const base=5e7+51*120,w=+process.argv[2];
const seeds=[...Array(20)].map((_,k)=>base+w*20+k);const xr=E.rng(seeds[0]*31+7);
for(const sd of seeds){const t0=Date.now();process.stderr.write('w'+w+' '+sd+'\n');
  const g=M.playGame(b,sd,{explore:0.05,xr,onPlace:s=>{M.featS(s);M.shaped(s);}});}
console.log('w'+w+' ok');
