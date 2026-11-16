const {Bot,defaultParams,playGame}=require('./bot');
const bot=new Bot(defaultParams());
const N=+process.argv[2]||50;const t0=Date.now();let S=[];
for(let i=0;i<N;i++)S.push(playGame(bot,1000+i).score);
S.sort((a,b)=>a-b);const m=S.reduce((a,b)=>a+b)/N;
console.log('moy',m.toFixed(1),'med',S[N>>1],'min',S[0],'max',S[N-1],'ms/partie',((Date.now()-t0)/N).toFixed(1));
