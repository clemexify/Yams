// ══ MONT YAMS ═════════════════════════════════════════════
// Le mode de progression (1.14.0), à la place de l'ancien Parcours. Huit mondes du Village
// au Sommet, 8 niveaux et un boss par monde. Les niveaux et leurs seuils d'étoiles viennent
// de mont-niveaux.js, fabriqué par bot-lab/mont-gen.js : le bot a joué chaque niveau
// 500 fois à trois forces, la moyenne de chaque force donne un seuil. Les boss sont joués
// par mont-bot.js, sur la même réserve de dés que le joueur à chaque tour.
// Chargé avant app.js (dont l'initialisation peut reprendre une partie du Mont Yams), il
// n'utilise ses globales (COLS, ROWS, players, tr, EN...) qu'à l'appel de ses fonctions.

const MONT_KEY='yams_mont';
const MT=a=>Array.isArray(a)?(EN?a[1]:a[0]):a;
const MONT_NOEUDS=(()=>{
  const out=[];let num=0;
  MONT_MONDES.forEach((w,wi)=>{
    w.levels.forEach((lv,j)=>{num++;out.push({wi,j,kind:'level',lv,id:lv.id,num});});
    out.push({wi,j:w.levels.length,kind:'boss',boss:w.boss,id:'boss-'+w.boss.id});
  });
  // L'altitude monte régulièrement du Village (1 000 m) au Sommet (4 810 m)
  out.forEach((n,i)=>{n.idx=i;n.alt=Math.round((1000+i*3810/(out.length-1))/10)*10;});
  return out;
})();
const fmtAlt=a=>a.toLocaleString(LOCALE).replace(/ | /g,' ')+' m';

// ── Progression ──
function montCharger(){
  let d=null;try{d=JSON.parse(localStorage.getItem(MONT_KEY));}catch(e){}
  if(!d||!d.etoiles){d={etoiles:{},best:{},des:[],de:null};montSauver(d);}
  // Tout le monde part du niveau 1 (décision du 2026-11-16) : la 1.14.0 ouvrait d'office des
  // mondes aux joueurs de l'ancien Parcours (champ `ouvert`), qu'on retire ici.
  if('ouvert' in d){delete d.ouvert;montSauver(d);}
  return d;
}
function montSauver(d){try{localStorage.setItem(MONT_KEY,JSON.stringify(d));}catch(e){}}
const montEt=(d,n)=>d.etoiles[n.id]||0;
function montOuvert(d,i){return i===0||montEt(d,MONT_NOEUDS[i-1])>0;}
function montCourant(d){
  for(let i=0;i<MONT_NOEUDS.length;i++)if(montOuvert(d,i)&&!montEt(d,MONT_NOEUDS[i]))return i;
  return MONT_NOEUDS.length-1;
}
function montTotalEtoiles(d){return Object.values(d.etoiles).reduce((a,b)=>a+b,0);}
function montAltitude(d){
  let a=0;MONT_NOEUDS.forEach(n=>{if(montEt(d,n))a=Math.max(a,n.alt);});return a;
}
function montMondeBattu(d,wi){return montEt(d,MONT_NOEUDS.find(n=>n.wi===wi&&n.kind==='boss'))>0;}

// ── Dessins : visages des boss (des dés avec une tête) et décors des mondes ──
function montOmbre(h,f){const n=parseInt(h.slice(1),16);let r=n>>16&255,g=n>>8&255,b=n&255;
  if(f<0){r*=1+f;g*=1+f;b*=1+f;}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f;}
  return`rgb(${r|0},${g|0},${b|0})`;}
