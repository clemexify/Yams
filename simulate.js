// Simulation Culman — Node.js standalone
// Usage: node simulate.js [N_games]

const N = parseInt(process.argv[2] || '2000', 10);

// ── Constants ────────────────────────────────────────────
const COLS = ['normal','desc','asc','seche','annonce'];
const ROWS = ['1','2','3','4','5','6','bonus','plus','minus','diff','full','suite','carre','yams'];
const DESC = ['1','2','3','4','5','6','plus','minus','full','suite','carre','yams'];
const ASC  = [...DESC].reverse();
const FIGS = ['full','suite','carre','yams'];
const NM   = {'2':6,'3':9,'4':12,'5':15,'6':18};

// ── Core math ────────────────────────────────────────────
function sum(d){return d.reduce((a,b)=>a+b,0);}
function mkCnt(d){const c={};d.forEach(v=>c[v]=(c[v]||0)+1);return c;}
function sc(row,d){
  const s=sum(d),c=mkCnt(d),vv=Object.values(c).sort((a,b)=>b-a);
  if('123456'.includes(row)){const n=+row;return d.filter(v=>v===n).reduce((a,v)=>a+v,0);}
  if(row==='plus'||row==='minus')return s;
  if(row==='full'){if((vv[0]>=3&&vv.length>=2&&vv[1]>=2)||vv[0]===5)return s+20;return 0;}
  if(row==='suite'){const u=[...new Set(d)].sort((a,b)=>a-b);return u.length===5&&u[4]-u[0]===4?s+30:0;}
  if(row==='carre'){if(vv[0]<4)return 0;const qv=+Object.keys(c).find(k=>c[k]>=4);return qv*4+40;}
  if(row==='yams')return vv[0]===5?s+50:0;
  return 0;
}
function roll5(kept,d){
  const r=[...d];
  for(let i=0;i<5;i++)if(!kept[i])r[i]=Math.floor(Math.random()*6)+1;
  return r;
}
function mkScore(){
  const g={};
  COLS.forEach(col=>{g[col]={};ROWS.forEach(r=>g[col][r]=null);});
  return g;
}

// ── Placement helpers ────────────────────────────────────
function canPlaceCol(col,row,sc2){
  if(sc2[col][row]!==null)return false;
  if(col==='desc'){const i=DESC.indexOf(row);if(i<0)return false;return DESC.slice(0,i).every(r=>sc2[col][r]!==null);}
  if(col==='asc'){const i=ASC.indexOf(row);if(i<0)return false;return ASC.slice(0,i).every(r=>sc2[col][r]!==null);}
  return true;
}
function canPlace(col,row,scores,ann,rn,sok){
  if(scores[col][row]!==null||row==='bonus'||row==='diff')return false;
  if(ann!==null&&col!=='annonce')return false;
  if(col==='desc'){const i=DESC.indexOf(row);if(i<0)return false;return DESC.slice(0,i).every(r=>scores[col][r]!==null);}
  if(col==='asc'){const i=ASC.indexOf(row);if(i<0)return false;return ASC.slice(0,i).every(r=>scores[col][r]!==null);}
  if(col==='seche')return sok;
  if(col==='annonce'){if(ann!==null)return ann===row;return rn===1;}
  return true;
}
function nextNeeded(col,sc2){
  const order=col==='desc'?DESC:ASC;
  return order.find(r=>sc2[col][r]===null)||null;
}
function numTot(col,sc2){return '123456'.split('').reduce((a,r)=>{const v=sc2[col][r];return a+(typeof v==='number'?v:0);},0);}
function colTot(col,sc2){return ROWS.reduce((a,r)=>{if(r==='plus'||r==='minus')return a;const v=sc2[col][r];return a+(typeof v==='number'?v:0);},0);}
function grandTot(sc2){return COLS.reduce((a,c)=>a+colTot(c,sc2),0);}
function bonusReach(col,sc2){
  let p=numTot(col,sc2);
  '23456'.split('').forEach(r=>{if(sc2[col][r]===null)p+=NM[r];});
  if(sc2[col]['1']===null)p+=4;return p>=60;
}
function bonusProj(col,sc2,row,s){
  let p=numTot(col,sc2)+((row in NM||row==='1')?s:0);
  '23456'.split('').forEach(r=>{if(sc2[col][r]===null&&r!==row)p+=NM[r];});
  if(sc2[col]['1']===null&&row!=='1')p+=4;return p;
}
function updAll(col,sc2){
  // bonus
  if('123456'.split('').every(r=>sc2[col][r]!==null)){
    const s='123456'.split('').reduce((a,r)=>a+(typeof sc2[col][r]==='number'?sc2[col][r]:0),0);
    sc2[col]['bonus']=s>=60?30:0;
  }
  // diff
  const p=sc2[col]['plus'],m=sc2[col]['minus'];
  const pv=typeof p==='number'?p:(p==='X'?0:null);
  const mv=typeof m==='number'?m:(m==='X'?0:null);
  if(pv!==null&&mv!==null)sc2[col]['diff']=pv-mv;
}
function autoAnn(sc2){
  const f=[];COLS.forEach(c=>ROWS.forEach(r=>{if(r!=='bonus'&&r!=='diff'&&sc2[c][r]===null)f.push({c,r});}));
  if(f.length===1&&f[0].c==='annonce')return f[0].r;return null;
}

