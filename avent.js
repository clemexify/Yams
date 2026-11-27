// ══ CALENDRIER DE L'AVENT ════════════════════════════════
// Lot 1 (préparé le 2026-11-23) : écran du calendrier, entrée de menu avec étoile
// scintillante, adresses /avent/N. Les cases s'ouvrent selon le jour à Paris, lu sur
// l'horloge du serveur, jamais sur celle du téléphone. Lot 2 : en décembre, le Défi du
// jour est la partie inédite de la case (avent-regles.js, chargé avant app.js), et le
// finir débloque le mini-jeu de la case.
// Chargé après app.js : se sert de tr(), show(), jourDuDefi(), escapeHtml().
// Hors production : ?jour=2026-12-05 simule la date, ?avent=7 simule l'adresse /avent/7.

const AVENT_DEBUT='2026-12-01';
const AVENT_FIN='2026-12-31';     // dernier jour où les cases restent jouables
const AVENT_VISIBLE='2026-11-23'; // l'entrée de menu et le compte à rebours apparaissent
const AVENT_RETRAIT='2027-01-06'; // le calendrier disparaît du menu
const AVENT_KEY='yams_avent';
const AVENT_NB=24;                // 24 cases, du 1er au 24 décembre (plus de case bonus le 25)

const aventProd=/(^|\.)monyams\.app$/.test(location.hostname);
// Ordre des portes sur la grille : mélangé une fois pour toutes, comme un vrai calendrier
const AVENT_ORDRE=[7,15,2,21,11,4,18,9,23,1,13,6,20,16,3,10,24,8,14,19,5,22,12,17];

function aventEtat(){
  try{return JSON.parse(localStorage.getItem(AVENT_KEY))||{};}catch(e){return{};}
}
function aventSauver(s){try{localStorage.setItem(AVENT_KEY,JSON.stringify(s));}catch(e){}}

// ── Jour à Paris, d'après le serveur ──────────────────────
// En-tête Date d'une requête sur notre propre domaine (le service worker ne la met pas
// en cache grâce au paramètre unique), puis conversion en date de Paris. Hors ligne ou
// en cas d'échec : l'horloge du téléphone, faute de mieux. Au lot 2, advent_today()
// côté Supabase devient la référence pour l'enregistrement des scores.
const AVENT_FMT=new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'});
let aventJour=AVENT_FMT.format(new Date());
let aventJourSource='appareil';
async function aventLireJour(){
  if(!aventProd){
    const j=new URLSearchParams(location.search).get('jour');
    if(j&&/^\d{4}-\d{2}-\d{2}$/.test(j)){aventJour=j;aventJourSource='simulé';return aventJour;}
  }
  try{
    const r=await fetch('/manifest.json?heure='+Date.now(),{method:'HEAD',cache:'no-store'});
    const d=r.headers.get('date');
    if(d){aventJour=AVENT_FMT.format(new Date(d));aventJourSource='serveur';}
  }catch(e){}
  return aventJour;
}

const aventDate=n=>`2026-12-${String(n).padStart(2,'0')}`;
const aventVisible=()=>aventJour>=AVENT_VISIBLE&&aventJour<=AVENT_RETRAIT;
const aventOuvert=()=>aventJour>=AVENT_DEBUT;
const aventCaseOuverte=n=>aventDate(n)<=aventJour;
function aventCaseDuJour(){
  if(aventJour<AVENT_DEBUT||aventJour>aventDate(AVENT_NB))return null;
  return +aventJour.slice(8);
}
function aventJoursAvant(){
  return Math.max(0,Math.round((Date.parse(AVENT_DEBUT+'T00:00:00Z')-Date.parse(aventJour+'T00:00:00Z'))/864e5));
}