const montAlpha=(h,a)=>{const n=parseInt(h.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
function montVisage(id,color,humeur='ok',taille=100){
  const lo=montOmbre(color,-.35),hi=montOmbre(color,.35);
  const yeux=`<circle cx="35" cy="47" r="7" fill="#1b1830"/><circle cx="65" cy="47" r="7" fill="#1b1830"/><circle cx="37" cy="45" r="2" fill="#fff" opacity=".7"/><circle cx="67" cy="45" r="2" fill="#fff" opacity=".7"/>`;
  const bouche={ok:'M38 67 q12 9 24 0',perd:'M38 73 q12 -9 24 0',gagne:'M36 64 q14 16 28 0 z'}[humeur];
  const b=humeur==='gagne'?`<path d="${bouche}" fill="#1b1830"/>`:`<path d="${bouche}" fill="none" stroke="#1b1830" stroke-width="4.5" stroke-linecap="round"/>`;
  const corps=`<rect x="8" y="12" width="84" height="82" rx="22" fill="url(#mv${id})" stroke="${lo}" stroke-width="3"/>`;
  const defs=`<defs><linearGradient id="mv${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="${color}"/></linearGradient></defs>`;
  let c=corps+yeux+b,acc='';
  switch(id){
    case'gege':acc=`<path d="M29 63 q10 -9 21 -1 q11 -8 21 1 q-6 9 -21 3 q-15 6 -21 -3z" fill="#4a2c18"/><path d="M18 20 q32 -24 64 0 q-32 9 -64 0z" fill="#2b2238"/><circle cx="50" cy="6" r="3.5" fill="#2b2238"/>`;break;
    case'moniteur':acc=`<path d="M16 26 q34 -40 68 0z" fill="#f05555"/><rect x="14" y="22" width="72" height="10" rx="5" fill="#fff"/><circle cx="50" cy="-1" r="7" fill="#fff"/>`;break;
    case'contre':acc=`<path d="M14 30 a36 30 0 0 1 72 0z" fill="#f5c842" stroke="#a87b0c" stroke-width="2.5"/><rect x="8" y="27" width="84" height="7" rx="3.5" fill="#e3ae1c"/><circle cx="50" cy="16" r="6" fill="#fff8d0" stroke="#a87b0c" stroke-width="2"/>`;break;
    case'croupier':acc=`<path d="M14 22 h72 l-10 14 h-52z" fill="#27c47e" opacity=".85"/><path d="M34 86 l16 7 l-16 7z M66 86 l-16 7 l16 7z" fill="#1b1830"/><circle cx="50" cy="93" r="4" fill="#1b1830"/>`;break;
    case'foehn':c=corps+yeux+`<circle cx="50" cy="70" r="6" fill="none" stroke="#1b1830" stroke-width="4.5"/><circle cx="24" cy="64" r="8" fill="#fff" opacity=".35"/><circle cx="76" cy="64" r="8" fill="#fff" opacity=".35"/>`;
      acc=`<path d="M58 70 h24 a6 6 0 1 0 -6 -6 M60 80 h34 a6 6 0 1 1 -6 6" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>`;break;
    case'yeti':acc=`<path d="M8 32 l7 -16 l8 12 l8 -16 l8 12 l8 -16 l8 12 l8 -16 l8 12 l8 -16 l8 12 l7 16 q-42 -8 -84 0z" fill="#f4f6ff"/><path d="M41 70 l4 8 l4 -8z M51 70 l4 8 l4 -8z" fill="#fff"/>`;break;
    case'jumeaux':c=`<g transform="translate(-6 6) scale(.62)">${corps}${yeux}<path d="M38 67 q12 9 24 0" fill="none" stroke="#1b1830" stroke-width="5" stroke-linecap="round"/></g><g transform="translate(44 30) scale(.62)">${corps}${yeux}${b}</g>`;break;
    case'maitre':acc=`<path d="M22 22 l7 -20 l12 13 l9 -17 l9 17 l12 -13 l7 20z" fill="#f5c842" stroke="#a87b0c" stroke-width="2.5" stroke-linejoin="round"/><circle cx="50" cy="0" r="3.5" fill="#f05555"/>`;break;
  }
  return`<svg viewBox="-6 -10 112 112" width="${taille}" height="${taille}" aria-hidden="true">${defs}${c}${acc}</svg>`;
}
function montDecor(monde,c){
  const s=`fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  return{
    village:`<svg viewBox="0 0 70 70"><path ${s} d="M8 36 L35 12 L62 36"/><path ${s} d="M14 32 V62 H56 V32"/><path ${s} d="M29 62 V46 H41 V62"/><path ${s} d="M46 22 V12 H52 V27"/></svg>`,
    pistes:`<svg viewBox="0 0 70 70"><path ${s} d="M2 62L26 18l12 20 8-12 22 36z"/><path ${s} d="M19 31l7 5 6-5M42 32l4 3 4-3"/></svg>`,
    mine:`<svg viewBox="0 0 70 70"><path ${s} d="M10 26 q25 -18 50 0"/><path ${s} d="M35 17 V64"/><path ${s} d="M18 64 h34"/></svg>`,
    hotel:`<svg viewBox="0 0 70 70"><circle cx="35" cy="35" r="26" ${s}/><circle cx="35" cy="35" r="26" fill="none" stroke="${c}" stroke-width="7" stroke-dasharray="8 12"/><circle cx="35" cy="35" r="14" ${s}/></svg>`,
    col:`<svg viewBox="0 0 70 70"><path ${s} d="M4 28 h40 a8 8 0 1 0 -8 -8 M4 42 h52 a8 8 0 1 1 -8 8 M10 56 h28"/></svg>`,
    seracs:`<svg viewBox="0 0 70 70"><path ${s} d="M6 6h58v58H6V22M16 16h38v38H16V32M26 26h18v18H32"/></svg>`,
    lac:`<svg viewBox="0 0 70 70"><path ${s} d="M8 30 L24 10 L40 30"/><path ${s} d="M8 40 L24 60 L40 40" opacity=".5"/><path ${s} d="M44 36 q6 -5 12 0 t12 0"/></svg>`,
    sommet:`<svg viewBox="0 0 70 70"><path ${s} d="M2 64L34 10l34 54z"/><path ${s} d="M34 10V0l12 5-12 5"/><path ${s} d="M24 27l10 6 9-6"/></svg>`,
  }[monde];
}
const MONT_ETOILE='<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5L2.5 9.4l6.6-.8z"/>';
const montEtoileSvg=(on,cls='')=>`<svg viewBox="0 0 24 24" class="${on?'on ':''}${cls}" aria-hidden="true">${MONT_ETOILE}</svg>`;
const MONT_CADENAS='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V8a5 5 0 0 1 10 0v3"/><rect x="5" y="11" width="14" height="10" rx="2.5"/></svg>';
const MONT_DES=['bois','glacier','acier','rubis','ardoise','cristal','miroir','or'];
function montDeHTML(v,skin,cls=''){
  const P={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]}[v];
  return`<span class="my-die ${skin?'de-'+skin:''} ${cls}">${[...Array(9)].map((_,i)=>P.includes(i)?'<i></i>':'<b></b>').join('')}</span>`;
}
function montAppliquerDe(){
  const d=montCharger();
  MONT_DES.forEach(s=>document.body.classList.toggle('de-'+s,d.de===s));
}

// ── Textes d'une étape ──
function montNomLignes(rows){
  const jeu=rows.filter(r=>r!=='bonus'&&r!=='diff');
  if(jeu.join()==='1,2,3,4,5,6')return tr('les six chiffres','the six numbers');
  if(jeu.join()==='1,2,3,4,5,6,plus,minus')return tr('les chiffres, le + et le −','the numbers, + and −');
  return jeu.map(r=>'123456'.includes(r)?RLBL[r]:r==='suite'&&jeu.includes('psuite')?tr('Grande suite','Large straight'):nomFig(r)).join(', ');
}
function montNomCols(cols){return ORDRE_COLS.filter(c=>cols.includes(c)).map(c=>CNAME[c]).join(', ');}
function montExtraLignes(rows){
  if(rows.includes('paire'))return tr(', avec Paire et Brelan',', with Pair and Three of a kind');
  if(rows.includes('psuite'))return tr(', avec petite et grande suite',', with small and large straight');
  return'';
}
function montFormat(lv){
  if(lv.f==='fin')return tr(`Fin de partie, ${lv.turns} tours`,`Endgame, ${lv.turns} turns`);
  if(lv.f==='mini')return tr(`Mini-grille, ${lv.turns} tours`,`Mini grid, ${lv.turns} turns`);
  return tr(`Grille complète, ${lv.turns} tours`,`Full grid, ${lv.turns} turns`);
}
function montObjectif(lv){
  if(lv.f==='fin')return tr(`La grille est presque pleine, il reste ${lv.turns} tours. Les étoiles comptent les points que tu marques d'ici la fin.`,
    `The grid is almost full: ${lv.turns} turns left. Stars count the points you score from here.`);
  if(lv.f==='mini')return tr(`Colonne ${montNomCols(lv.cols)}, ${montNomLignes(lv.rows)} seulement.`,
    `${montNomCols(lv.cols)} column, ${montNomLignes(lv.rows)} only.`);
  return tr(`Colonnes ${montNomCols(lv.cols)}${montExtraLignes(lv.rows)}.`,`Columns: ${montNomCols(lv.cols)}${montExtraLignes(lv.rows)}.`);
}
// Règle à rappeler à la première rencontre d'une colonne ou d'une ligne
function montRegleNouvelle(n){
  const vus=new Set();
  for(const m of MONT_NOEUDS.slice(0,n.idx)){const c=m.kind==='boss'?m.boss:m.lv;c.cols.forEach(x=>vus.add(x));c.rows.forEach(x=>vus.add(x));}
  const c=n.kind==='boss'?n.boss:n.lv;
  const col=c.cols.find(x=>!vus.has(x)&&x!=='normal');
  if(col)return COL_INFO[col];
  if(c.rows.includes('paire')&&!vus.has('paire'))return ROW_INFO.paire||'';
  if(c.rows.includes('psuite')&&!vus.has('psuite'))return ROW_INFO.psuite||'';
  return'';
}

// ── Carte ──
function ouvrirMont(){
  montAppliquerDe();
  show('smy');montCarte(true);
}
function montCarte(anime){
  const d=montCharger(),carte=document.getElementById('my-map'),dedans=document.getElementById('my-in');
  const W=dedans.clientWidth||340,PAS=82,BANDEAU=170,BAS=150,HAUT=170;
  const nb=MONT_MONDES[0].levels.length+1,hMonde=BANDEAU+nb*PAS,H=HAUT+BAS+MONT_MONDES.length*hMonde;
  const cur=montCourant(d);
  dedans.style.height=H+'px';
  let h='',y=H-BAS;const pts=[];
  MONT_MONDES.forEach((w,wi)=>{
    const ferme=!montOuvert(d,MONT_NOEUDS.findIndex(n=>n.wi===wi)),y0=y,c=w.color;
    let deco='';
    [2,6].forEach(j=>{
      const g=wi*nb+j,sx=Math.sin(g*.9+.6),my=y0-BANDEAU-j*PAS-40;
      deco+=`<div class="my-decor" style="top:${my-(y0-hMonde-20)}px;${sx>0?'left:6px':'right:6px'};transform:rotate(${sx>0?-8:8}deg)">${montDecor(w.id,montAlpha(c,.9))}</div>`;
    });
    h+=`<div class="my-bande${ferme?' ferme':''}" style="top:${y0-hMonde-20}px;height:${hMonde+40}px;background:linear-gradient(to top,transparent,${montAlpha(c,.16)} 14%,${montAlpha(c,.09)} 70%,transparent)">${deco}</div>`;
    const prec=MONT_MONDES[wi-1],n0=MONT_NOEUDS.find(n=>n.wi===wi);
    h+=`<div class="my-banniere${ferme?' ferme':''}" style="top:${y0-138}px;--c:${c}"><div class="my-wn">${tr('Monde','World')} ${wi+1}, ${fmtAlt(n0.alt)}</div><div class="my-wt">${MT(w.name)}</div><div class="my-ws">${MT(w.sub)}</div>${ferme?`<div class="my-porte">${MONT_CADENAS}${tr('Bats','Beat')} ${MT(prec.boss.name)}</div>`:''}</div>`;
    y-=BANDEAU;
    for(let j=0;j<nb;j++){
      const g=wi*nb+j,x=j===nb-1?W/2:W/2+Math.sin(g*.9+.6)*W*.27;
      pts.push({x,y});y-=PAS;
    }
  });
  const chemin=p=>{let s=`M${p[0].x},${p[0].y}`;for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c2=p[i+1],e=p[i+2]||c2;
    s+=` C${b.x+(c2.x-a.x)/6},${b.y+(c2.y-a.y)/6} ${c2.x-(e.x-b.x)/6},${c2.y-(e.y-b.y)/6} ${c2.x},${c2.y}`;}return s;};
  const tout=chemin(pts),fait=cur>0?chemin(pts.slice(0,cur+1)):'';
  h+=`<svg class="my-route" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <path d="${tout}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="30" stroke-linecap="round"/>
    <path d="${tout}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="22" stroke-linecap="round"/>
    <path d="${tout}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="4" stroke-dasharray="1 13" stroke-linecap="round"/>
    ${fait?`<path d="${fait}" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="1 13" stroke-linecap="round"/>`:''}
  </svg>`;
  MONT_NOEUDS.forEach((n,i)=>{
    const p=pts[i],w=MONT_MONDES[n.wi],c=w.color,ouv=montOuvert(d,i),et=montEt(d,n);
    const vars=`--c:${c};--hi:${montOmbre(c,.45)};--lo:${montOmbre(c,-.45)}`;
    if(n.kind==='boss'){
      h+=`<button class="my-n boss${ouv?'':' ferme'}" style="left:${p.x-38}px;top:${p.y-38}px" onclick="montFiche(${i})" aria-label="${tr('Boss','Boss')} : ${MT(n.boss.name)}">${montVisage(n.boss.id,c,et?'perd':'ok',76)}</button>`;
      h+=`<div class="my-bnom${ouv?'':' ferme'}" style="left:${p.x}px;top:${p.y+42}px">${MT(n.boss.name)}</div>`;
      if(et)h+=`<div class="my-battu" style="left:${p.x}px;top:${p.y-62}px">${tr('Battu','Beaten')} ${'★'.repeat(et)}</div>`;
    }else{
      const courant=i===cur,t=courant?58:48;
      h+=`<button class="my-n${ouv?'':' ferme'}${courant?' courant':''}" style="left:${p.x-t/2}px;top:${p.y-t/2}px;${vars}" onclick="montFiche(${i})" aria-label="${tr('Niveau','Level')} ${n.num}${et?', '+et+' '+tr('étoiles','stars'):''}">${n.num}</button>`;
      if(et||(ouv&&!courant))h+=`<div class="my-nst" style="left:${p.x}px;top:${p.y+20}px">${[0,1,2].map(k=>montEtoileSvg(k<et)).join('')}</div>`;
    }
  });
  const cp=pts[cur];
  h+=`<div class="my-pion" style="left:${cp.x}px;top:${cp.y-(MONT_NOEUDS[cur].kind==='boss'?100:86)}px"><span>${escapeHtml((localStorage.getItem(PLAYER_NAME_KEY)||'').trim()||tr('Toi','You'))}</span>${montDeHTML(5,d.de,'pion')}</div>`;
  dedans.innerHTML=h;
  document.getElementById('my-etoiles').textContent=montTotalEtoiles(d);
  document.getElementById('my-etoiles-max').textContent='/'+MONT_NOEUDS.length*3;
  const alt=montAltitude(d);
  document.getElementById('my-alt').textContent=alt?fmtAlt(alt):tr('Au pied','At the foot');
  const cible=cp.y-carte.clientHeight*.58;
  if(anime&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    carte.scrollTop=cible+380;setTimeout(()=>carte.scrollTo({top:cible,behavior:'smooth'}),250);
  }else carte.scrollTop=cible;
}