// ── Bot helpers ──────────────────────────────────────────
function probOfFigure(d,target,rollsLeft){
  const c=mkCnt(d),vv=Object.values(c).sort((a,b)=>b-a);
  if(target==='yams'){
    if(vv[0]>=5)return 1;if(vv[0]===4)return rollsLeft>=2?0.31:rollsLeft===1?0.17:0;
    if(vv[0]===3)return rollsLeft>=2?0.12:rollsLeft===1?0.03:0;return rollsLeft>=2?0.04:0;
  }
  if(target==='carre'){
    if(vv[0]>=4)return 1;if(vv[0]===3)return rollsLeft>=2?0.70:rollsLeft===1?0.33:0;
    if(vv[0]===2&&rollsLeft>=2)return 0.20;return rollsLeft>=2?0.07:0;
  }
  if(target==='full'){
    if(sc('full',d)>0)return 1;if(vv[0]>=3)return rollsLeft>=2?0.88:rollsLeft===1?0.66:0;
    if(vv[0]>=2&&vv.length>=2&&vv[1]>=2)return rollsLeft>=2?0.70:rollsLeft===1?0.45:0;
    return rollsLeft>=2?0.37:0.15;
  }
  if(target==='suite'){
    if(sc('suite',d)>0)return 1;
    const u=[...new Set(d)].sort((a,b)=>a-b);let lseq=1,c2=1;
    for(let i=1;i<u.length;i++){if(u[i]===u[i-1]+1){c2++;lseq=Math.max(lseq,c2);}else c2=1;}
    if(lseq===4)return rollsLeft>=2?0.55:rollsLeft===1?0.27:0;
    if(lseq===3)return rollsLeft>=2?0.22:rollsLeft===1?0.06:0;return rollsLeft>=2?0.07:0;
  }
  if('123456'.includes(target)){
    const n=+target,nD=c[n]||0;
    if(nD>=3)return 1;if(nD===2)return rollsLeft>=2?0.84:rollsLeft===1?0.31:0;
    if(nD===1)return rollsLeft>=2?0.52:rollsLeft===1?0.16:0;return rollsLeft>=2?0.20:0.03;
  }
  return 0;
}
function botKeep(d,tgt){
  const c=mkCnt(d);
  if(tgt==='yams'){const mv=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];return d.map(v=>v===+mv);}
  if(tgt==='carre'){const mv=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];let k=0;return d.map(v=>v===+mv&&k<4?(k++,true):false);}
  if(tgt==='full'){
    const vv=Object.entries(c).sort((a,b)=>b[1]-a[1]);
    if(vv[0][1]>=3){const tv=+vv[0][0];const pv=vv[1]?+vv[1][0]:null;return d.map(v=>v===tv||(pv&&v===pv));}
    const ps=Object.keys(c).filter(k=>c[k]>=2).slice(0,2).map(Number);return d.map(v=>ps.includes(v));
  }
  if(tgt==='suite'){
    const u=[...new Set(d)].sort((a,b)=>a-b);let bs=[];
    for(let i=0;i<u.length;i++){let cur=[u[i]];for(let j=i+1;j<u.length;j++){if(u[j]===cur[cur.length-1]+1)cur.push(u[j]);else break;}if(cur.length>bs.length)bs=cur;}
    const ss=new Set(bs);const used={};return d.map(v=>ss.has(v)&&!used[v]?(used[v]=1,true):false);
  }
  if('123456'.includes(tgt)){const n=+tgt;return d.map(v=>v===n);}
  return d.map(()=>false);
}
function botShouldAnnounce(d,sc2){
  const c=mkCnt(d),vv=Object.values(c).sort((a,b)=>b-a);
  for(const fig of ['yams','carre','suite','full']){
    if(sc('yams',d)>0&&sc2['annonce']['yams']===null)return'yams';
    if(sc(fig,d)>0&&sc2['annonce'][fig]===null)return fig;
  }
  if(vv[0]===4&&sc2['annonce']['yams']===null)return'yams';
  if(vv[0]===3&&sc2['annonce']['carre']===null)return'carre';
  if(vv[0]>=2&&vv.length>=2&&vv[1]>=2&&sc2['annonce']['full']===null)return'full';
  const u=[...new Set(d)].sort((a,b)=>a-b);let lseq=1,c2=1;
  for(let i=1;i<u.length;i++){if(u[i]===u[i-1]+1){c2++;lseq=Math.max(lseq,c2);}else c2=1;}
  if(lseq>=4&&sc2['annonce']['suite']===null)return'suite';
  for(const n of [6,5,4,3,2]){
    if((c[n]||0)>=2&&sc2['annonce'][String(n)]===null){
      const r=String(n);
      if(sc2['desc'][r]===null||sc2['asc'][r]===null||sc2['normal'][r]===null){
        const canDesc=canPlaceCol('desc',r,sc2),canAsc=canPlaceCol('asc',r,sc2);
        if(!canDesc&&!canAsc&&sc2['normal'][r]!==null)return r;
      }
    }
  }
  return null;
}

