// Vérifie le moteur générique contre app.js : chaque placement doit être accepté par canPlace(),
// la valeur posée doit être valeur(), et le total final doit être grandTot().
const fs=require('fs');const E=require('./engine');const VE=require('./vengine');const VB=require('./vbot');
const src=fs.readFileSync('../app.js','utf8');
const grab=n=>{const i=src.indexOf('function '+n+'(');let j=src.indexOf('{',i),d=0;for(;;j++){if(src[j]==='{')d++;if(src[j]==='}'&&--d===0)break;}return src.slice(i,j+1);};
const consts=['FULL_ROWS','BASE_ROWS','SUITES_ROWS'].map(n=>{const i=src.indexOf('const '+n+'=');return src.slice(i,src.indexOf(';',i)+1);}).join('\n');
const fns=['sum','mkCnt','sc','canPlace','barrageForce','placementStrict','milieuOk','doubleActif','valeur','colTot','grandTot','numTot','seuilBonus','primeBonus','updBonus','updDiff','updAll','setRows'].map(grab).join('\n');
const app=new Function(`let COLS,ROWS,DESC,ASC,FIGS;const RLBL={};const tr=a=>a;const triggerBonus=()=>{};const setTimeout=()=>{};
${consts}\n${fns}\nreturn {sc,canPlace,valeur,grandTot,updAll,setRows,set:(c)=>{COLS=c},rows:{base:BASE_ROWS,pb:FULL_ROWS,suites:SUITES_ROWS}};`)();
let bad=0,checked=0;
// 1) scores des lignes
for(const rs of ['pb','suites'])app.setRows([...app.rows[rs]]);
E.DICE.forEach((c,d)=>{const dice=c.flatMap((n,f)=>Array(n).fill(f+1));for(const row of ['paire','brelan','psuite','full','suite','carre','yams'])if(app.sc(row,dice)!==VE.scoreRow(row,c)){bad++;}});
console.log('écarts de score',bad);
// 2) parties jouées par un bot non entraîné (avec exploration), validées coup par coup
for(const id of Object.keys(VB.VARIANTS)){
  const V=VB.variant(id);app.set(V.cols);app.setRows([...app.rows[V.rowset]]);
  const bot=new VB.VBot(V,VB.defaultParams(V));let errs=0;
  for(let g=0;g<30;g++){
    const sc2=Object.fromEntries(V.cols.map(c=>[c,Object.fromEntries(app.rows[V.rowset].map(r=>[r,null]))]));
    const xr=E.rng(g+99);
    const res=VB.playGame(bot,g+1,{explore:0.5,xr,onDecide:(s,d,sok,ann,done,rn)=>{
      const [c,r,cross]=done,col=V.cols[c],row=V.rows[r];const dice=E.DICE[d].flatMap((n,f)=>Array(n).fill(f+1));
      checked++;
      if(!app.canPlace(col,row,sc2,ann===null?null:V.rows[ann],rn,sok)){errs++;if(errs<4)console.log(id,'refusé',col,row,'rn',rn,'sok',sok,'ann',ann);}
      sc2[col][row]=cross?'X':app.valeur(col,row,dice,rn);app.updAll(col,sc2);
    }});
    if(app.grandTot(sc2)!==res.score&&!JSON.stringify(sc2).includes('"X"')){errs++;console.log(id,'total',app.grandTot(sc2),res.score);}
  }
  console.log(id.padEnd(6),'erreurs',errs);bad+=errs;
}
console.log('placements vérifiés',checked,'erreurs totales',bad);