// ── Nouveauté signalée sur le bouton menu ─────────────────
// Avant le 1er décembre : tant que le calendrier n'a jamais été ouvert.
// Ensuite : tant que la case du jour n'a pas été vue.
function aventNouveau(){
  if(!aventVisible())return false;
  const s=aventEtat();
  if(!aventOuvert())return!s.vu;
  const n=aventCaseDuJour();
  return n?s.vu!==aventJour:false;
}
function aventMajNouveau(){
  const v=aventNouveau();
  // l'étoile du bouton menu reste allumée pendant toute la période du calendrier, pour donner envie
  // d'ouvrir le menu (demande de Clément) ; celle de l'entrée signale seulement la nouveauté
  document.getElementById('ss-menu-btn')?.classList.toggle('nouveau',aventVisible());
  const a=document.getElementById('ml-avent');
  if(a){a.hidden=!aventVisible();a.classList.toggle('nouveau',v);}
}

// ── Écran du calendrier ───────────────────────────────────
function aventTitreDate(n){
  const d=new Date(aventDate(n)+'T12:00:00').toLocaleDateString(LOCALE,{weekday:'long',day:'numeric',month:'long'});
  return EN?d:d.replace(/ 1 /,' 1er '); // « mardi 1er décembre »
}
function aventSousTitre(){
  if(!aventOuvert()){
    const j=aventJoursAvant();
    return j<=1
      ?tr('Première case demain, mardi 1er décembre.','First door opens tomorrow, Tuesday, December 1.')
      :tr(`Première case le mardi 1er décembre, dans ${j} jours.`,`First door opens on Tuesday, December 1, in ${j} days.`);
  }
  const n=aventCaseDuJour();
  if(n)return tr(`Case ${n} ouverte aujourd'hui.`,`Door ${n} is open today.`);
  return aventJour<=AVENT_FIN
    ?tr('Toutes les cases restent jouables jusqu\'au 31 décembre.','Every door stays playable until December 31.')
    :tr('Le calendrier est terminé. Merci d\'avoir joué !','The calendar is over. Thanks for playing!');
}
function aventPorte(n){
  const s=aventEtat(),c=(s.cases||{})[n]||{};
  const ouverte=aventCaseOuverte(n),jour=aventCaseDuJour()===n,faite=!!c.jeu;
  const cls='av-porte'+(ouverte?' ouverte':'')+(jour?' jour':'')+(faite?' faite':'');
  const etiq=ouverte
    ?(faite?tr(`Case ${n}, terminée`,`Door ${n}, done`):tr(`Case ${n}, ouverte`,`Door ${n}, open`))
    :tr(`Case ${n}, ouvre le ${aventTitreDate(n)}`,`Door ${n}, opens on ${aventTitreDate(n)}`);
  return`<button type="button" class="${cls}" onclick="aventToucher(${n},this)" aria-label="${etiq}">`+
    `<span class="av-num">${n}</span>`+
    (faite?'<span class="av-ok" aria-hidden="true">✓</span>':'')+
    `</button>`;
}
function aventRendre(){
  const g=document.getElementById('av-grille');if(!g)return;
  g.innerHTML=AVENT_ORDRE.map(aventPorte).join('');
  document.getElementById('av-sous').textContent=aventSousTitre();
  const s=aventEtat(),faites=Object.values(s.cases||{}).filter(c=>c.jeu).length;
  document.getElementById('av-compte').textContent=`${faites}/24`;
}
// Suivi pour la page de pilotage : table grille_events (sans contrainte), le numéro de case
// dans nb_cols. Types : avent_ouvert, avent_fiche, avent_jeu, avent_surprise.
function aventSuivi(type,n){try{if(typeof suiviGrille==='function')suiviGrille(type,{cols:n||null});}catch(e){}}
function ouvrirAvent(n){
  aventSuivi('avent_ouvert',n);
  document.getElementById('smr')?.classList.remove('on'); // règles de première visite
  show('sav');
  aventRendre();
  const s=aventEtat();s.vu=aventJour;aventSauver(s);
  aventMajNouveau();
  if(n)aventToucher(n,document.querySelector(`.av-porte[onclick^="aventToucher(${n},"]`));
}
function aventToucher(n,el){
  if(!aventCaseOuverte(n)){
    if(el){el.classList.remove('secoue');void el.offsetWidth;el.classList.add('secoue');}
    aventMessage(tr(`Patience : la case ${n} ouvre le ${aventTitreDate(n)}.`,`Patience: door ${n} opens on ${aventTitreDate(n)}.`));
    return;
  }
  if(!AVENT_CASES[n]){aventMessage(tr(`Case ${n} : bientôt jouable.`,`Door ${n}: coming soon.`));return;}
  aventFiche(n);
}
function aventMessage(t){
  const m=document.getElementById('av-msg');if(!m)return;
  m.textContent=t;m.classList.add('on');
  clearTimeout(m._t);m._t=setTimeout(()=>m.classList.remove('on'),2600);
}