// ── Culman-specific ──────────────────────────────────────
function culmanExpScore(row,d){
  const c=mkCnt(d);
  if(row==='yams'){const mv=+Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||4;return mv*4+50;}
  if(row==='carre'){const mv=+Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||4;return mv*4+40;}
  if(row==='full')return sum(d)+20;
  if(row==='suite')return 50;
  if('123456'.includes(row)){const n=+row;const cnt=c[n]||0;return cnt>=3?20+(cnt-3)*n:n*3.5;}
  return 0;
}
function culmanEval(d,sc2,rollsLeft,ann,sok,rn){
  const c=mkCnt(d);const items=[];
  COLS.forEach(col=>{ROWS.forEach(row=>{
    if(row==='bonus'||row==='diff')return;
    if(col==='annonce'&&!ann)return;
    if(!canPlace(col,row,sc2,ann,rn,sok))return;
    if(col==='seche'&&FIGS.includes(row)&&sc(row,d)===0&&rn<3)return;
    let prob;
    if(rollsLeft<=0)prob=sc(row,d)>0?1:0;
    else if(FIGS.includes(row))prob=probOfFigure(d,row,rollsLeft);
    else if('123456'.includes(row))prob=(c[+row]||0)>=3?1:probOfFigure(d,row,rollsLeft);
    else prob=1.0;
    const expScore=culmanExpScore(row,d);
    const colW={desc:3.84,asc:3.84,annonce:1.8,seche:1.13,normal:1.0}[col];
    items.push({col,row,ev:prob*expScore*colW,prob,expScore,curScore:sc(row,d)});
  });});
  return items.sort((a,b)=>b.ev-a.ev);
}
function culman100(d,sc2,ann,sok,rn){
  const c=mkCnt(d),items=[];
  COLS.forEach(col=>{ROWS.forEach(row=>{
    if(row==='bonus'||row==='diff'||row==='plus'||row==='minus'||row==='1')return;
    if(col==='annonce'&&!ann)return;
    if(!canPlace(col,row,sc2,ann,rn,sok))return;
    if(col==='seche'&&FIGS.includes(row)&&sc(row,d)===0&&rn<3)return;
    const p=FIGS.includes(row)?(sc(row,d)>0?1:0):('23456'.includes(row)?((c[+row]||0)>=3?1:0):0);
    if(p===1)items.push({col,row,curScore:sc(row,d),ev:999});
  });});
  const colOrd={asc:0,desc:1,seche:2,annonce:3,normal:4};
  return items.sort((a,b)=>(b.curScore-a.curScore)||((colOrd[a.col]??4)-(colOrd[b.col]??4)));
}
function culmanGetFallback(sc2,ann,sok){
  const checks=[
    ['yams','asc'],['1','desc'],
    ['plus','asc'],['plus','desc'],['plus','seche'],['plus','annonce'],['plus','normal'],
    ['minus','asc'],['minus','desc'],['minus','seche'],['minus','annonce'],['minus','normal'],
    ['1','asc'],['1','seche'],['1','annonce'],['1','normal'],
    ['yams','desc'],['yams','seche'],['yams','annonce'],['yams','normal'],
  ];
  for(const[row,col]of checks){
    if(col==='annonce'&&!ann)continue;
    if(canPlace(col,row,sc2,ann,3,sok))return{col,row};
  }
  return null;
}
function bestColForFig(fig,sc2,sok){
  if(canPlaceCol('asc',fig,sc2))return'asc';
  if(canPlaceCol('desc',fig,sc2))return'desc';
  if(sok&&sc2['seche'][fig]===null)return'seche';
  if(sc2['normal'][fig]===null)return'normal';
  return null;
}
function botEvalPlacement(col,row,s,d,sc2){
  const cp={desc:3,asc:3,annonce:2,seche:2,normal:1}[col];
  const c=mkCnt(d);
  if(FIGS.includes(row)){
    if(s>0){const w={yams:50,carre:30,suite:25,full:18}[row];return s*cp+w*cp;}
    const totalFree=COLS.reduce((a,c2)=>a+ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&sc2[c2][r]===null).length,0);
    if(row==='yams'&&totalFree<10)return -10;
    return-({yams:60,carre:40,suite:50,full:25}[row])*cp;
  }
  if('23456'.includes(row)){
    const nD=c[+row]||0;
    if(nD>=3){
      let val=s*cp;
      const proj=bonusProj(col,sc2,row,s);
      if(proj>=60)val+=30*cp;else if(proj>=54)val+=24*cp;
      else if(proj>=48)val+=16*cp;else if(proj>=42)val+=10*cp;else val+=5*cp;
      return val;
    }
    if(nD===2){
      if(col==='desc'||col==='asc'){const bR=bonusReach(col,sc2);if(bR)return s*0.05*cp;return s*0.3*cp;}
      return s*0.2;
    }
    return s*0.1;
  }
  if(row==='1'){const nD=c[1]||0;return nD>=3?s*cp:s*(col==='desc'?0.3:0.1);}
  if(row==='plus'||row==='minus')return s>20?s*0.5:-10;
  return s;
}
function botBestPlacement(d,sc2,ann,sok,fallbackCell){
  if(ann){return{col:'annonce',row:ann,score:sc(ann,d)};}
  for(const fig of ['yams','carre','suite','full']){
    if(sc(fig,d)>0){
      const col=bestColForFig(fig,sc2,sok);
      if(col)return{col,row:fig,score:sc(fig,d)};
    }
  }
  const c=mkCnt(d);
  let bestPos=null,bestVal=-Infinity,hasDirectOption=false;
  COLS.forEach(col=>{
    ROWS.forEach(row=>{
      if(row==='bonus'||row==='diff')return;
      if(!canPlace(col,row,sc2,ann,3,sok))return;
      if(col==='seche'&&FIGS.includes(row)&&sc(row,d)===0)return;
      hasDirectOption=true;
      const s=sc(row,d);
      const val=botEvalPlacement(col,row,s,d,sc2);
      if(val>bestVal){bestVal=val;bestPos={col,row,score:s};}
    });
  });
  if(!hasDirectOption&&sok){
    for(const fig of FIGS){if(sc2['seche'][fig]===null)return{col:'seche',row:fig,score:0};}
  }
  // Use fallback if placement is bad (barring or <3 dice on chiffre)
  if(fallbackCell){
    const isBad=!bestPos||(bestPos.score===0&&!['plus','minus'].includes(bestPos.row))||
      ('23456'.includes(bestPos.row)&&(c[+bestPos.row]||0)<3);
    if(isBad&&canPlace(fallbackCell.col,fallbackCell.row,sc2,ann,3,sok))
      return{col:fallbackCell.col,row:fallbackCell.row,score:sc(fallbackCell.row,d)};
  }
  return bestPos;
}

