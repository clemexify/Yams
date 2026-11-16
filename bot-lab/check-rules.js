// Compare le score de chaque figure du moteur avec la fonction sc() d'app.js, sur les 252 tirages.
const fs=require('fs');const E=require('./engine');
const src=fs.readFileSync('../app.js','utf8');
const grab=n=>{const i=src.indexOf('function '+n+'(');let j=src.indexOf('{',i),d=0;for(;;j++){if(src[j]==='{')d++;if(src[j]==='}'&&--d===0)break;}return src.slice(i,j+1);};
eval(grab('sum')+grab('mkCnt')+grab('sc')+';globalThis.appSc=sc;');
let bad=0;
E.DICE.forEach((c,d)=>{const dice=[];c.forEach((n,f)=>{for(let k=0;k<n;k++)dice.push(f+1);});
  E.ROWS.forEach((row,r)=>{const a=appSc(row,dice),b=E.SC[r][d];if(a!==b){bad++;if(bad<10)console.log(row,dice,a,b);}});});
console.log('écarts',bad);