// ══ LOT 2 : LES CASES ═════════════════════════════════════
// En décembre, le Défi du jour EST la partie inédite de la case : sa variante, ses règles
// et leur branchement sur le moteur sont dans avent-regles.js, chargé avant app.js.
// Finir le Défi du jour débloque le mini-jeu de la case, rejouable à volonté.
// Jour manqué (décision de Clément le 2026-11-23) : le Défi de ce jour n'est plus
// jouable, mais le mini-jeu de la case s'ouvre librement.
// Hors production, ?avent_libre=1 ouvre aussi le mini-jeu du jour sans jouer le Défi.
const aventLibre=!aventProd&&new URLSearchParams(location.search).get('avent_libre')==='1';

function aventPseudo(){return localStorage.getItem(PLAYER_NAME_KEY)||localStorage.getItem(DAILY_PSEUDO_KEY)||NOM_DEFAUT;}
function aventDefiDuJourFait(){
  const dj=loadDailyState();
  return!!(dj&&dj.date===getDailyDateStr()&&dj.played);
}
// Mini-jeu ouvert : Défi de la case joué, ou jour passé, ou Défi du jour fini aujourd'hui
function aventJeuOuvert(n){
  const c=(aventEtat().cases||{})[n]||{};
  return!!c.defi||aventLibre||aventCaseDuJour()!==n||aventDefiDuJourFait();
}
async function aventRpc(fn,args){
  const r=await fetch(`${SB_URL}/rpc/${fn}`,{method:'POST',headers:SB_HDR,body:JSON.stringify(args)});
  if(!r.ok)throw new Error(await r.text());
  const t=await r.text();return t?JSON.parse(t):null;
}
function aventJouerDefi(){aventFermerFiche();setMode('daily');launchDaily();}