// ── Culman turn simulation ───────────────────────────────
function culmanTurn(sc2){
  let d=[0,0,0,0,0],bAnn=null,bSok=false;
  let bKept=[false,false,false,false,false];
  const auto=autoAnn(sc2);
  const directFree=COLS.some(c=>c!=='annonce'&&c!=='seche'&&ROWS.some(r=>r!=='bonus'&&r!=='diff'&&canPlaceCol(c,r,sc2)));
  const secheSafeFree=ROWS.some(r=>r!=='bonus'&&r!=='diff'&&!FIGS.includes(r)&&sc2['seche'][r]===null);
  const secheFigFree=FIGS.some(r=>sc2['seche'][r]===null);
  if(!auto&&!directFree&&!secheSafeFree&&!secheFigFree){
    const annPrio=['1','2','3','4','5','6','plus','minus','full','suite','carre','yams'];
    for(const r of annPrio){if(sc2['annonce'][r]===null){bAnn=r;break;}}
  }
  let culTarget=null,upgradeMode=false,fallbackCell=null;
  for(let rn=1;rn<=3;rn++){
    d=roll5(bKept,d);
    const nR=bKept.filter(k=>!k).length;
    bSok=(rn===1||nR===5);
    if(rn===1){
      if(!bAnn){if(auto)bAnn=auto;else{const t=botShouldAnnounce(d,sc2);if(t)bAnn=t;}}
      fallbackCell=culmanGetFallback(sc2,bAnn,bSok);
    }
    const rl=3-rn;
    const secheAvail=ROWS.some(r=>r!=='bonus'&&r!=='diff'&&sc2['seche'][r]===null);
    if(!upgradeMode){
      const sure=culman100(d,sc2,bAnn,bSok,rn);
      if(sure.length>0){
        const best=sure[0];
        const isSeche100=bSok&&sc2['seche'][best.row]===null;
        if(rl===0||isSeche100||best.row==='yams'||best.row==='suite'||best.row==='full'){
          culTarget=best;break;
        } else if(best.row==='carre'&&rl>0){
          culTarget={col:best.col,row:'yams',ev:999,curScore:sc('yams',d)};upgradeMode=true;
        } else {
          culTarget=best;upgradeMode=true;
        }
      }
    }
    if(rn===3){
      const bestNow=Math.max(0,...COLS.flatMap(c=>ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&canPlace(c,r,sc2,bAnn,rn,bSok)).map(r=>sc(r,d))));
      const hasContract='123456'.split('').some(r=>(mkCnt(d)[+r]||0)>=3);
      if(secheAvail&&bestNow<20&&!bAnn&&!hasContract){
        d=roll5([false,false,false,false,false],d);bSok=true;
      }
      break;
    }
    if(!upgradeMode){
      const ev=culmanEval(d,sc2,rl,bAnn,bSok,rn);
      if(secheAvail&&!bAnn&&(ev.length===0||ev[0].ev<8)){
        bKept=[false,false,false,false,false];continue;
      }
      if(ev.length>0&&(!culTarget||ev[0].ev>(culTarget.ev||0)))culTarget=ev[0];
    }
    const keep=culTarget?botKeep(d,culTarget.row):[false,false,false,false,false];
    bKept=keep;if(keep.every(k=>k))break;
  }
  // Placement
  let best=botBestPlacement(d,sc2,bAnn,bSok,fallbackCell);
  if(!best&&bAnn)best={col:'annonce',row:bAnn,score:sc(bAnn,d)};
  if(!best){
    for(const col of COLS)for(const row of ROWS){
      if(row==='bonus'||row==='diff')continue;
      if(!canPlace(col,row,sc2,bAnn,3,bSok))continue;
      if(col==='seche'&&FIGS.includes(row)&&sc(row,d)===0)continue;
      best={col,row,score:sc(row,d)};break;
    }
  }
  if(!best)return; // no move possible (shouldn't happen)
  const{col,row,score}=best;
  if(score>0)sc2[col][row]=score;
  else sc2[col][row]='X';
  updAll(col,sc2);
}

// ── Simulate one game ────────────────────────────────────
function simulateGame(){
  const sc2=mkScore();
  const totalTurns=COLS.length*ROWS.filter(r=>r!=='bonus'&&r!=='diff').length;
  for(let t=0;t<totalTurns;t++){
    const done=COLS.every(c=>ROWS.filter(r=>r!=='bonus'&&r!=='diff').every(r=>sc2[c][r]!==null));
    if(done)break;
    culmanTurn(sc2);
  }
  return grandTot(sc2);
}

// ── Run ──────────────────────────────────────────────────
console.log(`Simulation Culman — ${N} parties...`);
const scores=[];
for(let i=0;i<N;i++)scores.push(simulateGame());
scores.sort((a,b)=>a-b);
const mean=Math.round(scores.reduce((a,b)=>a+b,0)/N);
const median=scores[Math.floor(N/2)];
const p10=scores[Math.floor(N*0.1)];
const p90=scores[Math.floor(N*0.9)];
const best=scores[N-1];
const worst=scores[0];
console.log(`Moyenne : ${mean} pts`);
console.log(`Médiane : ${median} pts`);
console.log(`P10/P90 : ${p10} / ${p90} pts`);
console.log(`Min/Max : ${worst} / ${best} pts`);
