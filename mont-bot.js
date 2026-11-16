// Bot des boss du Mont Yams. Repris de bot-lab/ (engine.js, vengine.js, vbot.js, nn.js),
// où il a été entraîné et vérifié contre les règles d'app.js. Les lancers sont calculés
// exactement (252 tirages, 462 gardes possibles) ; la valeur de la grille restante vient
// d'un petit réseau de neurones propre à chaque configuration, chargé depuis bots/<boss>.json.
// Le bruit (noise) affaiblit le boss : il fausse au hasard la valeur de chaque case.
(function(racine){
'use strict';
// ── Combinatoire des dés ──
const code=c=>c[0]+6*c[1]+36*c[2]+216*c[3]+1296*c[4]+7776*c[5];
function multisets(n){
  const out=[];
  const rec=(i,left,cur)=>{if(i===5){cur[5]=left;out.push(cur.slice());return;}for(let k=left;k>=0;k--){cur[i]=k;rec(i+1,left-k,cur);}};
  rec(0,n,[0,0,0,0,0,0]);return out;
}
const fact=[1,1,2,6,24,120];
const DICE=multisets(5),ND=DICE.length;
const DIDX=new Int16Array(46656).fill(-1);DICE.forEach((c,i)=>DIDX[code(c)]=i);
const KEEPS=[];for(let n=0;n<=5;n++)KEEPS.push(...multisets(n));
const NK=KEEPS.length;
const KIDX=new Int16Array(46656).fill(-1);KEEPS.forEach((c,i)=>KIDX[code(c)]=i);
const KEMPTY=KIDX[0];
const KT=KEEPS.map(kc=>{
  const m=5-kc.reduce((a,b)=>a+b,0),idx=[],p=[];
  for(const r of multisets(m)){let w=fact[m]/Math.pow(6,m);for(const x of r)w/=fact[x];idx.push(DIDX[code(kc.map((v,i)=>v+r[i]))]);p.push(w);}
  return{idx:Int16Array.from(idx),p:Float64Array.from(p)};
});
const SUB=DICE.map(c=>{
  const out=[];const rec=(i,cur)=>{if(i===6){out.push(KIDX[code(cur)]);return;}for(let k=0;k<=c[i];k++){cur[i]=k;rec(i+1,cur);}};
  rec(0,[0,0,0,0,0,0]);return Int16Array.from(out);
});
const DSUM=Int16Array.from(DICE.map(c=>c.reduce((a,v,i)=>a+v*(i+1),0)));
const popc=x=>{let n=0;while(x){x&=x-1;n++;}return n;};

// ── Règles ──
const ROWSETS={
  base:['1','2','3','4','5','6','plus','minus','full','suite','carre','yams'],
  pb:['1','2','3','4','5','6','plus','minus','paire','brelan','full','suite','carre','yams'],
  suites:['1','2','3','4','5','6','plus','minus','full','psuite','suite','carre','yams'],
};
const FIG=new Set(['paire','brelan','full','psuite','suite','carre','yams']);
function scoreRow(row,c){
  const s=c.reduce((a,v,i)=>a+v*(i+1),0);
  if('123456'.includes(row))return c[+row-1]*+row;
  if(row==='plus'||row==='minus')return s;
  const mx=Math.max(...c);
  if(row==='paire'){for(let f=5;f>=0;f--)if(c[f]>=2)return(f+1)*2+10;return 0;}
  if(row==='brelan'){for(let f=5;f>=0;f--)if(c[f]>=3)return(f+1)*3+20;return 0;}
  if(row==='full')return((mx===3&&c.includes(2))||mx===5)?s+20:0;
  if(row==='suite'){const ok=[0,1,2,3,4].every(i=>c[i]===1)||[1,2,3,4,5].every(i=>c[i]===1);return ok?s+30:0;}
  if(row==='psuite')return[[0,1,2,3],[1,2,3,4],[2,3,4,5]].some(q=>q.every(i=>c[i]>0))?30:0;
  if(row==='carre'){const f=c.findIndex(v=>v>=4);return f<0?0:(f+1)*4+40;}
  if(row==='yams')return mx===5?s+50:0;
  return 0;
}
// Variante : clé « colonnes~lignes », par exemple « normal+desc+asc~pb »
function variante(cle){
  const[cs,rs]=cle.split('~'),cols=cs.split('+'),rows=ROWSETS[rs||'base'];
  const NR=rows.length,NC=cols.length;
  return{cle,cols,rows,NR,NC,SC:rows.map(r=>Int16Array.from(DICE.map(c=>scoreRow(r,c)))),
    isFig:rows.map(r=>FIG.has(r)),PLUS:rows.indexOf('plus'),MINUS:rows.indexOf('minus'),turns:NR*NC,
    seuil:cols.map(c=>c==='double'?120:60),prime:cols.map(c=>c==='double'?60:30)};
}
function etatVide(V){return{mask:new Array(V.NC).fill(0),up:new Array(V.NC).fill(0),val:V.cols.map(()=>new Array(V.NR).fill(null)),turn:0};}
function casesOrdonnees(V,kind,m){
  if(kind==='desc'){for(let r=0;r<V.NR;r++)if(!(m>>r&1))return[r];return[];}
  if(kind==='asc'){for(let r=V.NR-1;r>=0;r--)if(!(m>>r&1))return[r];return[];}
  if(kind==='milieu'){
    if(m===0)return[V.PLUS,V.MINUS];
    let lo=99,hi=-1;for(let r=0;r<V.NR;r++)if(m>>r&1){lo=Math.min(lo,r);hi=Math.max(hi,r);}
    const out=[];if(lo-1>=0)out.push(lo-1);if(hi+1<V.NR)out.push(hi+1);return out;
  }
  const out=[];for(let r=0;r<V.NR;r++)if(!(m>>r&1))out.push(r);return out;
}
function poser(V,s,c,r,d,rn,barre){
  const m=V.cols[c]==='double'&&rn<3?2:1;
  const pts=barre&&r!==V.MINUS?0:V.SC[r][d]*m;
  s.val[c][r]=pts;s.mask[c]|=1<<r;if(r<6)s.up[c]+=pts;s.turn++;
  return pts;
}
function totalCol(V,s,c){
  const v=s.val[c];let up=0,t=0;
  for(let r=0;r<6;r++)up+=v[r]||0;
  t+=up+(up>=V.seuil[c]&&v.slice(0,6).every(x=>x!==null)?V.prime[c]:0);
  if(v[V.PLUS]!==null&&v[V.MINUS]!==null)t+=v[V.PLUS]-v[V.MINUS];
  for(let r=0;r<V.NR;r++)if(V.isFig[r])t+=v[r]||0;
  return t;
}
const total=(V,s)=>V.cols.reduce((a,_,c)=>a+totalCol(V,s,c),0);

// ── Réseau ──
function reseau(j){
  const sizes=j.sizes,L=sizes.length-1,W=j.W.map(w=>Float64Array.from(w)),b=j.b.map(v=>Float64Array.from(v)),buf=sizes.map(n=>new Float64Array(n));
  return function(x){
    let h=x;
    for(let l=0;l<L;l++){
      const n=sizes[l],m=sizes[l+1],Wl=W[l],o=buf[l+1];
      for(let k=0;k<m;k++)o[k]=b[l][k];
      for(let i=0;i<n;i++){const xi=h[i];if(xi===0)continue;const off=i*m;for(let k=0;k<m;k++)o[k]+=xi*Wl[off+k];}
      if(l<L-1)for(let k=0;k<m;k++)if(o[k]<0)o[k]=0;
      h=o;
    }
    return h[0];
  };
}
const FIX=[0.01,0.03,0.10,0.60,0.22,0.04];
const PT=(()=>{
  const T=new Float64Array(64*61);
  for(let s=0;s<=60;s++)T[s]=s>=60?1:0;
  for(let m=1;m<64;m++){
    let f=0;while(!(m>>f&1))f++;const rest=m&~(1<<f);
    for(let s=0;s<=60;s++){let p=0;for(let n=0;n<=5;n++)p+=FIX[n]*T[rest*61+Math.min(60,s+n*(f+1))];T[m*61+s]=s>=60?1:p;}
  }
  return T;
})();
function traits(V,mask,up,turn,x){
  x.fill(0);let o=0;
  for(let c=0;c<V.NC;c++){
    for(let r=0;r<V.NR;r++)x[o+r]=(mask[c]>>r&1)?0:1;
    o+=V.NR;
    const m=mask[c]&63,k=V.seuil[c]/60,u=up[c]/k;
    if(up[c]>=V.seuil[c])x[o+1]=1;
    else if(m!==63){
      let par=0;for(let f=0;f<6;f++)if(m>>f&1)par+=3*(f+1);
      x[o]=u/60;x[o+2]=Math.max(-2,Math.min(2,(u-par)/15));
      x[o+3]=PT[(~m&63)*61+Math.min(60,Math.floor(u))];
    }
    o+=4;
  }
  x[o]=(V.turns-turn)/V.turns;
  return x;
}

// ── Bot ──
function Bot(V,poids,noise){
  this.V=V;this.net=reseau(poids);this.x=new Float64Array(V.NC*(V.NR+4)+1);
  this.ann=V.cols.indexOf('annonce');this.noise=noise||0;this.rnd=Math.random;
}
Bot.prototype.value=function(mask,up,turn){
  if(turn>=this.V.turns)return 0;
  return this.net(traits(this.V,mask,up,turn,this.x))*100;
};
Bot.prototype.prepare=function(s){
  const V=this.V;this.cache=[];
  for(let c=0;c<V.NC;c++){
    const row=[];
    for(let r=0;r<V.NR;r++){
      if(s.mask[c]>>r&1){row.push(null);continue;}
      const mask=s.mask.slice();mask[c]|=1<<r;
      if(r<6){const ms=V.cols[c]==='double'?[1,2]:[1];
        row.push(ms.map(m=>[0,1,2,3,4,5].map(n=>{const up=s.up.slice();up[c]+=n*(r+1)*m;return this.value(mask,up,s.turn+1);})));}
      else row.push(this.value(mask,s.up,s.turn+1));
    }
    this.cache.push(row);
  }
  if(this.noise)this.nz=this.cache.map(r=>r.map(()=>(this.rnd()-0.5)*2*this.noise));
};
Bot.prototype.pv=function(s,c,r,d,rn,barre){
  const V=this.V,m=V.cols[c]==='double'&&rn<3?2:1;let v;
  if(r<6){const n=barre?0:DICE[d][r],pts=n*(r+1)*m;
    const bon=s.up[c]<V.seuil[c]&&s.up[c]+pts>=V.seuil[c]?V.prime[c]:0;
    v=pts+bon+this.cache[c][r][m-1][n];}
  else if(r===V.MINUS)v=this.cache[c][r]-DSUM[d]*m;
  else v=this.cache[c][r]+(barre?0:V.SC[r][d]*m);
  return this.noise?v+this.nz[c][r]:v;
};
Bot.prototype.legal=function(s){
  const V=this.V,base=[],seche=[],barr=[];
  for(let c=0;c<V.NC;c++){
    const k=V.cols[c];
    if(k==='seche'){for(let r=0;r<V.NR;r++)if(!(s.mask[c]>>r&1))seche.push([c,r]);}
    else if(k==='annonce'){for(let r=0;r<V.NR;r++)if(!(s.mask[c]>>r&1))barr.push([c,r]);}
    else for(const r of casesOrdonnees(V,k,s.mask[c]))base.push([c,r]);
  }
  return{base,seche,barr};
};
Bot.prototype.plan=function(s){
  const V=this.V;this.prepare(s);
  const{base,seche,barr}=this.legal(s);
  const mk=()=>({v:new Float64Array(ND).fill(-Infinity),a:new Array(ND).fill(null)});
  const Tm0=mk(),Tf0=mk(),Tm1=mk(),Tf1=mk();
  const upd=(T,d,val,cell)=>{if(val>T.v[d]){T.v[d]=val;T.a[d]=cell;}};
  for(let d=0;d<ND;d++){
    for(const[c,r]of base){const vm=this.pv(s,c,r,d,1),vf=this.pv(s,c,r,d,3),cell=[c,r,false];upd(Tm0,d,vm,cell);upd(Tm1,d,vm,cell);upd(Tf0,d,vf,cell);upd(Tf1,d,vf,cell);}
    for(const[c,r]of seche){const v=this.pv(s,c,r,d,3),cell=[c,r,false];upd(Tf1,d,v,cell);if(!V.isFig[r]||V.SC[r][d]>0)upd(Tm1,d,v,cell);}
    if(base.length===0){
      for(const[c,r]of seche.concat(barr))upd(Tf0,d,this.pv(s,c,r,d,3,true),[c,r,true]);
      if(!seche.length)for(const[c,r]of barr)upd(Tf1,d,this.pv(s,c,r,d,3,true),[c,r,true]);
    }
  }
  const KV2=new Float64Array(NK);
  for(let k=0;k<NK;k++){const T=k===KEMPTY?Tf1.v:Tf0.v,t=KT[k];let e=0;for(let i=0;i<t.idx.length;i++)e+=t.p[i]*T[t.idx[i]];KV2[k]=e;}
  const E2=[new Float64Array(ND),new Float64Array(ND)];
  for(let d=0;d<ND;d++){let b=-Infinity;for(const k of SUB[d])if(KV2[k]>b)b=KV2[k];E2[0][d]=Math.max(Tm0.v[d],b);E2[1][d]=Math.max(Tm1.v[d],b);}
  const KV1=new Float64Array(NK);
  for(let k=0;k<NK;k++){const T=k===KEMPTY?E2[1]:E2[0],t=KT[k];let e=0;for(let i=0;i<t.idx.length;i++)e+=t.p[i]*T[t.idx[i]];KV1[k]=e;}
  return{Tm:[Tm0,Tm1],Tf:[Tf0,Tf1],KV2,KV1};
};
Bot.prototype.annPlan=function(s,r){
  const g=new Float64Array(ND);for(let d=0;d<ND;d++)g[d]=this.pv(s,this.ann,r,d,3);
  const K2=new Float64Array(NK);for(let k=0;k<NK;k++){const t=KT[k];let e=0;for(let i=0;i<t.idx.length;i++)e+=t.p[i]*g[t.idx[i]];K2[k]=e;}
  const G2=new Float64Array(ND);for(let d=0;d<ND;d++){let b=g[d];for(const k of SUB[d])if(K2[k]>b)b=K2[k];G2[d]=b;}
  const K1=new Float64Array(NK);for(let k=0;k<NK;k++){const t=KT[k];let e=0;for(let i=0;i<t.idx.length;i++)e+=t.p[i]*G2[t.idx[i]];K1[k]=e;}
  return{r,g,K2,K1};
};
Bot.prototype.bestKeep=function(d,KV){let bk=-1,bv=-Infinity;for(const k of SUB[d])if(KV[k]>bv){bv=KV[k];bk=k;}return[bk,bv];};
Bot.prototype.decide1=function(s,d,pl){
  const V=this.V,opts=[];
  const onlyAnn=V.NC===1&&this.ann===0;
  const left=s.mask.reduce((a,m)=>a+V.NR-popc(m),0);
  const annOpen=[];
  if(this.ann>=0)for(let r=0;r<V.NR;r++)if(!(s.mask[this.ann]>>r&1))annOpen.push(r);
  if(!onlyAnn&&!(left===1&&annOpen.length===1)){
    if(pl.Tm[1].a[d])opts.push({type:'place',v:pl.Tm[1].v[d],cell:pl.Tm[1].a[d]});
    const[k,kv]=this.bestKeep(d,pl.KV1);opts.push({type:'keep',v:kv,k});
  }
  for(const r of annOpen){
    const ap=this.annPlan(s,r),[ak,akv]=this.bestKeep(d,ap.K1);
    opts.push({type:'announce',r,v:Math.max(ap.g[d],akv),ap,now:ap.g[d]>=akv,k:ak});
  }
  opts.sort((a,b)=>b.v-a.v);
  return opts[0];
};

function gardeVersMasque(des,kc){
  const need=kc.slice(),keep=[false,false,false,false,false];
  for(let i=0;i<5;i++)if(need[des[i]-1]>0){need[des[i]-1]--;keep[i]=true;}
  return keep;
}
const indexDes=des=>{const c=[0,0,0,0,0,0];for(const v of des)c[v-1]++;return DIDX[code(c)];};

// Joue un tour complet sur la réserve de 15 dés (faces 1 à 6) partagée avec le joueur :
// le dé i du lancer n prend la valeur reserve[(n-1)*5+i], exactement comme pour le joueur.
// Modifie l'état et renvoie ce qui s'est passé, pour l'affichage.
function jouerTour(bot,s,reserve){
  const V=bot.V,des=[0,0,0,0,0];let keep=[false,false,false,false,false];
  const lancer=rn=>{for(let i=0;i<5;i++)if(!keep[i])des[i]=reserve[(rn-1)*5+i];};
  const pl=bot.plan(s);lancer(1);
  const lancers=[des.slice()];
  let d=indexDes(des),sok=true,ann=null,ap=null,fait=null,rn=1;
  const o=bot.decide1(s,d,pl);
  if(o.type==='place')fait=o.cell;
  else if(o.type==='announce'){ann=o.r;ap=o.ap;if(o.now)fait=[bot.ann,ann,false];else keep=gardeVersMasque(des,KEEPS[o.k]);}
  else keep=gardeVersMasque(des,KEEPS[o.k]);
  while(!fait&&rn<3){
    rn++;
    sok=keep.every(k=>!k);lancer(rn);d=indexDes(des);lancers.push(des.slice());
    if(ann!==null){
      if(rn===3){fait=[bot.ann,ann,false];break;}
      const[k,kv]=bot.bestKeep(d,ap.K2);
      if(ap.g[d]>=kv){fait=[bot.ann,ann,false];break;}
      keep=gardeVersMasque(des,KEEPS[k]);continue;
    }
    if(rn===3){fait=pl.Tf[sok?1:0].a[d];break;}
    const T=pl.Tm[sok?1:0],[k,kv]=bot.bestKeep(d,pl.KV2);
    if(T.a[d]&&T.v[d]>=kv){fait=T.a[d];break;}
    keep=gardeVersMasque(des,KEEPS[k]);
  }
  const[c,r,barre]=fait;
  const pts=poser(V,s,c,r,d,rn,barre);
  return{col:V.cols[c],row:V.rows[r],pts,barre:!!barre||pts===0,rn,ann:ann!==null?V.rows[ann]:null,des:des.slice(),lancers};
}

const API={variante,etatVide,Bot,jouerTour,total,totalCol,poser,DICE,indexDes};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else racine.MontBot=API;
})(typeof window!=='undefined'?window:this);