// ── Fiche d'une case ──
function aventNomJeu(cfg){return cfg.jeu?AT(cfg.jeu.nom):AT(cfg.jeuAVenir||'');}
function aventColsTexte(cfg){
  const k=ORDRE_COLS.filter(x=>cfg.cols.includes(x));
  return k.map(x=>CLBL[x]).join(' ')+', '+tr(`${k.length} colonne${k.length>1?'s':''}`,`${k.length} column${k.length>1?'s':''}`);
}
// La partie de Yams de la case est le Défi du jour (écran d'accueil) : la fiche ne
// propose que le mini-jeu, avec un renvoi vers le Défi tant qu'il le verrouille.
function aventFiche(n){
  const cfg=AVENT_CASES[n];if(!cfg)return;
  aventSuivi('avent_fiche',n);
  const c=(aventEtat().cases||{})[n]||{},nom=aventNomJeu(cfg);
  let corps;
  if(!cfg.jeu)corps=`<p class="av-f-p">${tr(`${nom} arrive bientôt.`,`${nom} is coming soon.`)}</p>`;
  else if(!aventJeuOuvert(n))corps=`<p class="av-f-p av-f-lock">${tr(`Termine le Défi du jour pour débloquer ${nom}.`,`Finish the Daily Challenge to unlock ${nom}.`)}</p>
    <button class="av-f-go" onclick="aventJouerDefi()">${tr('Jouer le Défi du jour','Play the Daily Challenge')}</button>`;
  else corps=`<button class="av-f-go${c.jeu?'':' pulse'}" onclick="aventJouerJeu(${n})">${tr('Jouer','Play')}</button>
    <p class="av-f-p">${c.jeu?`${tr('Ton record :','Your best:')} <b>${c.jeu.best}</b>`:tr('Rejouable à volonté.','Play as often as you like.')}</p>`;
  document.getElementById('av-fiche').innerHTML=`
    <button type="button" class="mbox-x" onclick="aventFermerFiche()" aria-label="${tr('Fermer','Close')}">✕</button>
    <div class="av-f-kick">${tr('Case','Door')} ${n}, ${aventTitreDate(n)}</div>
    <h2 class="av-f-titre" id="av-f-titre">${nom}</h2>
    ${corps}
    <div class="av-f-board" id="av-f-board"></div>
    ${c.jeu?`<button class="av-f-share" onclick="aventPartager(${n})">${tr('Partager la case','Share this door')}</button>`:''}`;
  const m=document.getElementById('mav');
  if(!m.classList.contains('on')){_focusAvantModale=document.activeElement;m.classList.add('on');}
  aventClassement(n);
}
function aventFermerFiche(){const m=document.getElementById('mav');if(m?.classList.contains('on'))fermerModale(m);}
async function aventClassement(n){
  const el=document.getElementById('av-f-board');if(!el)return;
  const cfg=AVENT_CASES[n];
  if(!cfg.jeu||!aventJeuOuvert(n)){el.innerHTML='';return;}
  const liste=(rows,moi)=>rows&&rows.length?rows.slice(0,5).map((r,i)=>`<li${r.pseudo.toLowerCase()===moi?' class="moi"':''}><span>${i+1}</span>${escapeHtml(r.pseudo)}<b>${r.score}</b></li>`).join(''):`<li class="vide">${tr('Personne pour l\'instant','Nobody yet')}</li>`;
  try{
    const j=await aventRpc('advent_board',{p_num:n,p_kind:'jeu',p_limit:5});
    el.innerHTML=`<div class="av-f-bt">${tr('Classement','Leaderboard')}</div><div class="av-f-cols"><div><ol>${liste(j,aventPseudo().toLowerCase())}</ol></div></div>`;
  }catch(e){el.innerHTML='';}
}
function aventPartager(n){
  const cfg=AVENT_CASES[n],c=(aventEtat().cases||{})[n]||{};
  const url='https://monyams.app/avent/'+n;
  const nom=aventNomJeu(cfg);
  const txt=tr(`🎄 Case ${n} du calendrier de l'avent de Mon Yams : ${nom}.`,`🎄 Door ${n} of the Mon Yams advent calendar: ${nom}.`)
    +(c.jeu?tr(` Mon record : ${c.jeu.best}, à toi !`,` My best: ${c.jeu.best}, your turn!`):'');
  if(navigator.share){navigator.share({text:txt,url}).catch(()=>{});return;}
  navigator.clipboard?.writeText(txt+'\n'+url).then(()=>aventMessage(tr('Lien copié.','Link copied.'))).catch(()=>{});
}