// ── Fiche d'une étape ──
function montFiche(i){
  const d=montCharger(),n=MONT_NOEUDS[i],w=MONT_MONDES[n.wi],c=w.color,ouv=montOuvert(d,i),et=montEt(d,n);
  let h=`<div class="my-poignee"></div><div class="my-fe" style="--c:${c}">${tr('Monde','World')} ${n.wi+1}, ${MT(w.name)}, ${fmtAlt(n.alt)}</div>`;
  const prec=MONT_MONDES[n.wi-1];
  if(!ouv&&n.j===0&&prec){
    h+=`<div class="my-ft">${tr('Dans la brume','In the mist')}</div>
      <p class="my-fp">${tr('Ce monde t\'apprendra','This world teaches')} : ${MT(w.learn)}. ${tr('Bats','Beat')} ${MT(prec.boss.name)} ${tr('pour lever la brume.','to clear the mist.')}</p>
      <button class="my-sec" onclick="montFermerFiche()">${tr('Fermer','Close')}</button>`;
  }else if(n.kind==='boss'){
    const b=n.boss;
    h+=`<div class="my-fboss">${montVisage(b.id,c,'ok',72)}<div><div class="my-ft">${MT(b.name)}</div><div class="my-fr">${MT(b.role)}</div></div></div>
      <p class="my-cit">« ${MT(b.intro)} »</p>
      <p class="my-fp">${tr('Duel sur les mêmes dés, tour par tour.','Duel on the same dice, turn by turn.')} ${montObjectif({f:'grille',cols:b.cols,rows:b.rows})} ${tr('Sa moyenne','His average')} : ${b.avg}.</p>
      <div class="my-seuils">
        <div>${[1,0,0].map(montEtoileSvg).join('')}<span>${tr('Le battre','Beat him')}</span>${et>=1?`<em>${tr('obtenue','earned')}</em>`:''}</div>
        <div>${[1,1,0].map(montEtoileSvg).join('')}<span>${tr(`Avec ${b.marges[0]} points d'avance`,`By ${b.marges[0]} points`)}</span>${et>=2?`<em>${tr('obtenue','earned')}</em>`:''}</div>
        <div>${[1,1,1].map(montEtoileSvg).join('')}<span>${tr(`Avec ${b.marges[1]} points d'avance`,`By ${b.marges[1]} points`)}</span>${et>=3?`<em>${tr('obtenue','earned')}</em>`:''}</div>
      </div>
      <p class="my-fn">${tr('Récompense','Reward')} : ${montDeHTML(5,b.skin,'mini')} ${tr('le dé','the')} ${MT(b.skinName)}${EN?' dice':''}</p>
      ${ouv?`<button class="my-go" onclick="lancerMont(${i})">${et?tr('Revanche','Rematch'):tr('Affronter','Take him on')}</button>`
        :`<p class="my-fp">${tr('Termine les niveaux de ce monde pour l\'affronter.','Finish this world\'s levels to take him on.')}</p><button class="my-sec" onclick="montFermerFiche()">${tr('Fermer','Close')}</button>`}`;
  }else{
    const lv=n.lv,best=d.best[n.id],gain=lv.f==='fin',regle=montRegleNouvelle(n);
    h+=`<div class="my-ft">${MT(lv.name)}</div>
      <span class="my-fmt my-f-${lv.f}"><i></i>${montFormat(lv)}</span>
      <p class="my-fp">${montObjectif(lv)}</p>
      ${regle?`<p class="my-regle">${regle}</p>`:''}
      <div class="my-seuils">${lv.stars.map((s,k)=>`<div>${[0,1,2].map(m=>montEtoileSvg(m<=k)).join('')}<span>${gain?'+':''}${s} ${tr('points','points')}</span>${k<et?`<em>${tr('obtenue','earned')}</em>`:''}</div>`).join('')}</div>
      <p class="my-fn">${best!=null?tr(`Ton meilleur : ${gain?'+':''}${best}. `,`Your best: ${gain?'+':''}${best}. `):''}${lv.bot==null?'':tr(`Le bot fait ${gain?'+':''}${lv.bot} en moyenne.`,`The bot averages ${gain?'+':''}${lv.bot}.`)}</p>
      ${ouv?`<button class="my-go${i===montCourant(d)?' pulse':''}" onclick="lancerMont(${i})">${et?tr('Rejouer','Play again'):tr('Jouer','Play')}</button>`
        :`<p class="my-fp">${tr('Termine le niveau précédent pour débloquer celui-ci.','Finish the previous level to unlock this one.')}</p><button class="my-sec" onclick="montFermerFiche()">${tr('Fermer','Close')}</button>`}`;
  }
  const f=document.getElementById('my-fiche');
  f.innerHTML=h;f.classList.add('on');document.getElementById('my-scrim').classList.add('on');
  setTimeout(()=>f.querySelector('button')?.focus({preventScroll:true}),60);
}
function montFermerFiche(){
  document.getElementById('my-fiche')?.classList.remove('on');
  document.getElementById('my-scrim')?.classList.remove('on');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('my-fiche')?.classList.contains('on'))montFermerFiche();});
// Choix des dés gagnés contre les boss
function montDes(){
  const d=montCharger();
  let h=`<div class="my-poignee"></div><div class="my-ft">${tr('Tes dés','Your dice')}</div>
    <p class="my-fp">${tr('Chaque boss battu donne un dé, utilisable dans tous les modes.','Each boss you beat gives you a set of dice, for every game mode.')}</p><div class="my-collec">`;
  h+=`<button class="${!d.de?'on':''}" onclick="montChoisirDe(null)">${montDeHTML(5,null)}<span>${tr('Classique','Classic')}</span></button>`;
  MONT_MONDES.forEach(w=>{
    const a=d.des.includes(w.boss.skin);
    h+=a?`<button class="${d.de===w.boss.skin?'on':''}" onclick="montChoisirDe('${w.boss.skin}')">${montDeHTML(5,w.boss.skin)}<span>${MT(w.boss.skinName)}</span></button>`
      :`<button disabled>${montDeHTML(5,null,'cache')}<span>${MT(w.boss.name)}</span></button>`;
  });
  h+=`</div><button class="my-sec" onclick="montFermerFiche()">${tr('Fermer','Close')}</button>`;
  const f=document.getElementById('my-fiche');f.innerHTML=h;f.classList.add('on');document.getElementById('my-scrim').classList.add('on');
}
function montChoisirDe(s){const d=montCharger();d.de=s;montSauver(d);montAppliquerDe();montDes();montCarte(false);}

// ── Partie ──
let montCtx=null,montDuel=null;
const _montPoids={};
async function montChargerBoss(b){
  if(!_montPoids[b.id]){const r=await fetch('bots/'+b.id+'.json');if(!r.ok)throw new Error('poids');_montPoids[b.id]=await r.json();}
  return _montPoids[b.id];
}
function montNouveauDuel(b){
  const V=MontBot.variante(b.cfg),sc={};
  V.cols.forEach(c=>{sc[c]={};b.rows.forEach(r=>sc[c][r]=null);});
  return{boss:b,V,s:MontBot.etatVide(V),sc,bot:_montPoids[b.id]?new MontBot.Bot(V,_montPoids[b.id],b.noise):null,coup:null,bulle:null};
}
async function lancerMont(i){
  const n=MONT_NOEUDS[i],cfg=n.kind==='boss'?n.boss:n.lv;
  if(n.kind==='boss'){
    const go=document.querySelector('#my-fiche .my-go');if(go){go.disabled=true;go.textContent=tr('Il arrive…','Here he comes…');}
    try{await montChargerBoss(n.boss);}
    catch(e){if(go){go.disabled=false;go.textContent=tr('Connexion nécessaire, réessaie','Connection needed, try again');}return;}
  }
  montFermerFiche();
  feuilleMode=false;document.body.classList.remove('feuille');
  isDailyMode=false;seededRng=null;dailyTurnPool=[];dailyTurnIndex=0;
  mode='mont';undoState=null;updUndoBtn();coachOn=true;
  COLS=ORDRE_COLS.filter(c=>cfg.cols.includes(c));setRows([...cfg.rows]);
  gameStartTime=Date.now();clearSave();over=false;cur=0;
  gameEvents={boumbacar:false,yams_seche:false,seum_master:false};
  const name=localStorage.getItem(PLAYER_NAME_KEY)||NOM_DEFAUT;
  players=[{name,sc:mkSc(),isBot:false,lastMove:null}];
  if(n.lv&&n.lv.prefill){
    const sc2=players[0].sc;
    Object.entries(n.lv.prefill).forEach(([c,v])=>Object.entries(v).forEach(([r,x])=>{sc2[c][r]=x;}));
    // Bonus déjà acquis posé d'avance, pour ne pas déclencher son animation au départ
    COLS.forEach(c=>{if('123456'.split('').every(r=>sc2[c][r]!==null&&sc2[c][r]!==undefined))sc2[c].bonus=numTot(c,sc2)>=seuilBonus(c)?primeBonus(c):0;updAll(c,sc2);});
  }
  montCtx={i,id:n.id,depart:n.lv?.depart||0};
  montDuel=n.kind==='boss'?montNouveauDuel(n.boss):null;
  montAppliquerDe();
  trackEvent('game_start',null,1,name,null,'mont-'+n.id,COLS.length);
  buildTabs();show('sg');startTurn();
  if(montDuel)montBulle(MT(n.boss.intro),3600);
  else{const r=montRegleNouvelle(n);if(r)setTimeout(()=>showTip(r),500);}
}
// Sauvegarde : ce qu'il faut pour reprendre la partie après un rechargement
function montSauvegarde(){
  if(!montCtx)return null;
  return{...montCtx,duel:montDuel?{s:montDuel.s,sc:montDuel.sc,coup:montDuel.coup}:null};
}
function montRestaurer(s){
  const m=s.mont;if(!m||!MONT_NOEUDS[m.i]||MONT_NOEUDS[m.i].id!==m.id)return false;
  montCtx={i:m.i,id:m.id,depart:m.depart||0};
  const n=MONT_NOEUDS[m.i];
  if(n.kind==='boss'){
    montDuel=montNouveauDuel(n.boss);
    if(m.duel){montDuel.s=m.duel.s;montDuel.sc=m.duel.sc;montDuel.coup=m.duel.coup;}
    montChargerBoss(n.boss).then(()=>{if(montDuel&&!montDuel.bot)montDuel.bot=new MontBot.Bot(montDuel.V,_montPoids[n.boss.id],n.boss.noise);}).catch(()=>{});
  }else montDuel=null;
  montAppliquerDe();
  return true;
}
// Appelé par doNext() après chaque placement du joueur : le boss joue alors son tour
// sur la même réserve de dés. Renvoie vrai si la suite est différée (poids en chargement).
function montAvantSuite(){
  if(!montDuel||mode!=='mont')return false;
  const sc2=players[0].sc;
  const faits=COLS.reduce((a,c)=>a+ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&sc2[c][r]!==null).length,0);
  if(montDuel.s.turn>=faits)return false;
  if(!montDuel.bot){
    montChargerBoss(montDuel.boss).then(()=>{montDuel.bot=new MontBot.Bot(montDuel.V,_montPoids[montDuel.boss.id],montDuel.boss.noise);doNext();})
      .catch(()=>montBulle(tr('Connexion perdue, le boss attend…','Connection lost, the boss is waiting…'),4000));
    return true;
  }
  const reserve=dailyTurnPool.map(v=>Math.floor(v*6)+1);
  const t=MontBot.jouerTour(montDuel.bot,montDuel.s,reserve);
  const b=montDuel.sc[t.col];b[t.row]=t.pts;
  if('123456'.split('').every(r=>b[r]!==null)){const s=+'123456'.split('').reduce((a,r)=>a+(b[r]||0),0);b.bonus=s>=seuilBonus(t.col)?primeBonus(t.col):0;}
  if(b.plus!==undefined&&b.plus!==null&&b.minus!==null&&b.minus!==undefined)b.diff=b.plus-b.minus;
  montDuel.coup=t;
  montReplique(t);
  return false;
}
// Réserve des 15 dés du tour (lancers 1 à 3) : tirée au hasard en duel, préparée pour le
// tout premier niveau, aucune ailleurs (dés ordinaires).
function montReserve(){
  if(mode!=='mont'||!montCtx)return null;
  if(montDuel)return Array.from({length:15},()=>Math.random());
  const lv=MONT_NOEUDS[montCtx.i].lv;if(!lv||!lv.des)return null;
  const sc2=players[0].sc,restants=COLS.reduce((a,c)=>a+ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&sc2[c][r]===null).length,0);
  const t=lv.des[Math.min(lv.des.length-1,lv.turns-restants)];
  return t.map(f=>(f-1)/6+.01);
}
function montTotBoss(){return montDuel?MontBot.total(montDuel.V,montDuel.s):0;}
function montReplique(t){
  const B=montDuel.boss,ecart=montTotBoss()-grandTot(players[0].sc),pick=a=>a[Math.floor(Math.random()*a.length)];
  if(t.row==='yams'&&t.pts>0)return montBulle(MT(B.yams),2800);
  // Une réplique environ tous les quatre tours, et à chaque changement de meneur
  const meneur=ecart>0?'b':ecart<0?'j':montDuel.meneur;
  const change=meneur!==montDuel.meneur;montDuel.meneur=meneur;
  if((change&&montDuel.s.turn>2)||Math.random()<.22)montBulle(MT(pick(ecart>0?B.ahead:B.behind)),2800);
}
function montBulle(txt,ms){
  const el=document.getElementById('my-bulle');if(!el)return;
  el.textContent=txt;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),ms||2800);
}
function montLibelleCoup(t){
  const fig='123456'.includes(t.row)?RLBL[t.row]:t.row==='plus'||t.row==='minus'?tr('la case ','the ')+RLBL[t.row]+(EN?' box':''):nomFig(t.row);
  const col=CNAME[t.col];
  if(t.barre&&t.row!=='minus')return tr(`barre ${fig} en ${col}`,`scratches ${fig} in ${col}`);
  return tr(`${fig} en ${col}${t.ann?' (annoncé)':''}`,`${fig} in ${col}${t.ann?' (called)':''}`);
}
// Bandeau sous l'en-tête : jauge d'étoiles, ou duel contre le boss
function majBandeMont(){
  const el=document.getElementById('my-band');if(!el)return;
  if(mode!=='mont'||!montCtx){el.hidden=true;return;}
  el.hidden=false;
  const n=MONT_NOEUDS[montCtx.i],w=MONT_MONDES[n.wi],tot=grandTot(players[0].sc);
  if(montDuel){
    const B=montDuel.boss,tb=montTotBoss(),ecart=tot-tb,k=Math.max(6,Math.min(94,50+ecart*45/Math.max(60,B.avg*.25)));
    const humeur=ecart>B.marges[0]?'perd':ecart<-B.marges[0]?'gagne':'ok';
    const c=montDuel.coup;
    // Le joueur est en vert : un boss du même vert prend le rouge
    el.innerHTML=`<div class="my-duel" style="--bc:${w.color==='#27c47e'?'#f05555':w.color}">
      <div class="my-dj"><b>${tot}</b><span>${escapeHtml(players[0].name)}</span></div>
      <div class="my-corde" style="--k:${k}%"><i style="left:${k}%">${ecart>0?'+':''}${ecart}</i></div>
      <button class="my-db" onclick="montGrilleBoss()" aria-label="${tr('Voir la grille de','See the grid of')} ${MT(B.name)}"><span><b>${tb}</b><span>${MT(B.name)}</span></span>${montVisage(B.id,w.color,humeur,30)}</button>
    </div>
    <div class="my-coup">${c?`<b>${MT(B.name)}</b> ${montLibelleCoup(c)}<em>${c.pts>0||c.row==='minus'?(c.row==='minus'?'−':'+')+c.pts:'0'}</em>`:tr(`${MT(B.name)} joue avec les mêmes dés que toi, juste après toi.`,`${MT(B.name)} plays the same dice as you, right after you.`)}</div>`;
    return;
  }
  const lv=n.lv,v=tot-montCtx.depart,max=lv.stars[2]*1.12,pos=x=>Math.max(0,Math.min(100,x/max*100));
  const prochain=lv.stars.find(s=>v<s);
  el.innerHTML=`<div class="my-jauge">
    <div class="my-jv"><b>${lv.f==='fin'?(v>=0?'+':'')+v:v}</b><span>${MT(lv.name)}</span></div>
    <div class="my-barre"><i style="width:${pos(v)}%"></i>${lv.stars.map((s,k)=>`<span class="my-cran${v>=s?' on':''}" style="left:${pos(s)}%">${montEtoileSvg(1)}</span>`).join('')}</div>
    <div class="my-jp">${prochain!=null?`${lv.f==='fin'?'+':''}${prochain}`:'★★★'}</div>
  </div>`;
  // Une étoile qui tombe en cours de partie se fête tout de suite
  const n2=lv.stars.filter(s=>v>=s).length;
  if(n2>(montCtx.vu||0)){montCtx.vu=n2;if(montCtx.lance)montCarillon(n2-1);}
  montCtx.lance=true;
}
function montGrilleBoss(){
  if(!montDuel)return;
  document.getElementById('mg-name').textContent=MT(montDuel.boss.name);
  document.getElementById('mg-meta').textContent=montTotBoss()+' pts';
  document.getElementById('mg-tbl').innerHTML=renderGridHTML(montDuel.sc);
  document.getElementById('mg').classList.add('on');
}
function montCarillon(k){
  try{aEn();const t=AC.currentTime;
    [1,1.5,2].forEach((m,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=i?'sine':'triangle';o.frequency.value=660*Math.pow(1.26,k)*m;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.2/(i+1),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+1.1);
      o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+1.2);});
  }catch(e){}
}
function quitterMont(){
  over=true;clearSave();montDuel=null;montCtx=null;
  ouvrirMont();
}

// ── Fin de niveau ──
function finMont(){
  const n=MONT_NOEUDS[montCtx.i],w=MONT_MONDES[n.wi],d=montCharger(),h=players[0],tot=grandTot(h.sc);
  const avant=montEt(d,n),etaitBattu=n.kind==='boss'&&avant>0;
  let et,score,html='';
  if(n.kind==='boss'){
    const B=n.boss,tb=montTotBoss(),ecart=tot-tb;
    et=ecart>0?1+(ecart>=B.marges[0])+(ecart>=B.marges[1]):0;score=tot;
    const prochain=et===0?null:et<3?B.marges[et-1]-ecart:null;
    html=`<div class="mf-eb">${tr('Monde','World')} ${n.wi+1}, ${tr('boss','boss')}, ${fmtAlt(n.alt)}</div>
      <div class="mf-t">${et?tr('Victoire !','Victory!'):tr('Pas cette fois','Not this time')}</div>
      ${montEtoilesFin(et)}
      <div class="mf-sc"><b id="mf-v">0</b><small>${tr('contre','against')} ${tb} ${tr('pour','for')} ${MT(B.name)}</small></div>
      ${prochain!=null?`<div class="mf-presque">${montEtoileSvg(1)}${tr(`${et+1}e étoile à ${prochain} points`,`Star ${et+1} was ${prochain} points away`)}</div>`:''}
      <div class="mf-cit">${montVisage(B.id,w.color,et?'perd':'gagne',46)}<span>« ${MT(et?B.lose:B.win)} »</span></div>`;
  }else{
    const lv=n.lv;score=tot-montCtx.depart;et=lv.stars.filter(s=>score>=s).length;
    const prochain=lv.stars.find(s=>score<s);
    html=`<div class="mf-eb">${MT(w.name)}, ${tr('niveau','level')} ${n.num}, ${fmtAlt(n.alt)}</div>
      <div class="mf-t">${et?MT(lv.name):score>=lv.stars[0]*.8?tr('Presque !','So close!'):tr('Pas cette fois','Not this time')}</div>
      ${montEtoilesFin(et)}
      <div class="mf-sc"><b id="mf-v">0</b><small>${lv.f==='fin'?tr(`points en ${lv.turns} tours`,`points in ${lv.turns} turns`):tr('points','points')}</small></div>
      ${prochain!=null?`<div class="mf-presque">${montEtoileSvg(1)}${tr(`${et+1}${et?'e':'re'} étoile à ${prochain-score} point${prochain-score>1?'s':''}`,`Star ${et+1} was ${prochain-score} point${prochain-score>1?'s':''} away`)}</div>`:''}`;
  }
  d.etoiles[n.id]=Math.max(avant,et);
  if(d.best[n.id]==null||score>d.best[n.id])d.best[n.id]=score;
  let nouveauDe=null,mondeOuvert=null;
  if(n.kind==='boss'&&et>0&&!d.des.includes(n.boss.skin)){d.des.push(n.boss.skin);d.de=n.boss.skin;nouveauDe=n.boss.skin;}
  if(n.kind==='boss'&&et>0&&!etaitBattu&&MONT_MONDES[n.wi+1])mondeOuvert=MONT_MONDES[n.wi+1];
  montSauver(d);montAppliquerDe();
  if(nouveauDe)html+=`<div class="mf-recomp">${montDeHTML(5,nouveauDe,'tourne')}<div><b>${tr('Nouveau dé','New dice')} : ${MT(n.boss.skinName)}</b><span>${tr('Il remplace tes dés dans tous les modes. Change-le depuis la carte.','It replaces your dice in every mode. Change it from the map.')}</span></div></div>`;
  if(n.kind==='boss'&&et>0)html+=`<p class="mf-ouvre">${mondeOuvert?tr(`Nouveau monde ouvert : ${MT(mondeOuvert.name)}.`,`New world unlocked: ${MT(mondeOuvert.name)}.`):''}${!MONT_MONDES[n.wi+1]?tr(' Tu as gravi le Mont Yams.',' You have climbed Mount Yams.'):''}</p>`;
  const suivant=MONT_NOEUDS[montCtx.i+1];
  const peutSuivre=et>0&&suivant;
  html+=`<div class="mf-btns">
    ${peutSuivre?`<button class="my-go pulse" onclick="montSuivant()">${suivant.kind==='boss'?tr('Affronter le boss','Face the boss'):n.kind==='boss'?tr('Monde suivant','Next world'):tr('Niveau suivant','Next level')}</button>`:''}
    <button class="${peutSuivre?'my-sec':'my-go'}" onclick="lancerMont(${montCtx.i})">${tr('Réessayer','Try again')}</button>
    <button class="my-sec" onclick="ouvrirMont()">${tr('Carte','Map')}</button></div>`;
  document.getElementById('mf-in').innerHTML=(et?`<div class="mf-rayons"></div>`:'')+html;
  show('smf');
  const el=document.getElementById('mf-v'),cible=n.kind!=='boss'&&n.lv.f==='fin'?score:score,t0=performance.now();
  const pre=n.kind!=='boss'&&n.lv.f==='fin'&&score>=0?'+':'';
  const f=t=>{const p=Math.min(1,(t-t0)/900);el.textContent=pre+Math.round(cible*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f);};requestAnimationFrame(f);
  document.querySelectorAll('#mf-in .mf-et').forEach((s,k)=>{if(k<et)setTimeout(()=>{s.classList.add('on');montCarillon(k);},600+k*420);});
  if(et){try{aEn();}catch(e){}setTimeout(()=>spawnFx(n.kind==='boss'?'pcboss':'pcwin',window.innerWidth/2,window.innerHeight*.3),600+et*420);}
  trackEvent('game_end',null,1,h.name,tot,'mont-'+n.id,COLS.length);
  if(et>0)fetch(`${SB_URL}/parcours_scores`,{method:'POST',headers:{...SB_HDR,'Prefer':'return=minimal'},
    body:JSON.stringify({level_id:'mont-'+n.id,pseudo:localStorage.getItem(PLAYER_NAME_KEY)||NOM_DEFAUT,score})}).catch(()=>{});
}
function montEtoilesFin(et){
  return`<div class="mf-ets" aria-label="${et} ${tr('étoiles sur 3','stars out of 3')}">${[0,1,2].map(k=>`<span class="mf-et"><svg viewBox="0 0 24 24" class="v">${MONT_ETOILE}</svg><svg viewBox="0 0 24 24" class="p">${MONT_ETOILE}</svg></span>`).join('')}</div>`;
}
function montSuivant(){
  const i=montCtx.i+1;
  if(MONT_NOEUDS[i].kind==='boss'||MONT_NOEUDS[i].j===0){ouvrirMont();setTimeout(()=>montFiche(i),700);}
  else lancerMont(i);
}

// ── Accueil ──
function majAccueilMont(){
  const el=document.getElementById('my-prog');if(!el)return;
  const d=montCharger(),alt=montAltitude(d),et=montTotalEtoiles(d);
  el.textContent=et?tr(`Tu es à ${fmtAlt(alt)}, ${et} étoile${et>1?'s':''}.`,`You are at ${fmtAlt(alt)}, ${et} star${et>1?'s':''}.`)
    :tr('8 mondes, 64 niveaux et 8 boss, du Village au Sommet.','8 worlds, 64 levels and 8 bosses, from the Village to the Summit.');
}