// ── Mini-jeu, dans une iframe par-dessus le calendrier ──
// À augmenter à chaque modification des jeux, sinon le navigateur garde l'ancienne version
const AVENT_JEUX_V=22;
let aventJeuN=null,aventJeuRun=null,aventAttente=null;
function aventJouerJeu(n){
  const cfg=AVENT_CASES[n],c=(aventEtat().cases||{})[n]||{};
  if(!cfg?.jeu||!aventJeuOuvert(n))return;
  aventSuivi('avent_jeu',n);
  aventFermerFiche();
  aventJeuN=n;aventJeuRun=null;aventAttente=null;
  const w=document.getElementById('av-jeu'),f=document.getElementById('av-jeu-if');
  f.title=aventNomJeu(cfg);
  f.src=`advent-games/${cfg.jeu.f}.html?case=${n}&lang=${EN?'en':'fr'}&v=${AVENT_JEUX_V}`;
  w.hidden=false;document.body.classList.add('av-jeu-on');
}
function aventFermerJeu(){
  aventSolder();
  const w=document.getElementById('av-jeu'),f=document.getElementById('av-jeu-if');
  w.hidden=true;f.src='about:blank';document.body.classList.remove('av-jeu-on');
  const n=aventJeuN;aventJeuN=null;aventJeuRun=null;
  aventRendre();if(n)aventFiche(n);
}
// ── Publication du score d'un mini-jeu ──
// Toute partie est publiée, sans condition ; le classement retient le meilleur score de chaque
// prénom. Sans prénom connu, l'écran de fin du jeu le demande : la partie reste en attente
// jusqu'à la publication, ou jusqu'à la partie suivante et la fermeture du jeu (enregistrée
// alors sans prénom, pour les statistiques).
const aventPrenom=()=>{const p=localStorage.getItem(PLAYER_NAME_KEY)||localStorage.getItem(DAILY_PSEUDO_KEY)||'';return p&&!estNomDefaut(p)?p:'';};
async function aventEnvoyer(a,pseudo){
  if(!a.run&&a.runP)a.run=await a.runP.catch(()=>null);
  if(!a.run)return;
  // le numéro de case reste la référence ; le jeu et sa version distinguent un jeu remplacé
  const args={p_run:a.run,p_score:a.score,p_rang:a.rang,p_meta:{jeu:AVENT_CASES[a.n]?.jeu?.f||null,v:AVENT_JEUX_V}};
  // sans la nouvelle fonction en base (paramètre p_pseudo), on renvoie le score sans le prénom
  return aventRpc('advent_finish',{...args,p_pseudo:pseudo||null}).catch(()=>aventRpc('advent_finish',args)).catch(()=>{});
}
function aventSolder(){const a=aventAttente;aventAttente=null;if(a&&!a.publie)aventEnvoyer(a,null);}
function aventVersJeu(m){const f=document.getElementById('av-jeu-if');try{f?.contentWindow?.postMessage(m,location.origin);}catch(e){}}
async function aventPublier(a,pseudo){
  a.publie=true;
  await aventEnvoyer(a,pseudo);
  // classement de la case : meilleur score par prénom, avec le nôtre même si l'écriture traîne
  let rows=[];try{rows=await aventRpc('advent_board',{p_num:a.n,p_kind:'jeu',p_limit:500})||[];}catch(e){}
  const moi=pseudo.toLowerCase(),best=Math.max(a.score,(aventEtat().cases||{})[a.n]?.jeu?.best||0);
  rows=rows.filter(r=>r.pseudo.toLowerCase()!==moi);
  rows.push({pseudo,score:Math.max(best,...(rows.filter(r=>r.pseudo.toLowerCase()===moi).map(r=>r.score)))});
  rows.sort((x,y)=>y.score-x.score);
  const rang=rows.findIndex(r=>r.pseudo.toLowerCase()===moi)+1;
  aventVersJeu({type:'avent-pub',etat:'ok',pseudo,rang,total:rows.length,top:rows.slice(0,3).map(r=>({pseudo:r.pseudo,score:r.score}))});
}
window.addEventListener('message',e=>{
  const f=document.getElementById('av-jeu-if');
  if(!f||e.source!==f.contentWindow||!aventJeuN||!e.data)return;
  const n=aventJeuN;
  if(e.data.type==='avent-debut'){
    aventSolder();aventJeuRun=null;
    // la partie est créée tout de suite ; son identifiant est attendu au moment d'envoyer le score
    aventJeuRun=aventRpc('advent_start',{p_pseudo:aventPrenom()||NOM_DEFAUT,p_num:n,p_kind:'jeu'}).catch(()=>null);
  }else if(e.data.type==='avent-score'){
    const sc=+e.data.score||0,s=aventEtat();s.cases=s.cases||{};const c=s.cases[n]=s.cases[n]||{};
    c.jeu={best:Math.max(c.jeu?.best||0,sc),parties:(c.jeu?.parties||0)+1};aventSauver(s);
    aventAttente={n,run:null,runP:aventJeuRun,score:sc,rang:e.data.rang??null,publie:false};aventJeuRun=null;
    const p=aventPrenom();
    if(p)aventPublier(aventAttente,p);else aventVersJeu({type:'avent-pub',etat:'nom'});
  }else if(e.data.type==='avent-publier'){
    const p=String(e.data.pseudo||'').trim().slice(0,20);
    if(!p||estNomDefaut(p)||!aventAttente||aventAttente.publie)return;
    try{localStorage.setItem(PLAYER_NAME_KEY,p);}catch(x){}
    aventPublier(aventAttente,p);
  }
});

// ── Fin du Défi du jour : en décembre, c'était la partie de la case ──
// Appelée par endGame() juste après l'enregistrement du Défi (saveDailyState).
// La case se lit sur la date du Défi, pas sur aventJour : c'est cette partie-là qui compte.
function aventApresDefiDuJour(){
  const el=document.getElementById('se-avent');
  // toute case du jour, avec ou sans variante du Défi
  const mj=/^2026-12-(\d\d)$/.exec(getDailyDateStr()),n=mj&&AVENT_CASES[+mj[1]]?+mj[1]:null,dj=loadDailyState();
  aventCtx=null;
  if(!n||!dj?.played){if(el)el.innerHTML='';return;}
  const s=aventEtat();s.cases=s.cases||{};const c=s.cases[n]=s.cases[n]||{};
  const neuf=!c.defi;
  if(!c.defi){c.defi={score:dj.score,jour:dj.date};aventSauver(s);}
  const cfg=AVENT_CASES[n];
  if(!el)return;
  const bouton=cls=>`<button class="av-debloque${cls}" onclick="aventSuivi('avent_surprise',${n});ouvrirAvent(${n})"><span>✦</span>`+
    (cfg.jeu?tr('Mini-jeu débloqué','Mini-game unlocked'):tr(`Case ${n} du calendrier terminée`,`Door ${n} of the calendar done`))+
    `<b>${cfg.jeu?aventNomJeu(cfg):AT(cfg.titre)}</b></button>`;
  // La première fois, après le score : un cadeau se secoue, s'ouvre, et laisse place au bouton du mini-jeu
  el.classList.toggle('anim',neuf&&!!cfg.jeu);
  if(neuf&&cfg.jeu){
    const eclats=[[-46,-30],[44,-34],[-30,-58],[30,-60],[0,-70],[-56,4],[56,0]].map(([x,y])=>`<i class="avc-e" style="--dx:${x}px;--dy:${y}px">✦</i>`).join('');
    el.innerHTML=`<div class="avc" aria-hidden="true"><div class="avc-boite"></div><div class="avc-couv"></div>${eclats}`+
      `<span class="avc-l">${tr('Ta surprise du jour…','Your surprise of the day…')}</span></div>`+bouton(' avc-cache');
  }else el.innerHTML=bouton('');
}

// ── Démarrage ─────────────────────────────────────────────
// Adresse /avent/N (copie de l'accueil fabriquée au déploiement), ou ?avent=N en local.
function aventCaseAdresse(){
  const m=location.pathname.match(/^\/avent\/(\d{1,2})(\.html)?$/);
  let n=m?+m[1]:null;
  if(!aventProd){const q=new URLSearchParams(location.search).get('avent');if(q)n=+q;}
  return n>=1&&n<=AVENT_NB?n:(/^\/avent\/?$/.test(location.pathname)?0:null);
}
(function(){
  const n=aventCaseAdresse();
  aventMajNouveau();
  aventLireJour().then(()=>{
    aventMajNouveau();
    if(document.getElementById('sav')?.classList.contains('on'))aventRendre();
  });
  if(n!==null){
    // Arrivée par un lien partagé : le calendrier passe devant l'accueil et la fenêtre
    // de règles de première visite.
    document.getElementById('smr')?.classList.remove('on');
    setTimeout(()=>document.getElementById('smr')?.classList.remove('on'),350);
    aventLireJour().then(()=>ouvrirAvent(n||null));
  }
})();
