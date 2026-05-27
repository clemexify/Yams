// ══ BOTS ═════════════════════════════════════════════════
const BOTS=[
  {id:'blaise',name:'Blaise',em:'🎲',
   desc:'Stratège probabiliste',quip:'Pascal dans la tête',
   dice:['Hmm. Intéressant.','Je calcule mes options.','Exactement ce que je voulais.','Pas idéal, mais gérable.'],
   ahead:['+{d} pts. Les probabilités sont de mon côté. 📊','Mes simulations Monte Carlo prédisaient ça. 🤓','Le bonus chiffres, c\'est la clé. Tu le sais ? 🔑'],
   behind:['{a} pts derrière. Je me rattrapperai sur les figures. 💪','Bien joué. Mais la partie est longue. 😤','Profite. Les probabilités s\'équilibrent toujours. 📉'],
   equal:['Serré. Ça va se jouer sur les cases difficiles. ⚡','Le vrai jeu commence. 🎲'],
   trans:['Pascal avait raison sur tout. Sauf peut-être sur ce coup-là.','J\'analyse. Ne sois pas pressé.','Les chiffres ne mentent pas. Moi si, parfois.']},
  {id:'diceman',name:'Diceman',em:'🎰',
   desc:"L'homme dé",quip:'Né pour le yams',
   dice:['Come on les dés !','Alleeez !','C\'est ça qu\'on veut !','Ouais ouais !'],
   ahead:['YEAAH ! Les dés sont avec moi ! 🎰','Je suis en feu ! 🔥','Tu vois ça ? C\'est de la magie. ✨'],
   behind:['Bah. Les dés feront leur travail. 🎲','Je perds ? Non. Je chauffe. 🔥','Attends le yams. Il ARRIVE. 🎰'],
   equal:['Le destin balance. J\'aime ça. ⚖️','On verra qui les dés aiment le plus. 🎲'],
   trans:['Les dés ont parlé. Ça va ? 🎲','Je pourrais faire ça toute la journée.','Ta chance contre ma chance.']},
  {id:'lucky',name:'Lucky Strike',em:'🍀',
   desc:'La chanceuse',quip:'La fortune sourit aux audacieux',
   dice:['🍀 Allez !','Croisons les doigts !','La chance est là !','Ooh yes !'],
   ahead:['La chance, c\'est un talent. 🍀','Fortune et gloire. Dans cet ordre. 🌟','Certains appellent ça de la chance. Moi j\'appelle ça du style. ✨'],
   behind:['Ma chance recharge. Patience. 🍀','Ce n\'est pas de la malchance, c\'est du suspense. 🎭','Le coup de théâtre arrive. Je le sens. ✨'],
   equal:['La chance équilibre tout. Pour l\'instant. 🍀','Coin flip. Sauf que c\'est des dés. 🎲'],
   trans:['Strike ! Ou presque. 🍀','La chance sourit, parfois elle rit aux éclats.','Tu te sens chanceux aujourd\'hui ?']},
  {id:'axiom',name:'Axiom',em:'🤖',
   desc:'La machine froide',quip:'Calcul pur, zéro émotion',
   dice:['Calcul.','Traitement.','Données reçues.','Optimal.'],
   ahead:['Avantage calculé. Maintien de la trajectoire.','Probabilité de victoire : 73.4%. Dans la marge.','Score optimal atteint.'],
   behind:['Déficit temporaire. Recalibration en cours.','Sous-performance enregistrée. Ajustement activé.','Écart de {a} pts. Correction possible.'],
   equal:['Égalité parfaite. Situation nominale.','Score identique. Variance attendue.'],
   trans:['Séquence terminée. Données enregistrées.','Traitement du tour : complet.','Optimisation en cours.']},
  {id:'rosie',name:'Rosie',em:'☕',
   desc:'La joueuse de café',quip:'Expérimentée et redoutable',
   dice:['Mmh. ☕','Je vois ce que je peux faire.','Pas mal, pas mal.','Voilà qui est mieux.'],
   ahead:['J\'ai vu pire. Et j\'ai gagné. ☕','Ça marche encore, cette vieille stratégie. 😌','Quand on a joué autant de parties...'],
   behind:['Patience, mon ami. ☕','J\'ai rattrapé des écarts bien plus grands.','Ce n\'est pas fini tant que ce n\'est pas fini.'],
   equal:['On se tient. Comme souvent à ce stade. ☕','Bien joué. Continue comme ça.'],
   trans:['Un bon coup. Ou pas. Le temps le dira. ☕','J\'en ai vu d\'autres.','La partie se joue souvent à ce moment-là.']},
  {id:'culman',name:'Culman',em:'🍜',
   desc:'Le cul bordé de nouilles',quip:'Imprévisible, toujours chanceux',
   dice:['Oh ! 🍀','Ah bah tiens !','C\'est cadeau ça ! 🍜','Je vais pas me plaindre !'],
   ahead:['Encore ?! Même moi je suis surpris. 🍀','Je comprends pas comment c\'est possible. 🤷','Les nouilles portent bonheur. 🍜'],
   behind:['Mes nouilles chargent. 🍜','Je perds souvent au début. Après ça part.','Normal. Je calibre. 🍀'],
   equal:['C\'est serré ? Attend la fin. 🍜','Ouais c\'est normal je vais doucement. 🍀'],
   trans:['Honnêtement j\'ai pas compris ce que j\'ai fait mais ça marche. 🍀','Les dés m\'aiment. On n\'y peut rien.','🍜 Encore un coup de bol ?']},
];

// ══ CONSTANTES ══════════════════════════════════════════
const SAVE_KEY='yams_save';
const DAILY_KEY='yams_daily';
const DAILY_SAVE_KEY='yams_daily_save';
const DAILY_PSEUDO_KEY='yams_daily_pseudo';
const PLAYER_NAME_KEY='yams_player_name';
const RULES_KEY='yams_rules_seen';
const BADGE_KEY='yams_badges';
const STATS_KEY='yams_stats';
const CNAME={normal:'Normale',desc:'Descendante',asc:'Ascendante',seche:'Sèche',annonce:'Annoncée'};
const BADGES=[
  {id:'r10',em:'⚀',name:'Régulier',desc:'10 parties jouées',cat:'regularite'},
  {id:'r20',em:'⚁',name:'Habitué',desc:'20 parties jouées',cat:'regularite'},
  {id:'r30',em:'⚂',name:'Assidu',desc:'30 parties jouées',cat:'regularite'},
  {id:'r40',em:'⚃',name:'Vétéran',desc:'40 parties jouées',cat:'regularite'},
  {id:'r50',em:'⚄',name:'Expert',desc:'50 parties jouées',cat:'regularite'},
  {id:'r60',em:'⚅',name:'Maître',desc:'60 parties jouées',cat:'regularite'},
  {id:'yams_master',em:'🏆',name:'Yams Master',desc:'Dépasser 1250 pts en une partie',cat:'performance'},
  {id:'pojuste',em:'☘️',name:"C'est Pô Juste",desc:'Terminer une partie sous 800 pts',cat:'performance'},
  {id:'bol',em:'🍀',name:'Monsieur le Bol',desc:'3 Yams réussis dans une partie',cat:'performance'},
  {id:'boumbacar',em:'👊',name:'Boumbacar',desc:'Yams avec les cinq dés à 6',cat:'performance'},
  {id:'yams_seche',em:'🍑',name:'Culman',desc:'Réussir un Yams sec',cat:'performance'},
  {id:'brasgueille',em:'🧦',name:'Bras de Gueille',desc:'Terminer sans aucun bonus +30',cat:'technique'},
  {id:'propre',em:'🧹',name:'Monsieur Propre',desc:'Aucune figure barrée (sauf Yams)',cat:'technique'},
  {id:'col_parfaite',em:'🏛️',name:'Colonne Parfaite',desc:'+30 ET aucune figure barrée dans une colonne',cat:'technique'},
  {id:'suite_ideas',em:'🧵',name:'De la Suite',desc:'5 suites réussies (une par colonne)',cat:'technique'},
  {id:'madame',em:'🌸',name:'Madame Parfaite',desc:'Bonus +30 dans toutes les colonnes',cat:'technique'},
  {id:'seum_master',em:'😤',name:'Seum Master',desc:'Placer un Yams hors de la case Yams',cat:'technique'},
  {id:'beat_blaise',em:'🤖',name:'Blaise Buster',desc:'Battre Blaise',cat:'bots'},
  {id:'beat_culman',em:'🍜',name:'Culman Crusher',desc:'Battre Culman',cat:'bots'},
  {id:'beat_diceman',em:'🎰',name:'Diceman Dompteur',desc:'Battre Diceman',cat:'bots'},
  {id:'beat_lucky',em:'🍀',name:'Lucky Breaker',desc:'Battre Lucky Strike',cat:'bots'},
  {id:'beat_rosie',em:'☕',name:'Rosie Renversée',desc:'Battre Rosie',cat:'bots'},
  {id:'beat_axiom',em:'🧊',name:'Axiom Crashé',desc:'Battre Axiom',cat:'bots'},
];
const SB_URL='https://lsxjukvyadhdqlobpdcw.supabase.co/rest/v1';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeGp1a3Z5YWRoZHFsb2JwZGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTAzNjcsImV4cCI6MjA5NDI4NjM2N30.v7GquWhNK7W_ss04Ed1u7hn8Z-wby515TJI8MyG929A';
const SB_HDR={'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY};
function trackEvent(type,evtMode,nb_players){
  const m=evtMode==='solo'?'local':evtMode;
  fetch(SB_URL+'/events',{method:'POST',headers:{...SB_HDR,'Prefer':'return=minimal'},
    body:JSON.stringify({type,mode:m,nb_players})}).catch(()=>{});
}
async function submitToLeaderboard(pseudo,score,date,grid,opponents,duration_s){
  try{
    const r=await fetch(SB_URL+'/scores',{method:'POST',headers:{...SB_HDR,'Prefer':'return=minimal'},
      body:JSON.stringify({pseudo,score,date,grid,opponents,duration_s})});
    return r.ok;
  }catch(e){return false;}
}
async function loadLeaderboard(){
  try{
    const r=await fetch(SB_URL+'/scores?select=pseudo,score,date,grid,opponents&order=score.desc&limit=20',{headers:SB_HDR});
    if(!r.ok)return[];
    return await r.json();
  }catch(e){return[];}
}
const COLS=['normal','desc','asc','seche','annonce'];
const CLBL={normal:'N',desc:'↓',asc:'↑',seche:'S',annonce:'A'};
const ROWS=['1','2','3','4','5','6','bonus','plus','minus','diff','full','suite','carre','yams'];
const RLBL={'1':'As','2':'Deux','3':'Trois','4':'Quatre','5':'Cinq','6':'Six',
  'bonus':'Bonus','plus':'+','minus':'−','diff':'Diff',
  'full':'Full','suite':'Suite','carre':'Carré','yams':'Yams'};
const DESC=['1','2','3','4','5','6','plus','minus','full','suite','carre','yams'];
const ASC=[...DESC].reverse();
const FIGS=['full','suite','carre','yams'];
const DP={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const NM={'2':6,'3':9,'4':12,'5':15,'6':18};

// ══ ÉTAT ════════════════════════════════════════════════
let mode='solo',nbPl=1,selBotIdx=0;
let players=[],cur=0,over=false;
let rollN=0,dice=[0,0,0,0,0],kept=[false,false,false,false,false];
let hasRolled=false,secheOk=false,announced=null,suggestCell=null,botTarget=null,culmanFallbackCell=null;
let transTimer=null;
let pendingSubmit=null;
let undoState=null;
let gameStartTime=0;
let gameEvents={boumbacar:false,yams_seche:false,seum_master:false};
let isDailyMode=false,seededRng=null,dailyTurnPool=[],dailyTurnIndex=0;
let coachOn=true;
let transNextIdx=0;

// ══ HELPERS ═════════════════════════════════════════════
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
function canPlace(col,row,scores,ann,rn,sok){
  if(scores[col][row]!==null||row==='bonus'||row==='diff')return false;
  if(ann!==null&&col!=='annonce')return false;
  if(col==='desc'){const i=DESC.indexOf(row);if(i<0)return false;return DESC.slice(0,i).every(r=>scores[col][r]!==null);}
  if(col==='asc'){const i=ASC.indexOf(row);if(i<0)return false;return ASC.slice(0,i).every(r=>scores[col][r]!==null);}
  if(col==='seche')return sok;
  if(col==='annonce'){if(ann!==null)return ann===row;return rn===1;}
  return true;
}
function colTot(col,sc2){return ROWS.reduce((a,r)=>{if(r==='plus'||r==='minus')return a;const v=sc2[col][r];return a+(typeof v==='number'?v:0);},0);}
function grandTot(sc2){return COLS.reduce((a,c)=>a+colTot(c,sc2),0);}
function numTot(col,sc2){return '123456'.split('').reduce((a,r)=>{const v=sc2[col][r];return a+(typeof v==='number'?v:0);},0);}
function updBonus(col,sc2){
  if('123456'.split('').every(r=>sc2[col][r]!==null)){
    const s='123456'.split('').reduce((a,r)=>a+(typeof sc2[col][r]==='number'?sc2[col][r]:0),0);
    const was=sc2[col]['bonus'];
    sc2[col]['bonus']=s>=60?30:0;
    if(was!==30&&sc2[col]['bonus']===30)setTimeout(()=>triggerBonus(col),200);
  }
}
function updDiff(col,sc2){
  const p=sc2[col]['plus'],m=sc2[col]['minus'];
  const pv=typeof p==='number'?p:(p==='X'?0:null);
  const mv=typeof m==='number'?m:(m==='X'?0:null);
  if(pv!==null&&mv!==null)sc2[col]['diff']=pv-mv;
}
function updAll(col,sc2){updBonus(col,sc2);updDiff(col,sc2);}
function freeTotal(){return players.reduce((a,p)=>a+COLS.reduce((b,c)=>b+ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&p.sc[c][r]===null).length,0),0);}
function autoAnn(sc2){
  const f=[];COLS.forEach(c=>ROWS.forEach(r=>{if(r!=='bonus'&&r!=='diff'&&sc2[c][r]===null)f.push({c,r});}));
  if(f.length===1&&f[0].c==='annonce')return f[0].r;return null;
}
function updProj(){
  const sc2=players[cur].sc;
  const pl=ROWS.filter(r=>r!=='bonus'&&r!=='diff'),tot=pl.length*COLS.length;
  let fi=0,cv=0;
  COLS.forEach(c=>{
    pl.forEach(r=>{const v=sc2[c][r];if(v!==null){fi++;if(typeof v==='number')cv+=v;}});
    const b=sc2[c]['bonus'];if(typeof b==='number')cv+=b;
    const d=sc2[c]['diff'];if(typeof d==='number')cv+=d;
  });
  const proj=fi?'~'+Math.round(cv/fi*tot):'—';
  document.getElementById('dproj').textContent=proj;
  const dp=document.getElementById('desk-proj-val');if(dp)dp.textContent=proj;
}
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

// ══ AUDIO ════════════════════════════════════════════════
let AC=null;
function aEn(){if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();}
function aDiceSoftImpact(vol){
  const sr=AC.sampleRate,dur=0.06+Math.random()*0.04;
  const buf=AC.createBuffer(1,Math.ceil(sr*dur),sr);
  const data=buf.getChannelData(0);
  for(let j=0;j<data.length;j++)data[j]=(Math.random()*2-1)*(Math.exp(-j/(sr*.028))*.6+Math.exp(-j/(sr*.08))*.4);
  const src=AC.createBufferSource(),g=AC.createGain();
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=400+Math.random()*80;
  src.buffer=buf;src.connect(lp);lp.connect(g);g.connect(AC.destination);
  g.gain.setValueAtTime(vol,AC.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur);
  src.start();
}
function aDice(n){
  aEn();
  const durations=[0.12,0.22,0.35,0.48,0.60].sort(()=>Math.random()-.5);
  for(let i=0;i<Math.min(n,5);i++){
    const dieStart=i*60+Math.random()*30;
    const totalDur=durations[i];
    const N=Math.max(1,Math.round(totalDur/0.10));
    for(let b=0;b<N;b++){
      const ratio=b/Math.max(N-1,1);
      const offset=totalDur*1000*ratio*ratio;
      const vol=1.0*Math.pow(0.82,b);
      setTimeout(()=>aDiceSoftImpact(vol),dieStart+offset);
    }
  }
}
function aFig(type){
  aEn();
  const pl=(f,d,v,w='sine',t=0)=>setTimeout(()=>{
    const o=AC.createOscillator(),g=AC.createGain();
    o.type=w;o.frequency.setValueAtTime(f,AC.currentTime);
    g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);
    o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d);
  },t);
  const cr=(f,v,t=0)=>setTimeout(()=>{
    const buf=AC.createBuffer(1,Math.ceil(AC.sampleRate*.045),AC.sampleRate);
    const data=buf.getChannelData(0);
    for(let j=0;j<data.length;j++)data[j]=(Math.random()*2-1)*Math.pow(1-j/data.length,1.8);
    const src=AC.createBufferSource(),g=AC.createGain(),f2=AC.createBiquadFilter();
    f2.type='bandpass';f2.frequency.value=f;f2.Q.value=.9;
    src.buffer=buf;src.connect(f2);f2.connect(g);g.connect(AC.destination);
    g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.06);
    src.start();
  },t);
  if(type==='bonus'){pl(523,.2,.12,'sine',0);pl(659,.2,.12,'sine',110);pl(784,.28,.14,'sine',220);cr(600,.2,220);}
  else if(type==='full'){pl(440,.18,.12,'sine',0);cr(800,.28,80);pl(660,.22,.14,'sine',120);}
  else if(type==='suite'){[330,440,550,660].forEach((f,i)=>{pl(f,.15,.1,'sine',i*80);cr(f*1.2,.2,i*80);});}
  else if(type==='carre'){pl(330,.35,.18,'sine',0);pl(415,.35,.14,'sine',0);pl(495,.35,.12,'sine',0);cr(700,.35,0);pl(660,.25,.12,'sine',180);cr(900,.25,200);}
  else if(type==='yams'){[0,60,120,180,240].forEach((t,i)=>{const fr=[440,554,659,880,1108];pl(fr[i],.5,.18,'sine',t);cr(fr[i]*1.5,.4,t);});pl(880,.6,.25,'sine',350);cr(1200,.5,370);}
  else if(type==='seche'){cr(1000,.4,0);pl(660,.3,.14,'sine',0);cr(1200,.3,100);pl(880,.25,.12,'sine',110);}
}
function aPlace(){
  aEn();
  const o=AC.createOscillator(),g=AC.createGain();
  o.connect(g);g.connect(AC.destination);
  o.frequency.setValueAtTime(500,AC.currentTime);o.frequency.exponentialRampToValueAtTime(750,AC.currentTime+.06);
  g.gain.setValueAtTime(.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.09);
  o.start();o.stop(AC.currentTime+.09);
}
function aAnnounce(){
  aEn();
  [[660,0,.12],[880,80,.12],[1175,160,.18]].forEach(([f,delay,dur])=>{
    setTimeout(()=>{
      const o=AC.createOscillator(),g=AC.createGain();
      o.type='triangle';o.frequency.setValueAtTime(f,AC.currentTime);
      g.gain.setValueAtTime(.13,AC.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur);
      o.connect(g);g.connect(AC.destination);
      o.start();o.stop(AC.currentTime+dur);
    },delay);
  });
}

// ══ SETUP UI ════════════════════════════════════════════
function setMode(m){
  mode=m;
  ['solo','daily','bot'].forEach(x=>{
    document.getElementById('mt-'+x).classList.toggle('on',x===m);
    document.getElementById('cfg-'+x).style.display=x===m?'flex':'none';
  });
  if(m==='daily'){
    const saved=localStorage.getItem(PLAYER_NAME_KEY)||localStorage.getItem(DAILY_PSEUDO_KEY)||'';
    document.getElementById('dname-daily').value=saved;
  }
}
function onGo(){if(mode==='daily')launchDaily();else launch();}
function setNb(n){
  nbPl=n;
  [1,2,3].forEach(i=>document.getElementById('nb'+i)?.classList.toggle('on',i===n));
  const wrap=document.getElementById('mnames');
  const savedName=localStorage.getItem(PLAYER_NAME_KEY)||'';
  wrap.innerHTML='';
  for(let i=0;i<n;i++){
    const inp=document.createElement('input');
    inp.className='sinput';inp.id='mn'+i;inp.type='text';
    inp.placeholder=i===0?(n===1?'Ton prénom':`Joueur 1`):`Joueur ${i+1}`;
    inp.maxLength=14;
    if(i===0&&savedName)inp.value=savedName;
    wrap.appendChild(inp);
  }
  const desc=document.getElementById('solo-desc');
  if(desc){
    if(n===1){
      desc.innerHTML='<div class="daily-tagline">Partie solo</div><div class="daily-sub">Lance les dés, remplis ta grille et rejoins le classement. Chaque partie est une chance de faire mieux.</div>';
    } else {
      const label=n===2?'Partie à deux':'Partie à trois';
      desc.innerHTML=`<div class="daily-tagline">${label}</div><div class="daily-sub">Partie locale. Tous les joueurs pourront rejoindre le classement.</div>`;
    }
  }
}
function buildBotList(){
  document.getElementById('bot-list').innerHTML=BOTS.map((b,i)=>`
    <div class="bot-row${i===0?' on':''}" id="br${i}" onclick="selBot(${i})">
      <span class="bot-em">${b.em}</span>
      <div class="bot-info"><b>${b.name}</b><span>${b.desc} — ${b.quip}</span></div>
      <div class="bot-check"></div>
    </div>`).join('');
}
function selBot(i){
  selBotIdx=i;
  BOTS.forEach((_,j)=>document.getElementById('br'+j)?.classList.toggle('on',j===i));
}

// ══ LAUNCH ══════════════════════════════════════════════
function mkSc(){return Object.fromEntries(COLS.map(c=>[c,Object.fromEntries(ROWS.map(r=>[r,null]))]));}
function launch(){
  isDailyMode=false;seededRng=null;dailyTurnPool=[];dailyTurnIndex=0;
  gameStartTime=Date.now();
  trackEvent('game_start',mode,nbPl);
  clearSave();players=[];over=false;cur=0;
  gameEvents={boumbacar:false,yams_seche:false,seum_master:false};
  if(mode==='bot'){
    const name=document.getElementById('pname').value.trim()||'Joueur';
    localStorage.setItem(PLAYER_NAME_KEY,name);
    const bot=BOTS[selBotIdx];
    players=[{name,sc:mkSc(),isBot:false,lastMove:null},{name:bot.name,sc:mkSc(),isBot:true,bot,lastMove:null}];
  } else if(mode==='solo'){
    for(let i=0;i<nbPl;i++){
      const el=document.getElementById('mn'+i);
      const name=el?.value.trim()||`Joueur ${i+1}`;
      if(i===0)localStorage.setItem(PLAYER_NAME_KEY,name);
      players.push({name,sc:mkSc(),isBot:false,lastMove:null});
    }
  }
  buildTabs();show('sg');startTurn();
}

// ══ SCREEN ══════════════════════════════════════════════
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));}

// ══ TABS ════════════════════════════════════════════════
function buildTabs(){
  const wrap=document.getElementById('htabs');
  wrap.innerHTML=players.map((p,i)=>{
    const isBot=p.isBot;
    return`<div class="htab${isBot?' bot-tab':''}" data-i="${i}">${p.name}</div>`;
  }).join('');
  updTabs();
}
function updTabs(){
  document.querySelectorAll('.htab').forEach((t,i)=>t.classList.toggle('on',i===cur));
}

// ══ TURN ════════════════════════════════════════════════
function startTurn(){
  rollN=0;dice=[0,0,0,0,0];kept=[false,false,false,false,false];
  hasRolled=false;secheOk=false;announced=null;suggestCell=null;
  if(isDailyMode){
    dailyTurnPool=[];
    for(let i=0;i<15;i++)dailyTurnPool.push(seededRng());
    dailyTurnIndex++;
  }
  document.getElementById('dname').textContent=players[cur].name;
  const br=document.getElementById('broll');br.disabled=false;br.innerHTML='<span>🎲</span><span>Lancer</span>';
  updBadge();updCoups();updTabs();renderDice(false);renderTable();
  if(players[cur].isBot){setCoach(players[cur].name+' réfléchit…');setTimeout(botTurn,800);}
  else setCoach('À toi '+players[cur].name+' !');
  saveGame();
}
function updBadge(){const el=document.getElementById('dbadge');el.textContent=rollN+'/3';el.className='dbadge'+(rollN>=3?' dn':'');}
function updCoups(){const f=freeTotal();document.getElementById('hbadge').innerHTML='<span>'+f+'</span> coup'+(f>1?'s':'');}

// ══ ROLL ════════════════════════════════════════════════
function doRoll(){
  if(rollN>=3||over||players[cur].isBot)return;
  aEn();
  const n=kept.filter(k=>!k).length;
  rollN++;secheOk=(n===5);
  if(undoState?.type==='placement'||(undoState?.type==='annonce'&&rollN>=2)){undoState=null;updUndoBtn();}
  if(isDailyMode){
    for(let i=0;i<5;i++){const v=Math.floor(dailyTurnPool[(rollN-1)*5+i]*6)+1;if(!kept[i])dice[i]=v;}
  }else{
    for(let i=0;i<5;i++)if(!kept[i])dice[i]=Math.floor(Math.random()*6)+1;
  }
  hasRolled=true;
  aDice(n);renderDice(true);updBadge();
  if(rollN>=3){const br=document.getElementById('broll');br.disabled=true;br.innerHTML='<span>✓</span><span>Place</span>';}
  const sv=hasRolled;hasRolled=false;renderTable();hasRolled=sv;
  setTimeout(()=>{
    if(rollN===1&&!announced){
      const auto=autoAnn(players[cur].sc);
      if(auto)announced=auto;
    }
    renderTable();
    detectFx();
    if(coachOn)setCoach(coachMsg());
    saveGame();
  },360);
}

// ══ DICE RENDER ═════════════════════════════════════════
function renderDice(rolling){
  const row=document.getElementById('drow');if(!row)return;
  const ex=row.querySelectorAll('.die');
  for(let i=0;i<5;i++){
    const locked=rollN>=3||!hasRolled||players[cur].isBot&&rollN>0;
    let el=ex[i];
    if(!el){el=document.createElement('div');for(let j=0;j<9;j++){const d=document.createElement('div');d.className='dot off';el.appendChild(d);}row.appendChild(el);}
    const rolling_i=rolling&&!kept[i];
    let cls='die'+(kept[i]?' kept':'')+(locked?' lk':'')+(rolling_i?' roll':'');
    if(rolling_i){el.className=cls.replace(' roll','');void el.offsetWidth;}
    el.className=cls;el._i=i;
    el.onclick=(!locked)?dieTap:null;
    const face=DP[dice[i]]||[];
    el.querySelectorAll('.dot').forEach((d,j)=>d.className='dot'+(face.includes(j)?'':' off'));
  }
}
function dieTap(e){
  const i=e.currentTarget._i;
  if(!hasRolled||rollN>=3||players[cur].isBot)return;
  kept[i]=!kept[i];
  const el=e.currentTarget;el.className='die'+(kept[i]?' kept':'');
}

// ══ ANNONCE ═════════════════════════════════════════════
function doAnn(row){
  if(!hasRolled||rollN!==1||announced)return;
  undoState={type:'annonce'};
  announced=row;renderTable();
  aAnnounce();updUndoBtn();
  setCoach('Annoncé '+RLBL[row]+' 🎯');
}


// ══ TABLE ═══════════════════════════════════════════════
function renderTable(){
  const sc2=players[cur].sc;
  let h='<thead><tr><th class="cl"></th>';
  COLS.forEach(c=>h+=`<th class="cc"><span class="cname">${CLBL[c]}</span></th>`);
  h+='</tr></thead><tbody>';
  ROWS.forEach(row=>{
    const sep=(row==='plus'||row==='full')?' sep':'';
    h+=`<tr class="${sep}"><td class="cl"><span class="rn">${RLBL[row]}</span></td>`;
    COLS.forEach(col=>h+='<td>'+cellH(col,row,sc2)+'</td>');
    h+='</tr>';
    if(row==='6'){
      h+='<tr class="rnt"><td class="cl"><span class="rn">Sous-total</span></td>';
      COLS.forEach(col=>{
        const ns=numTot(col,sc2);
        let ob=0,mn=0,filled=0;
        '123456'.split('').forEach(r=>{
          const v=sc2[col][r];
          if(typeof v==='number'){
            ob+=v;filled++;
            if(r!=='1') mn+=NM[r];
          }
        });
        const df=ob-mn;
        let dh='';
        if(filled>0){const cls=df>0?'p':df<0?'n':'z';dh=`<span class="cntd ${cls}">${df>0?'+':''}${df}</span>`;}
        h+=`<td><div class="cnt">${ns}${dh}</div></td>`;
      });
      h+='</tr>';
    }
  });
  h+='<tr class="rtot"><td class="cl"><span class="rn" style="font-weight:700">Total</span></td>';
  COLS.forEach(c=>h+=`<td><span class="ctot">${colTot(c,sc2)}</span></td>`);
  h+=`</tr><tr class="rgr"><td class="cl" colspan="${COLS.length+1}">`;
  const totColor=players[cur]?.isBot?'var(--p)':'var(--g)';
  const gt=grandTot(sc2);
  h+=`<span style="font-size:9px;color:var(--mu)">Total : </span><span class="cgr" style="color:${totColor}">${gt} pts</span></td></tr>`;
  const dgt=document.getElementById('desk-grand-tot');if(dgt)dgt.textContent=gt+' pts';
  h+=`<tr class="rgr"><td class="cl" colspan="${COLS.length+1}">`;
  h+=`<span style="font-size:9px;color:var(--mu)">Projection : </span><span id="dproj" style="font-size:13px;font-weight:700;color:${totColor}">—</span></td></tr>`;
  h+='</tbody>';
  document.getElementById('tbl').innerHTML=h;
  updProj();
}

function cellH(col,row,sc2){
  const v=sc2[col][row];
  if(row==='bonus'){
    if(v!==null)return`<span class="cell vf">${v===30?'+30':'—'}</span>`;
    return`<span class="cell vbonus">${numTot(col,sc2)}/60</span>`;
  }
  if(row==='diff'){
    if(v!==null)return`<span class="cell vf">${v>=0?'+'+v:v}</span>`;
    return`<span class="cell ve">—</span>`;
  }
  if(v!==null)return`<span class="cell vf">${(v==='X'||v===0)?'✕':v}</span>`;
  if(!hasRolled)return`<span class="cell ve">·</span>`;
  if(!canPlace(col,row,sc2,announced,rollN,secheOk))return`<span class="cell vl">·</span>`;
  if(col==='seche'&&FIGS.includes(row)&&sc(row,dice)===0&&rollN<3)return`<span class="cell vl">·</span>`;
  const isBot=players[cur]?.isBot;
  if(col==='annonce'){
    if(!announced&&rollN===1){
      const s=sc(row,dice),c2=mkCnt(dice);
      const good=(FIGS.includes(row)&&s>0)||('123456'.includes(row)&&(c2[+row]||0)>=3);
      if(isBot)return`<span class="cell ${good?'vp':'vn'}">${s||'·'}</span>`;
      if(FIGS.includes(row)&&s>0)return`<span class="cell vp" onclick="doAnn('${row}')">${s}✓</span>`;
      if('123456'.includes(row)&&(c2[+row]||0)>=3)return`<span class="cell vp" onclick="doAnn('${row}')">${s}✓</span>`;
      return`<span class="cell va" onclick="doAnn('${row}')">Ann.</span>`;
    }
    if(!announced||announced!==row)return`<span class="cell vl">·</span>`;
    const s=sc(row,dice);
    if(isBot)return`<span class="cell ${s>0?'vp':'vn'}">${s>0?s:'✕'}</span>`;
    return`<span class="cell ${s>0?'vp':'vn'}" onclick="place('${col}','${row}')">${s}</span>`;
  }
  const s=sc(row,dice);
  const sg=coachOn&&suggestCell&&suggestCell.col===col&&suggestCell.row===row?' vs':'';
  if(isBot){
    const isTgt=botTarget?.col===col&&botTarget?.row===row;
    if(isTgt)return`<span class="cell vbt">${s>0?s:'✕'}</span>`;
    if('123456'.includes(row)){const cnt=dice.filter(d=>d===+row).length;return`<span class="cell ${cnt>=3?'vp':'vn'}">${s}</span>`;}
    if(s>0)return`<span class="cell vp">${s}</span>`;
    return`<span class="cell vn">✕</span>`;
  }
  if('123456'.includes(row)){
    const cnt=dice.filter(d=>d===+row).length;
    const cl=cnt>=3?'vp':'vn';
    return`<span class="cell ${cl}${sg}" onclick="place('${col}','${row}')">${s}</span>`;
  }
  if(s>0)return`<span class="cell vp${sg}" onclick="place('${col}','${row}')">${s}</span>`;
  return`<span class="cell vn${sg}" onclick="cross('${col}','${row}')">✕</span>`;
}

// ══ UNDO ════════════════════════════════════════════════
function updUndoBtn(){
  const btn=document.getElementById('hundo');
  if(!btn)return;
  btn.style.display=(undoState&&!players[cur]?.isBot)?'':'none';
}
function doUndo(){
  if(!undoState)return;
  if(undoState.type==='placement'){
    const p=players[cur];
    p.sc[undoState.col][undoState.row]=null;
    p.sc[undoState.col]['bonus']=undoState.prevBonus;
    p.sc[undoState.col]['diff']=undoState.prevDiff;
    p.lastMove=undoState.prevLastMove;
    dice=[...undoState.dice];kept=[...undoState.kept];
    rollN=undoState.rollN;hasRolled=undoState.hasRolled;
    secheOk=undoState.secheOk;announced=undoState.announced;
    const br=document.getElementById('broll');
    br.disabled=rollN>=3;
    br.innerHTML=rollN>=3?'<span>✓</span><span>Place</span>':'<span>🎲</span><span>Lancer</span>';
    updBadge();renderDice(false);renderTable();
    if(hasRolled&&coachOn)setCoach(coachMsg());
    else setCoach('À toi '+players[cur].name+' !');
  }else if(undoState.type==='annonce'){
    announced=null;
    renderTable();
    setCoach('À toi '+players[cur].name+' !');
  }
  undoState=null;updUndoBtn();
}

// ══ PLACE ═══════════════════════════════════════════════
function place(col,row){
  if(!hasRolled||players[cur].isBot)return;
  const p=players[cur];
  if(!canPlace(col,row,p.sc,announced,rollN,secheOk))return;
  if(col==='annonce'&&!announced&&rollN===1){doAnn(row);return;}
  const s=sc(row,dice);
  // Badge détection
  if(sc('yams',dice)>0&&row!=='yams')gameEvents.seum_master=true;
  if(dice.every(d=>d===6)&&sc('yams',dice)>0)gameEvents.boumbacar=true;
  if(col==='seche'&&row==='yams'&&s>0)gameEvents.yams_seche=true;
  undoState=null;
  if(mode==='solo'){
    undoState={type:'placement',col,row,
      prevBonus:p.sc[col]['bonus'],prevDiff:p.sc[col]['diff'],
      dice:[...dice],kept:[...kept],rollN,hasRolled,secheOk,announced,
      prevLastMove:p.lastMove};
  }
  p.sc[col][row]=s;updAll(col,p.sc);
  p.lastMove={col,row,s};
  aPlace();setCoach(afterMsg(row,s));hasRolled=false;renderTable();
  updUndoBtn();setTimeout(doNext,320);
}
function cross(col,row){
  if(!hasRolled||players[cur].isBot)return;
  const p=players[cur];
  if(!canPlace(col,row,p.sc,announced,rollN,secheOk))return;
  undoState=null;
  if(mode==='solo'){
    undoState={type:'placement',col,row,
      prevBonus:p.sc[col]['bonus'],prevDiff:p.sc[col]['diff'],
      dice:[...dice],kept:[...kept],rollN,hasRolled,secheOk,announced,
      prevLastMove:p.lastMove};
  }
  p.sc[col][row]='X';updAll(col,p.sc);
  p.lastMove={col,row,s:'X'};
  aPlace();setCoach(afterMsg(row,'X'));hasRolled=false;renderTable();
  updUndoBtn();setTimeout(doNext,320);
}
function afterMsg(row,s){
  if(s==='X')return'✂️ '+RLBL[row]+' barré.';
  if(s===0)return'😬 Zéro sur '+RLBL[row]+'.';
  if(row==='yams')return'🎉 YAMS ! Légendaire !';
  if(row==='carre')return'💪 Carré à '+s+' pts !';
  if(row==='suite')return'🎯 Suite à '+s+' pts !';
  if(row==='full')return'✅ Full à '+s+' pts !';
  return s>=20?'💚 '+s+' pts !':'👌 '+s+' pts.';
}

// ══ NEXT / TRANSITION ════════════════════════════════════
function doNext(){
  const allDone=players.every(p=>COLS.every(c=>ROWS.filter(r=>r!=='bonus'&&r!=='diff').every(r=>p.sc[c][r]!==null)));
  if(allDone){endGame();return;}
  const prevIdx=cur;
  let nextIdx=(cur+1)%players.length,tries=0;
  while(tries<players.length&&COLS.every(c=>ROWS.filter(r=>r!=='bonus'&&r!=='diff').every(r=>players[nextIdx].sc[c][r]!==null))){
    nextIdx=(nextIdx+1)%players.length;tries++;
  }
  if(players.length===1||nextIdx===prevIdx){startTurn();return;}
  transNextIdx=nextIdx;
  showTrans(players[prevIdx],players[nextIdx]);
}
function showTrans(prev,next){
  undoState=null;updUndoBtn();show('st');
  const nameColor=prev.isBot?'var(--p)':'var(--g)';
  document.getElementById('tr-who').innerHTML=
    `<span class="tr-prev-name" style="color:${nameColor}">${prev.name}</span>`+
    `<span class="tr-prev-lbl">a joué :</span>`;
  document.getElementById('tr-sc').textContent=grandTot(prev.sc)+' pts';
  const mv=prev.lastMove;
  const moveEl=document.getElementById('tr-move');
  if(mv){
    const s=mv.s;
    let l1;
    if(s==='X'||s===0)l1=`${RLBL[mv.row]} barré`;
    else if('123456'.includes(mv.row))l1=`${s} aux ${RLBL[mv.row]}`;
    else if(mv.row==='plus')l1=`${s} au +`;
    else if(mv.row==='minus')l1=`${s} au −`;
    else l1=`${RLBL[mv.row]}${s>0?' — '+s+' pts':''}`;
    moveEl.innerHTML=`<div class="tr-move-main">${l1}</div><div class="tr-move-col">colonne ${CNAME[mv.col]}</div>`;
  } else {moveEl.innerHTML='';}
  const qEl=document.getElementById('tr-quote');
  if(prev.isBot&&prev.bot){
    const pool=prev.bot.trans;
    qEl.textContent='« '+pool[Math.floor(Math.random()*pool.length)]+' »';
  } else {qEl.textContent='';}
  const nextEl=document.getElementById('tr-next');
  nextEl.textContent=next.name;
  nextEl.style.color=next.isBot?'var(--p)':'var(--g)';
  const f=document.getElementById('tr-fill');
  f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
  if(transTimer)clearTimeout(transTimer);
  transTimer=setTimeout(()=>{transTimer=null;cur=transNextIdx;show('sg');startTurn();},2850);
}
function skipTrans(){
  if(!transTimer)return;
  clearTimeout(transTimer);transTimer=null;
  cur=transNextIdx;show('sg');startTurn();
}

// ══ COACH ════════════════════════════════════════════════
function setCoach(msg){
  const el=document.getElementById('dcmsg');if(!el)return;
  if(!coachOn){el.textContent='';return;}
  el.textContent=msg;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');
}
function coachMsg(){
  const d=dice,sc2=players[cur].sc;
  const c=mkCnt(d),vv=Object.values(c).sort((a,b)=>b-a);
  const uniq=[...new Set(d)].sort((a,b)=>a-b);
  const rl=3-rollN;
  const hasY=sc('yams',d)>0,hasC=sc('carre',d)>0,hasS=sc('suite',d)>0,hasF=sc('full',d)>0;
  const quadV=Object.keys(c).find(k=>+c[k]>=4);
  const triV=Object.keys(c).find(k=>+c[k]>=3);
  const pairs=Object.entries(c).filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]);
  const ideal=new Set(d.filter(v=>v>=2&&v<=5)).size>=4;
  const lseq=(()=>{let b=1,x=1;for(let i=1;i<uniq.length;i++){if(uniq[i]===uniq[i-1]+1){x++;b=Math.max(b,x);}else x=1;}return b;})();
  suggestCell=bestCellFor(d,sc2);
  let msg='';
  if(hasY){const dok=canPlace('desc','yams',sc2,null,rollN,secheOk),aok=canPlace('asc','yams',sc2,null,rollN,secheOk);msg=`🤩 YAMS ! → ${dok?'↓':aok?'↑':'N'}.`;}
  else if(hasC){const dok=canPlace('desc','carre',sc2,null,rollN,secheOk),aok=canPlace('asc','carre',sc2,null,rollN,secheOk);msg=`💪 Carré de ${quadV} ! → ${dok?'↓':aok?'↑':'N'}.`;}
  else if(hasS)msg='🎯 Suite ! → N (↓ vaut 1pt).';
  else if(hasF){const dok=canPlace('desc','full',sc2,null,rollN,secheOk),aok=canPlace('asc','full',sc2,null,rollN,secheOk);msg=`👍 Full ! → ${dok?'↓':aok?'↑':'N'}.`;}
  else if(triV&&rl>=1){const v=+triV,op=pairs.find(([k])=>+k!==v);if(op)msg=`Brelan ${v}+paire → full (88%). Garde tout.`;else msg=v===1?`Brelan 1 → carré ↓ !`:`Brelan de ${v} → carré (29%/2j).`;}
  else if(pairs.length>=2){const[p1,p2]=pairs;msg=`Double paire ${p1[0]}+${p2[0]} → full (~70%). Relance 1.`;}
  else if(ideal)msg='2,3,4,5 → suite ! Garde tout.';
  else if(lseq>=4)msg=`Séquence de ${lseq}. Garde, relance ${5-lseq}.`;
  else if(pairs.length===1){const v=+pairs[0][0];msg=v>=4?`Paire de ${v}. Cherche le 3e dé.`:`Paire de ${v}. Relance 3.`;}
  else{const bn=Math.max(0,...d.map(v=>sc(String(v),d)));msg=bn<20&&rl>0?'Rien. Relance tout (EV≈20pts).':'Garde les plus hauts.';}
  if(rollN>=3&&suggestCell){
    const{col,row,score:s}=suggestCell;
    msg=s>0?`→ ${RLBL[row]} en ${CLBL[col]} (${s}pts)`:`Plan B: barre ${RLBL[row]} en ${CLBL[col]}`;
  }
  if(secheOk&&rollN>=1&&!hasY&&!hasC&&!hasS&&ROWS.some(r=>r!=='bonus'&&r!=='diff'&&sc2['seche'][r]===null))msg+=' | 🎲 Sèche !';
  return msg;
}

// ══ BEST CELL ════════════════════════════════════════════
function bestCellFor(d,sc2){
  return botBestPlacement(d,sc2,announced,secheOk,rollN);
}

// ══ BOT ══════════════════════════════════════════════════
function probOfFigure(d, target, rollsLeft){
  const c=mkCnt(d);
  const vv=Object.values(c).sort((a,b)=>b-a);
  if(target==='yams'){
    if(vv[0]>=5)return 1.0;
    if(vv[0]===4)return rollsLeft>=2?0.31:rollsLeft===1?0.17:0;
    if(vv[0]===3)return rollsLeft>=2?0.12:rollsLeft===1?0.03:0;
    return rollsLeft>=2?0.04:0;
  }
  if(target==='carre'){
    if(vv[0]>=4)return 1.0;
    if(vv[0]===3)return rollsLeft>=2?0.70:rollsLeft===1?0.33:0;
    if(vv[0]===2&&rollsLeft>=2)return 0.20;
    return rollsLeft>=2?0.07:0;
  }
  if(target==='full'){
    if(sc('full',d)>0)return 1.0;
    if(vv[0]>=3)return rollsLeft>=2?0.88:rollsLeft===1?0.66:0;
    if(vv[0]>=2&&vv.length>=2&&vv[1]>=2)return rollsLeft>=2?0.70:rollsLeft===1?0.45:0;
    return rollsLeft>=2?0.37:0.15;
  }
  if(target==='suite'){
    if(sc('suite',d)>0)return 1.0;
    const u=[...new Set(d)].sort((a,b)=>a-b);
    let lseq=1,c2=1;
    for(let i=1;i<u.length;i++){if(u[i]===u[i-1]+1){c2++;lseq=Math.max(lseq,c2);}else c2=1;}
    if(lseq===4)return rollsLeft>=2?0.55:rollsLeft===1?0.27:0;
    if(lseq===3)return rollsLeft>=2?0.22:rollsLeft===1?0.06:0;
    return rollsLeft>=2?0.07:0;
  }
  if('123456'.includes(target)){
    const n=+target,nD=c[n]||0;
    if(nD>=3)return 1.0;
    if(nD===2)return rollsLeft>=2?0.84:rollsLeft===1?0.31:0;
    if(nD===1)return rollsLeft>=2?0.52:rollsLeft===1?0.16:0;
    return rollsLeft>=2?0.20:0.03;
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
function botFallbacks(sc2){
  const fb=[];
  const totalFree=COLS.reduce((a,c)=>a+ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&sc2[c][r]===null).length,0);
  COLS.forEach(col=>{
    if(sc2[col]['1']===null){
      let ob=0,mn=0;
      '23456'.split('').forEach(r=>{const v=sc2[col][r];if(typeof v==='number'){ob+=v;mn+=NM[r];}});
      const onTrack=(ob-mn)>=0;
      if(onTrack)fb.push({col,row:'1',type:'one'});
    }
    if(sc2[col]['plus']===null)fb.push({col,row:'plus',type:'plus'});
    if(sc2[col]['minus']===null)fb.push({col,row:'minus',type:'minus'});
    if(totalFree<10&&sc2[col]['yams']===null)fb.push({col,row:'yams',type:'yams_late'});
  });
  return fb;
}
function botPickTarget(d,sc2,ann,rn,sok){
  const rl=3-rn;
  const c=mkCnt(d),vv=Object.values(c).sort((a,b)=>b-a);
  if(ann)return{target:ann,col:'annonce'};
  if(sc('yams',d)>0)return{target:'yams',col:bestColForFig('yams',sc2,sok)};
  if(sc('suite',d)>0)return{target:'suite',col:bestColForFig('suite',sc2,sok)};
  if(sc('carre',d)>0)return{target:'carre',col:bestColForFig('carre',sc2,sok)};
  if(sc('full',d)>0)return{target:'full',col:bestColForFig('full',sc2,sok)};
  const candidates=[];
  ['yams','carre','suite','full'].forEach(fig=>{
    const col=bestColForFig(fig,sc2,sok);
    if(!col)return;
    const p=probOfFigure(d,fig,rl);
    if(p<=0)return;
    const score=({yams:75,carre:55,suite:50,full:42})[fig];
    const colMult=col==='desc'||col==='asc'?1.5:col==='annonce'?1.3:col==='seche'?1.4:1;
    candidates.push({target:fig,col,prob:p,exp:p*score*colMult});
  });
  const nDesc=nextNeeded('desc',sc2);
  const nAsc=nextNeeded('asc',sc2);
  ['desc','asc'].forEach(dir=>{
    const r=dir==='desc'?nDesc:nAsc;
    if(!r||!'23456'.includes(r))return;
    const p=probOfFigure(d,r,rl);
    if(p<=0.1)return;
    const score=NM[r]+5;
    candidates.push({target:r,col:dir,prob:p,exp:p*score*1.5});
  });
  '23456'.split('').forEach(r=>{
    if(sc2['normal'][r]!==null)return;
    const p=probOfFigure(d,r,rl);
    if(p<=0.3)return;
    candidates.push({target:r,col:'normal',prob:p,exp:p*NM[r]});
  });
  if(candidates.length===0){
    const pairV=Object.keys(c).find(k=>c[k]>=2);
    if(pairV)return{target:pairV,col:'normal'};
    return{target:String(Math.max(...d)),col:'normal'};
  }
  candidates.sort((a,b)=>b.exp-a.exp);
  return candidates[0];
}
function bestColForFig(fig,sc2,sok){
  if(sok&&sc2['seche'][fig]===null)return'seche';
  if(canPlaceCol('desc',fig,sc2))return'desc';
  if(canPlaceCol('asc',fig,sc2))return'asc';
  if(sc2['normal'][fig]===null)return'normal';
  return null;
}
function canPlaceCol(col,row,sc2){
  if(sc2[col][row]!==null)return false;
  if(col==='desc'){const i=DESC.indexOf(row);if(i<0)return false;return DESC.slice(0,i).every(r=>sc2[col][r]!==null);}
  if(col==='asc'){const i=ASC.indexOf(row);if(i<0)return false;return ASC.slice(0,i).every(r=>sc2[col][r]!==null);}
  return true;
}
function nextNeeded(col,sc2){
  const order=col==='desc'?DESC:ASC;
  return order.find(r=>sc2[col][r]===null)||null;
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
  const u=[...new Set(d)].sort((a,b)=>a-b);
  let lseq=1,c2=1;
  for(let i=1;i<u.length;i++){if(u[i]===u[i-1]+1){c2++;lseq=Math.max(lseq,c2);}else c2=1;}
  if(lseq>=4&&sc2['annonce']['suite']===null)return'suite';
  for(const n of [6,5,4,3,2]){
    if((c[n]||0)>=2&&sc2['annonce'][String(n)]===null){
      const r=String(n);
      if(sc2['desc'][r]===null||sc2['asc'][r]===null||sc2['normal'][r]===null){
        const canDesc=canPlaceCol('desc',r,sc2);
        const canAsc=canPlaceCol('asc',r,sc2);
        if(!canDesc&&!canAsc&&sc2['normal'][r]!==null)return r;
      }
    }
  }
  return null;
}
// ── Culman : cases sûres à 100% (excl. +, -, 1) ──────────
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
  return items.sort((a,b)=>b.curScore-a.curScore);
}
// ── Culman : case de repli (+/- > 1 > yams × asc>desc>seche>ann>norm)
function culmanGetFallback(sc2,ann,sok){
  const rowPrio=['plus','minus','1','yams'];
  const colPrio=['asc','desc','seche','annonce','normal'];
  for(const row of rowPrio)
    for(const col of colPrio){
      if(col==='annonce'&&!ann)continue;
      if(canPlace(col,row,sc2,ann,3,sok))return{col,row};
    }
  return null;
}
// ── Culman : EV pour la sélection hors 100% ──────────────
function culmanEval(d,sc2,rollsLeft,ann,sok,rn){
  const totalFree=COLS.reduce((a,c)=>a+ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&sc2[c][r]===null).length,0);
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
    const colW={desc:7.67,asc:7.67,annonce:4.61,seche:1.06,normal:1.0}[col];
    items.push({col,row,ev:prob*expScore*colW,prob,expScore,curScore:sc(row,d)});
  });});
  return items.sort((a,b)=>b.ev-a.ev);
}
function culmanExpScore(row,d){
  const c=mkCnt(d);
  if(row==='yams'){const mv=+Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||4;return mv*4+50;}
  if(row==='carre'){const mv=+Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||4;return mv*4+40;}
  if(row==='full')return sum(d)+20;
  if(row==='suite')return 50;
  if('123456'.includes(row)){const n=+row;const cnt=c[n]||0;return cnt>=3?n*cnt+12:n*3.5;}
  if(row==='plus')return 0;
  if(row==='minus')return 0;
  return sc(row,d);
}

function botQuote(bot,sc2){
  const tot=grandTot(sc2),htot=grandTot(players[0].sc),diff=tot-htot;
  const pool=diff>15?bot.ahead:diff<-15?bot.behind:bot.equal;
  const tpl=pool[Math.floor(Math.random()*pool.length)];
  return tpl.replace('{d}',diff>0?'+'+diff:diff).replace('{a}',Math.abs(diff)).replace('{t}',tot);
}
function botTurn(){
  const p=players[cur];const sc2=p.sc;const bot=p.bot;
  let d=[0,0,0,0,0],bAnn=null,bSok=false;
  const rolls=[];let bKept=[false,false,false,false,false];
  const auto=autoAnn(sc2);
  const directFree=COLS.some(c=>c!=='annonce'&&c!=='seche'&&ROWS.some(r=>r!=='bonus'&&r!=='diff'&&canPlaceCol(c,r,sc2)));
  const secheSafeFree=ROWS.some(r=>r!=='bonus'&&r!=='diff'&&!FIGS.includes(r)&&sc2['seche'][r]===null);
  const secheFigFree=FIGS.some(r=>sc2['seche'][r]===null);
  if(!auto&&!directFree&&!secheSafeFree&&!secheFigFree){
    const annPrio=['1','2','3','4','5','6','plus','minus','full','suite','carre','yams'];
    for(const r of annPrio){if(sc2['annonce'][r]===null){bAnn=r;break;}}
  }
  if(bot.id==='culman'){
    // ── Stratégie Culman v2 ───────────────────────────────
    let culTarget=null,upgradeMode=false;
    culmanFallbackCell=null;
    for(let rn=1;rn<=3;rn++){
      for(let i=0;i<5;i++)if(!bKept[i])d[i]=Math.floor(Math.random()*6)+1;
      const nR=bKept.filter(k=>!k).length;
      bSok=(rn===1||nR===5);
      if(rn===1){
        if(!bAnn){if(auto)bAnn=auto;else{const t=botShouldAnnounce(d,sc2);if(t)bAnn=t;}}
        culmanFallbackCell=culmanGetFallback(sc2,bAnn,bSok);
      }
      const rl=3-rn;
      const secheAvail=ROWS.some(r=>r!=='bonus'&&r!=='diff'&&sc2['seche'][r]===null);
      // Vérifier cases à 100% (sauf si en mode amélioration)
      if(!upgradeMode){
        const sure=culman100(d,sc2,bAnn,bSok,rn);
        if(sure.length>0){
          const best=sure[0];
          const isSeche100=bSok&&sc2['seche'][best.row]===null&&best.row==='carre';
          if(rl===0||isSeche100||best.row==='yams'||best.row==='suite'||best.row==='full'){
            // Poser immédiatement
            culTarget=best;
            rolls.push({d:[...d],kept:[false,false,false,false,false],rn});break;
          } else if(best.row==='carre'&&rl>0){
            // Carré → tenter yams avec le dé restant
            culTarget={col:best.col,row:'yams',ev:999,curScore:sc('yams',d)};
            upgradeMode=true;
          } else {
            // Chiffre à 100% → garder, tenter d'améliorer
            culTarget=best;upgradeMode=true;
          }
        }
      }
      // 3e lancer : vérification sèche standard
      if(rn===3){
        const bestNow=Math.max(0,...COLS.flatMap(c=>ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&canPlace(c,r,sc2,bAnn,rn,bSok)).map(r=>sc(r,d))));
        {const hasContract='123456'.split('').some(r=>(mkCnt(d)[+r]||0)>=3);
        if(secheAvail&&bestNow<20&&!bAnn&&!hasContract){d=d.map(()=>Math.floor(Math.random()*6)+1);bSok=true;}}
        rolls.push({d:[...d],kept:[false,false,false,false,false],rn});break;
      }
      // Sélection par EV (si pas en mode amélioration)
      if(!upgradeMode){
        const ev=culmanEval(d,sc2,rl,bAnn,bSok,rn);
        if(secheAvail&&!bAnn&&(ev.length===0||ev[0].ev<6)){  // seuil EV optimisé
          // EV trop bas → tout relancer pour sèche
          bKept=[false,false,false,false,false];
          rolls.push({d:[...d],kept:[...bKept],rn});
          continue;
        }
        if(ev.length>0&&(!culTarget||ev[0].ev>(culTarget.ev||0)))culTarget=ev[0];
      }
      const keep=culTarget?botKeep(d,culTarget.row):[false,false,false,false,false];
      rolls.push({d:[...d],kept:[...keep],rn});
      bKept=keep;if(keep.every(k=>k))break;
    }
  } else {
    // ── Stratégie par défaut ──
    for(let rn=1;rn<=3;rn++){
      for(let i=0;i<5;i++)if(!bKept[i])d[i]=Math.floor(Math.random()*6)+1;
      const nR=bKept.filter(k=>!k).length;
      bSok=(rn===1||nR===5);
      if(rn===1&&!bAnn){
        if(auto){bAnn=auto;}
        else{const annTarget=botShouldAnnounce(d,sc2);if(annTarget)bAnn=annTarget;}
      }
      if(rn===3){
        const sf=ROWS.some(r=>r!=='bonus'&&r!=='diff'&&sc2['seche'][r]===null);
        const bestNow=Math.max(0,...COLS.flatMap(col=>ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&canPlace(col,r,sc2,bAnn,rn,bSok)).map(r=>sc(r,d))));
        {const hasContract='123456'.split('').some(r=>(mkCnt(d)[+r]||0)>=3);
        if(sf&&bestNow<20&&!bAnn&&!hasContract){d=d.map(()=>Math.floor(Math.random()*6)+1);bSok=true;}}
        rolls.push({d:[...d],kept:[false,false,false,false,false],rn});break;
      }
      const pick=botPickTarget(d,sc2,bAnn,rn,bSok);
      const keep=botKeep(d,pick.target);
      rolls.push({d:[...d],kept:[...keep],rn});
      bKept=keep;if(keep.every(k=>k))break;
    }
  }
  const finalD=d,finalSok=bSok,finalAnn=bAnn;
  let ri=0;
  function showRoll(){
    if(ri>=rolls.length){setTimeout(()=>botPlace(finalD,sc2,bAnn,finalSok,bot),400);return;}
    const roll=rolls[ri++];
    dice=[...roll.d];kept=[...roll.kept];rollN=roll.rn;
    const prevKept=ri<=1?null:rolls[ri-2].kept;
    const nThrown=prevKept?prevKept.filter(k=>!k).length:5;
    secheOk=(nThrown===5);announced=finalAnn;hasRolled=true;
    aDice(nThrown);
    const drow=document.getElementById('drow');
    const ex=drow?.querySelectorAll('.die');
    for(let i=0;i<5;i++){
      const el=ex?.[i];if(!el)continue;
      const wasThrown=!prevKept||!prevKept[i];
      const cls='die'+(wasThrown?' roll':roll.kept[i]?' kept':'');
      if(wasThrown){el.className=cls.replace(' roll','');void el.offsetWidth;}
      el.className=cls;
      const face=DP[roll.d[i]]||[];
      el.querySelectorAll('.dot').forEach((d,j)=>d.className='dot'+(face.includes(j)?'':' off'));
    }
    updBadge();
    setTimeout(()=>{
      const ex2=drow?.querySelectorAll('.die');
      for(let i=0;i<5;i++){const e=ex2?.[i];if(e)e.className='die'+(roll.kept[i]?' kept':' lk');}
      renderTable();detectFx();
      if(roll.rn===1&&finalAnn)aAnnounce();
      if(Math.random()<.45)
        setCoach(p.name+' : « '+bot.dice[Math.floor(Math.random()*bot.dice.length)]+' »');
    },720);
    setTimeout(showRoll,1150);
  }
  showRoll();
}
function botPlace(d,sc2,ann,sok,bot){
  const p=players[cur];
  let best=botBestPlacement(d,sc2,ann,sok);
  if(!best&&ann){best={col:'annonce',row:ann,score:sc(ann,d)};}
  if(!best){
    for(const col of COLS){
      for(const row of ROWS){
        if(row==='bonus'||row==='diff')continue;
        if(!canPlace(col,row,sc2,ann,3,sok))continue;
        if(col==='seche'&&FIGS.includes(row)&&sc(row,d)===0)continue;
        best={col,row,score:sc(row,d)};break;
      }
      if(best)break;
    }
  }
  if(!best){doNext();return;}
  const{col,row,score:s}=best;
  dice=[...d];hasRolled=true;rollN=3;secheOk=sok;announced=ann;kept=[false,false,false,false,false];
  botTarget={col,row};
  renderDice(false);renderTable();
  setTimeout(()=>{
    botTarget=null;
    sc2[col][row]=s;updAll(col,sc2);
    p.lastMove={col,row,s};
    aPlace();
    hasRolled=false;renderDice(false);renderTable();
    const m=s>0?`${p.name} → ${RLBL[row]} en ${CLBL[col]} (${s}pts) 🤓`:`${p.name} barre ${RLBL[row]} en ${CLBL[col]} 🤓`;
    setCoach(m);
    setTimeout(()=>setCoach(p.name+' : « '+botQuote(bot,sc2)+' »'),1000);
    setTimeout(doNext,2100);
  },700);
}
function botBestPlacement(d,sc2,ann,sok,rn=3){
  if(ann){return{col:'annonce',row:ann,score:sc(ann,d)};}
  for(const fig of ['yams','carre','suite','full']){
    if(sc(fig,d)>0){
      const col=bestColForFig(fig,sc2,sok);
      if(col)return{col,row:fig,score:sc(fig,d)};
    }
  }
  const c=mkCnt(d);
  let bestPos=null,bestVal=-Infinity;
  let hasDirectOption=false;
  COLS.forEach(col=>{
    ROWS.forEach(row=>{
      if(row==='bonus'||row==='diff')return;
      if(!canPlace(col,row,sc2,ann,rn,sok))return;
      if(col==='seche'&&FIGS.includes(row)&&sc(row,d)===0)return;
      hasDirectOption=true;
      const s=sc(row,d);
      let val=botEvalPlacement(col,row,s,d,sc2);
      if(val>bestVal){bestVal=val;bestPos={col,row,score:s};}
    });
  });
  if(!hasDirectOption&&sok){
    for(const fig of FIGS){
      if(sc2['seche'][fig]===null){return{col:'seche',row:fig,score:0};}
    }
  }
  // Culman : utiliser la case de repli si aucune option satisfaisante
  if(!bestPos&&culmanFallbackCell){
    const f=culmanFallbackCell;
    if(canPlace(f.col,f.row,sc2,ann,3,sok))
      return{col:f.col,row:f.row,score:sc(f.row,d)};
  }
  return bestPos;
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
      if(proj>=60)val+=30*cp;
      else if(proj>=54)val+=24*cp;
      else if(proj>=48)val+=16*cp;
      else if(proj>=42)val+=10*cp;
      else val+=5*cp;
      return val;
    }
    if(nD===2){
      if(col==='desc'||col==='asc'){const bR=bonusReach(col,sc2);if(bR)return s*0.05*cp;return s*0.3*cp;}
      return s*0.4*cp;
    }
    if(col==='desc'||col==='asc')return s*0.02;
    return s*0.08*cp;
  }
  if(row==='1'){
    const nD=c[1]||0;
    if(nD>=4){
      let val=s*cp;
      const proj=bonusProj(col,sc2,row,s);
      if(proj>=60)val+=30*cp;
      else if(proj>=54)val+=24*cp;
      else if(proj>=48)val+=16*cp;
      else if(proj>=42)val+=10*cp;
      else val+=5*cp;
      return val;
    }
    let ob=0,mn=0;
    '23456'.split('').forEach(r=>{const v=sc2[col][r];if(typeof v==='number'){ob+=v;mn+=NM[r];}});
    const onTrack=(ob-mn)>=0;
    return onTrack?s*1.2*cp:s*0.4*cp;
  }
  if(row==='plus'){
    if(s===0)return -200;
    const totalFree=COLS.reduce((a,c2)=>a+ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&sc2[c2][r]===null).length,0);
    if(col==='normal'&&totalFree>10)return -5;
    return s*0.7*cp;
  }
  if(row==='minus'){
    if(s===0)return -200;
    const totalFree=COLS.reduce((a,c2)=>a+ROWS.filter(r=>r!=='bonus'&&r!=='diff'&&sc2[c2][r]===null).length,0);
    if(col==='normal'&&totalFree>10)return -5;
    return Math.max(0,35-s)*cp;
  }
  return s*cp;
}

// ══ BADGES ═══════════════════════════════════════════════
function loadBadgeData(){try{return JSON.parse(localStorage.getItem(BADGE_KEY))||{obtained:[]};}catch{return{obtained:[]};}}
function saveBadgeData(d){try{localStorage.setItem(BADGE_KEY,JSON.stringify(d));}catch(e){}}
function hasBadge(id){return loadBadgeData().obtained.includes(id);}
function loadStats(){try{return JSON.parse(localStorage.getItem(STATS_KEY))||{partiesJouees:0};}catch{return{partiesJouees:0};}}
function saveStats(s){try{localStorage.setItem(STATS_KEY,JSON.stringify(s));}catch(e){}}

let _toastQueue=[],_toastBusy=false;
function showBadgeToast(badge){
  _toastQueue.push(badge);
  if(!_toastBusy)_processToast();
}
function _processToast(){
  if(!_toastQueue.length){_toastBusy=false;return;}
  _toastBusy=true;
  const b=_toastQueue.shift();
  const el=document.getElementById('badge-toast');
  if(!el){_toastBusy=false;return;}
  el.querySelector('.bt-em').textContent=b.em;
  el.querySelector('.bt-name').textContent=b.name+(b.count>1?' ×'+b.count:'');
  el.querySelector('.bt-label').textContent=b.isNew?'Badge débloqué !':'À nouveau !';
  el.classList.add('show');
  setTimeout(()=>{el.classList.remove('show');setTimeout(_processToast,450);},2600);
}

function checkBadges(humanSc,score,beatenBots){
  const data=loadBadgeData();
  const stats=loadStats();
  stats.partiesJouees=(stats.partiesJouees||0)+1;
  saveStats(stats);
  const gp=stats.partiesJouees;
  const newBadges=[];
  data.counts=data.counts||{};
  const award=(id)=>{
    if(!data.obtained.includes(id)){
      data.obtained.push(id);data.counts[id]=1;
      newBadges.push({id,count:1,isNew:true});
    }else{
      data.counts[id]=(data.counts[id]||1)+1;
      newBadges.push({id,count:data.counts[id],isNew:false});
    }
  };

  // Régularité
  [{id:'r10',n:10},{id:'r20',n:20},{id:'r30',n:30},{id:'r40',n:40},{id:'r50',n:50},{id:'r60',n:60}]
    .forEach(m=>{if(gp===m.n)award(m.id);});

  // Performance
  if(score>1250)award('yams_master');
  if(score<800)award('pojuste');
  const yamsCount=COLS.reduce((a,c)=>{const v=humanSc[c]['yams'];return a+(typeof v==='number'&&v>0?1:0);},0);
  if(yamsCount>=3)award('bol');
  if(gameEvents.boumbacar)award('boumbacar');
  if(gameEvents.yams_seche)award('yams_seche');

  // Technique
  const figs=['full','suite','carre'];
  if(COLS.every(c=>humanSc[c]['bonus']!==30))award('brasgueille');
  if(COLS.every(c=>figs.every(f=>humanSc[c][f]!=='X')))award('propre');
  if(COLS.some(c=>humanSc[c]['bonus']===30&&figs.every(f=>humanSc[c][f]!=='X')))award('col_parfaite');
  if(COLS.every(c=>{const v=humanSc[c]['suite'];return typeof v==='number'&&v>0;}))award('suite_ideas');
  if(COLS.every(c=>humanSc[c]['bonus']===30))award('madame');
  if(gameEvents.seum_master)award('seum_master');

  // Bots
  const botMap={blaise:'beat_blaise',culman:'beat_culman',diceman:'beat_diceman',
    lucky:'beat_lucky',rosie:'beat_rosie',axiom:'beat_axiom'};
  beatenBots.forEach(botId=>{if(botMap[botId])award(botMap[botId]);});

  saveBadgeData(data);
  newBadges.forEach(({id,count,isNew})=>{
    const b=BADGES.find(x=>x.id===id);
    if(b)_toastQueue.push({...b,count,isNew});
  });
  if(!_toastBusy)_processToast();
  return newBadges;
}

function showBadges(){
  const data=loadBadgeData();
  const stats=loadStats();
  const gp=stats.partiesJouees||0;
  const cats=[
    {id:'regularite',label:'Régularité'},
    {id:'performance',label:'Performance'},
    {id:'technique',label:'Technique'},
    {id:'bots',label:'Tableau de chasse'},
  ];
  // Régularité : afficher un seul badge évolutif
  const regLevels=[{id:'r10',em:'⚀',n:10},{id:'r20',em:'⚁',n:20},{id:'r30',em:'⚂',n:30},
    {id:'r40',em:'⚃',n:40},{id:'r50',em:'⚄',n:50},{id:'r60',em:'⚅',n:60}];
  const regCurrent=regLevels.slice().reverse().find(l=>gp>=l.n);
  const regNext=regLevels.find(l=>gp<l.n);
  const regHtml=`<div class="badge-item${regCurrent?' on':''}">
    <span class="badge-em">${regCurrent?regCurrent.em:'⚀'}</span>
    <span class="badge-name">${regCurrent?BADGES.find(b=>b.id===regCurrent.id).name:'Régulier'}</span>
    <span class="badge-desc">${regCurrent?gp+' parties jouées':`${regNext?regNext.n:10} parties pour débloquer`}</span>
  </div>`;

  let html='';
  cats.forEach(cat=>{
    const badges=cat.id==='regularite'?[]
      :BADGES.filter(b=>b.cat===cat.id);
    html+=`<div class="badge-cat"><div class="badge-cat-label">${cat.label}</div><div class="badge-grid">`;
    if(cat.id==='regularite'){html+=regHtml;}
    else{
      badges.forEach(b=>{
        const got=data.obtained.includes(b.id);
        const cnt=data.counts?.[b.id]||0;
        html+=`<div class="badge-item${got?' on':''}">
          <span class="badge-em">${b.em}</span>
          <span class="badge-name">${b.name}${cnt>1?`<span class="badge-count"> ×${cnt}</span>`:''}</span>
          <span class="badge-desc">${b.desc}</span>
        </div>`;
      });
    }
    html+='</div></div>';
  });
  document.getElementById('sb-list').innerHTML=html;
  show('sb');
}

// ══ HIGHSCORES ═══════════════════════════════════════════
const HS_KEY='yams_hs';
function loadHS(){try{return(JSON.parse(localStorage.getItem(HS_KEY))||[]).map(e=>({...e,score:e.score??e.pts??0}));}catch{return[];}}
function saveHS(name,score,grid){
  const hs=loadHS();
  const d=new Date();
  const date=d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'});
  hs.push({name,score,date,grid:grid||null});
  hs.sort((a,b)=>b.score-a.score);
  hs.splice(10);
  localStorage.setItem(HS_KEY,JSON.stringify(hs));
}
function isNewRecord(score){
  const hs=loadHS();
  return hs.length<10||score>hs[hs.length-1].score;
}
function showHS(){showLocalHS();show('sh');}
function showLocalHS(){
  document.getElementById('sh-tab-local').classList.add('on');
  document.getElementById('sh-tab-board').classList.remove('on');
  document.getElementById('sh-clear').style.display='';
  const hs=loadHS();
  const medals=['🥇','🥈','🥉'];
  const rows=hs.length===0
    ?'<div class="sh-empty">Aucun record pour l\'instant.<br>Lance une partie !</div>'
    :hs.map((e,i)=>`
      <div class="sh-row${i===0?' gold':''}">
        <span class="sh-rank">${medals[i]||i+1}</span>
        <span class="sh-name">${e.name}</span>
        <span class="sh-pts">${e.score} pts</span>
        <span class="sh-date">${e.date}</span>
        ${e.grid?`<button class="sh-grid-btn" onclick="showRecordGrid(${i})">📋</button>`:''}
      </div>`).join('');
  document.getElementById('sh-list').innerHTML=rows;
}
function showRecordGrid(i){
  const hs=loadHS();const e=hs[i];if(!e||!e.grid)return;
  document.getElementById('mg-name').textContent=e.name;
  document.getElementById('mg-meta').textContent=e.date+' — '+e.score+' pts';
  document.getElementById('mg-tbl').innerHTML=renderGridHTML(e.grid);
  document.getElementById('mg').classList.add('on');
}
function fmtDate(iso){
  if(!iso)return'—';
  return new Date(iso).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',timeZone:'Europe/Paris'});
}
function getWeekStart(){
  // Use Paris local time to determine the Monday boundary
  const paris=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Paris'}));
  const day=paris.getDay();
  paris.setDate(paris.getDate()+(day===0?-6:1-day));
  paris.setHours(0,0,0,0);
  // Convert Paris midnight back to UTC ISO for Supabase filter
  const offset=new Date().getTime()-new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Paris'})).getTime();
  return new Date(paris.getTime()+offset).toISOString();
}
let boardEntries=[];
function showLeaderboard(){
  document.getElementById('sh-tab-local').classList.remove('on');
  document.getElementById('sh-tab-board').classList.add('on');
  document.getElementById('sh-clear').style.display='none';
  document.getElementById('sh-list').innerHTML=`
    <div class="sh-subtabs">
      <button class="sh-subtab on" id="sh-sub-all" onclick="loadGlobalLB('all')">Depuis toujours</button>
      <button class="sh-subtab" id="sh-sub-week" onclick="loadGlobalLB('week')">Cette semaine</button>
    </div>
    <div id="sh-board-list"><div class="sh-empty">Chargement…</div></div>`;
  loadGlobalLB('all');
}
async function loadGlobalLB(scope){
  document.getElementById('sh-sub-all')?.classList.toggle('on',scope==='all');
  document.getElementById('sh-sub-week')?.classList.toggle('on',scope==='week');
  document.getElementById('sh-board-list').innerHTML='<div class="sh-empty">Chargement…</div>';
  let url=`${SB_URL}/scores?select=pseudo,score,created_at,grid&order=score.desc&limit=20`;
  if(scope==='week')url=`${SB_URL}/scores?select=pseudo,score,created_at,grid&created_at=gte.${getWeekStart()}&order=score.desc&limit=20`;
  try{
    const r=await fetch(url,{headers:SB_HDR});
    boardEntries=r.ok?await r.json():[];
    const medals=['🥇','🥈','🥉'];
    document.getElementById('sh-board-list').innerHTML=boardEntries.length
      ?boardEntries.map((e,i)=>`
        <div class="sh-row${i===0?' gold':''}">
          <span class="sh-rank">${medals[i]||i+1}</span>
          <span class="sh-name">${e.pseudo}</span>
          <span class="sh-pts">${e.score} pts</span>
          <span class="sh-date">${fmtDate(e.created_at)}</span>
          ${e.grid?`<button class="sh-grid-btn" onclick="showBoardGrid(${i})">📋</button>`:''}
        </div>`).join('')
      :'<div class="sh-empty">Aucun score pour cette période.</div>';
  }catch(e){document.getElementById('sh-board-list').innerHTML='<div class="sh-empty">Erreur de chargement.</div>';}
}
function showBoardGrid(i){
  const e=boardEntries[i];if(!e||!e.grid)return;
  document.getElementById('mg-name').textContent=e.pseudo;
  document.getElementById('mg-meta').textContent=fmtDate(e.created_at)+' — '+e.score+' pts';
  document.getElementById('mg-tbl').innerHTML=renderGridHTML(e.grid);
  document.getElementById('mg').classList.add('on');
}
function renderGridHTML(sc2){
  let h='<thead><tr><th class="cl"></th>';
  COLS.forEach(c=>h+=`<th class="cc"><span class="cname">${CLBL[c]}</span></th>`);
  h+='</tr></thead><tbody>';
  ROWS.forEach(row=>{
    const sep=(row==='plus'||row==='full')?' sep':'';
    h+=`<tr class="${sep}"><td class="cl"><span class="rn">${RLBL[row]}</span></td>`;
    COLS.forEach(col=>{
      const v=sc2[col][row];
      let cell;
      if(row==='bonus')cell=v!==null?`<span class="cell ${v===30?'vf':'vx'}">${v===30?'+30':'—'}</span>`:`<span class="cell vbonus">${numTot(col,sc2)}/60</span>`;
      else if(row==='diff')cell=v!==null?`<span class="cell ${v>=0?'vf':'vx'}">${v>=0?'+'+v:v}</span>`:`<span class="cell ve">—</span>`;
      else cell=v!==null?`<span class="cell ${v==='X'||v===0?'vx':'vf'}">${v==='X'||v===0?'✕':v}</span>`:`<span class="cell ve">·</span>`;
      h+=`<td>${cell}</td>`;
    });
    h+='</tr>';
    if(row==='6'){
      h+='<tr class="rnt"><td class="cl"><span class="rn">Sous-total</span></td>';
      COLS.forEach(col=>h+=`<td><div class="cnt"><span class="cntd">${numTot(col,sc2)}</span></div></td>`);
      h+='</tr>';
    }
  });
  h+=`<tr class="rtot"><td class="cl"><span class="rn" style="font-weight:700">Total</span></td>`;
  COLS.forEach(c=>h+=`<td><span class="ctot">${colTot(c,sc2)}</span></td>`);
  h+=`</tr><tr class="rgr"><td class="cl" colspan="${COLS.length+1}">`;
  h+=`<span style="font-size:9px;color:var(--mu)">Total : </span><span class="cgr">${grandTot(sc2)} pts</span></td></tr>`;
  h+='</tbody>';return h;
}
function clearHS(){
  if(!confirm('Effacer tous les records ?'))return;
  localStorage.removeItem(HS_KEY);
  showHS();
}

// ══ LEADERBOARD SUBMIT ═══════════════════════════════════
let _submitIdx=0;
function showSubmitModal(idx=0){
  const sub=window._allSubmits?window._allSubmits[idx]:pendingSubmit;
  if(!sub)return;
  _submitIdx=idx;pendingSubmit=sub;
  document.getElementById('ms-pseudo').value=sub.name;
  document.getElementById('ms-err').textContent='';
  document.getElementById('ms-submit').disabled=false;
  document.getElementById('ms-submit').textContent='Publier';
  document.getElementById('ms').classList.add('on');
}
async function doSubmitScore(){
  const btn=document.getElementById('ms-submit');
  const pseudo=document.getElementById('ms-pseudo').value.trim()||'Anonyme';
  btn.disabled=true;btn.textContent='…';
  const ok=await submitToLeaderboard(pseudo,pendingSubmit.score,pendingSubmit.date,pendingSubmit.grid,pendingSubmit.opponents,pendingSubmit.duration_s);
  btn.disabled=false;btn.textContent='Publier';
  if(ok){
    document.getElementById('ms').classList.remove('on');
    const multiBtn=document.getElementById(`se-submit-${_submitIdx}`);
    if(multiBtn){multiBtn.textContent='✅ Publié !';multiBtn.disabled=true;}
    else{document.getElementById('se-submit').style.display='none';}
    pendingSubmit=null;
    if(!window._allSubmits)document.getElementById('erecord').innerHTML='<div class="erecord">✅ Score publié !</div>';
  }else{
    document.getElementById('ms-err').textContent='Erreur de connexion. Réessaie.';
  }
}

// ══ DAILY MODE ═══════════════════════════════════════════
function mulberry32(seed){
  let s=seed;
  return function(){
    s|=0;s=s+0x6D2B79F5|0;
    let t=Math.imul(s^s>>>15,1|s);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;
  };
}
function getDailyDateStr(){
  const d=new Date();
  return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getDailySeed(){
  const d=new Date();
  return parseInt(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);
}
function loadDailyState(){try{return JSON.parse(localStorage.getItem(DAILY_KEY));}catch{return null;}}
function saveDailyState(obj){try{localStorage.setItem(DAILY_KEY,JSON.stringify(obj));}catch(e){}}
function saveDailyGame(){
  if(!isDailyMode||over)return;
  try{
    localStorage.setItem(DAILY_SAVE_KEY,JSON.stringify({
      date:getDailyDateStr(),dailyTurnIndex,dailyTurnPool:[...dailyTurnPool],
      players:players.map(p=>({name:p.name,sc:p.sc,lastMove:p.lastMove})),
      cur,rollN,dice:[...dice],kept:[...kept],hasRolled,secheOk,announced,coachOn
    }));
  }catch(e){}
}
function loadDailyGame(){
  try{
    const s=JSON.parse(localStorage.getItem(DAILY_SAVE_KEY));
    if(!s||s.date!==getDailyDateStr())return false;
    const ds=loadDailyState();
    if(ds&&ds.date===s.date&&ds.played)return false;
    const rng=mulberry32(getDailySeed());
    for(let i=0;i<s.dailyTurnIndex*15;i++)rng();
    isDailyMode=true;seededRng=rng;
    dailyTurnIndex=s.dailyTurnIndex;dailyTurnPool=s.dailyTurnPool;
    players=s.players.map(p=>({name:p.name,sc:p.sc,isBot:false,bot:null,lastMove:p.lastMove}));
    cur=s.cur;over=false;rollN=s.rollN;dice=s.dice;kept=s.kept;
    hasRolled=s.hasRolled;secheOk=s.secheOk;announced=s.announced;coachOn=s.coachOn;
    mode='solo';return true;
  }catch(e){localStorage.removeItem(DAILY_SAVE_KEY);return false;}
}
function _restoreDailyUI(){
  buildTabs();show('sg');
  document.getElementById('dname').textContent=players[cur].name;
  const br=document.getElementById('broll');
  br.disabled=rollN>=3;
  br.innerHTML=rollN>=3?'<span>✓</span><span>Place</span>':'<span>🎲</span><span>Lancer</span>';
  document.getElementById('ctog').classList.toggle('on',coachOn);
  updBadge();updCoups();updTabs();renderDice(false);renderTable();
  if(hasRolled&&coachOn)setCoach(coachMsg());
  else setCoach('À toi '+players[cur].name+' !');
}
function launchDaily(){
  const dateStr=getDailyDateStr();
  const ds=loadDailyState();
  if(ds&&ds.date===dateStr&&ds.played){showDailyLeaderboard(ds.score);return;}
  if(loadDailyGame()){_restoreDailyUI();return;}
  isDailyMode=true;
  gameStartTime=Date.now();
  trackEvent('game_start','daily',1);
  seededRng=mulberry32(getDailySeed());
  dailyTurnPool=[];dailyTurnIndex=0;
  mode='solo';coachOn=false;
  const savedPseudo=document.getElementById('dname-daily')?.value.trim()||localStorage.getItem(PLAYER_NAME_KEY)||localStorage.getItem(DAILY_PSEUDO_KEY)||'';
  gameEvents={boumbacar:false,yams_seche:false,seum_master:false};
  over=false;cur=0;
  players=[{name:savedPseudo||'Joueur',sc:mkSc(),isBot:false,bot:null,lastMove:null}];
  localStorage.removeItem(SAVE_KEY);
  buildTabs();show('sg');startTurn();
}
async function submitDailyScore(){
  const btn=document.getElementById('sd-submit-btn');
  const pseudo=document.getElementById('sd-pseudo-end').value.trim()||'Anonyme';
  btn.disabled=true;btn.textContent='…';
  localStorage.setItem(PLAYER_NAME_KEY,pseudo);
  localStorage.setItem(DAILY_PSEUDO_KEY,pseudo);
  try{
    const ds=loadDailyState();
    const r=await fetch(SB_URL+'/daily_scores',{
      method:'POST',
      headers:{...SB_HDR,'Prefer':'return=minimal,resolution=ignore-duplicates'},
      body:JSON.stringify({pseudo,score:ds?.score||0,date:getDailyDateStr(),seed:getDailySeed(),duration_s:ds?.duration_s||null})
    });
    btn.disabled=false;
    if(r.ok){
      document.getElementById('se-daily-submit').style.display='none';
      document.getElementById('se-daily-ok').style.display='';
    }else{btn.textContent='Publier';}
  }catch(e){btn.disabled=false;btn.textContent='Publier';}
}
async function loadDailyHistory(selectedDate){
  const today=new Date();const DAYS=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const dates=[];
  for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);dates.push(d.toISOString().split('T')[0]);}
  const el=document.getElementById('sd-history');if(!el)return;
  el.innerHTML='<div class="sh-empty" style="font-size:10px">…</div>';
  try{
    const r=await fetch(`${SB_URL}/daily_scores?select=pseudo,score,date&date=gte.${dates[0]}&order=date.asc,score.desc`,{headers:SB_HDR});
    const entries=r.ok?await r.json():[];
    const winners={};
    entries.forEach(e=>{if(!winners[e.date])winners[e.date]=e;});
    const todayStr=getDailyDateStr();
    el.innerHTML=dates.map(ds=>{
      const w=winners[ds];const d=new Date(ds+'T12:00:00');
      const label=DAYS[d.getDay()];const isToday=ds===todayStr;const isSel=ds===selectedDate;
      return`<div class="dhist-day${isToday?' dhist-today':''}${isSel?' dhist-selected':''}" onclick="loadDailyLB('${ds}')">
        <span class="dhist-label">${label}</span>
        ${w?`<span class="dhist-name">${w.pseudo}</span><span class="dhist-pts">${w.score}</span>`:'<span class="dhist-empty">—</span>'}
      </div>`;
    }).join('');
  }catch(e){el.innerHTML='';}
}
async function loadDailyLB(dateStr){
  const todayStr=getDailyDateStr();const isToday=dateStr===todayStr;
  document.getElementById('sd-date').textContent=dateStr.split('-').reverse().join('/');
  const ds=loadDailyState();
  const myScore=isToday?(ds?.score??null):null;
  document.getElementById('sd-my-score').textContent=myScore!=null?myScore+' pts':'—';
  loadDailyHistory(dateStr);
  document.getElementById('sd-list').innerHTML='<div class="sh-empty">Chargement…</div>';
  try{
    const r=await fetch(`${SB_URL}/daily_scores?select=pseudo,score,created_at&date=eq.${dateStr}&order=score.desc&limit=10`,{headers:SB_HDR});
    const entries=r.ok?await r.json():[];
    const myPseudo=localStorage.getItem(PLAYER_NAME_KEY)||localStorage.getItem(DAILY_PSEUDO_KEY)||'';
    const medals=['🥇','🥈','🥉'];
    document.getElementById('sd-list').innerHTML=entries.length
      ?entries.map((e,i)=>{
          const isMe=isToday&&myPseudo&&e.pseudo===myPseudo&&e.score===myScore;
          const time=new Date(e.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
          return`<div class="sh-row${i===0?' gold':''}${isMe?' sd-me':''}">
            <span class="sh-rank">${medals[i]||i+1}</span>
            <span class="sh-name">${e.pseudo}</span>
            <span class="sh-pts">${e.score} pts</span>
            <span class="sh-date">${time}</span>
          </div>`;
        }).join('')
      :'<div class="sh-empty">Aucun score publié ce jour.</div>';
  }catch(e){document.getElementById('sd-list').innerHTML='<div class="sh-empty">Erreur de chargement.</div>';}
}
async function showDailyLeaderboard(myScore){
  show('sd');
  const dateStr=getDailyDateStr();
  const ds=loadDailyState();
  const score=myScore??ds?.score;
  document.getElementById('sd-my-score').textContent=score!=null?score+' pts':'—';
  loadDailyLB(dateStr);
}

// ══ SAVE / RESTORE ═══════════════════════════════════════
function saveGame(){
  if(!players.length||over)return;
  if(isDailyMode){saveDailyGame();return;}
  try{
    localStorage.setItem(SAVE_KEY,JSON.stringify({
      mode,nbPl,selBotIdx,
      players:players.map(p=>({name:p.name,sc:p.sc,isBot:p.isBot,botId:p.bot?p.bot.id:null,lastMove:p.lastMove})),
      cur,rollN,dice:[...dice],kept:[...kept],hasRolled,secheOk,announced,coachOn
    }));
  }catch(e){}
}
function clearSave(){
  try{localStorage.removeItem(SAVE_KEY);}catch(e){}
  try{localStorage.removeItem(DAILY_SAVE_KEY);}catch(e){}
}
function loadSave(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!s||!s.players?.length)return false;
    mode=s.mode;nbPl=s.nbPl;selBotIdx=s.selBotIdx;
    players=s.players.map(p=>({name:p.name,sc:p.sc,isBot:p.isBot,bot:p.botId?BOTS.find(b=>b.id===p.botId)||null:null,lastMove:p.lastMove}));
    cur=s.cur;over=false;rollN=s.rollN;dice=s.dice;kept=s.kept;
    hasRolled=s.hasRolled;secheOk=s.secheOk;announced=s.announced;coachOn=s.coachOn;
    return true;
  }catch(e){clearSave();return false;}
}

// ══ END ══════════════════════════════════════════════════
function endGame(){
  over=true;clearSave();show('se');
  const res=players.map(p=>({name:p.name,sc:grandTot(p.sc),bot:p.isBot,botId:p.bot?.id||null,grid:p.sc})).sort((a,b)=>b.sc-a.sc);
  const m=['🥇','🥈','🥉'];
  document.getElementById('elist').innerHTML=res.map((r,i)=>`
    <div class="erow${i===0?' w':''}">
      <span class="ename">${m[i]||''} ${r.name}</span>
      <span class="epts">${r.sc} pts</span>
    </div>`).join('');
  const recEl=document.getElementById('erecord');
  recEl.innerHTML='';
  let newRecord=false;
  res.filter(r=>!r.bot).forEach(r=>{
    if(isNewRecord(r.sc))newRecord=true;
    saveHS(r.name,r.sc,r.grid);
  });
  let recHTML=newRecord?'<div class="erecord">🏆 Nouveau record !</div>':'';
  const humans=res.filter(r=>!r.bot);
  if(humans.length){
    const humanPlayer=humans[0];
    const beatenBots=res.filter(r=>r.bot&&r.botId&&humanPlayer.sc>r.sc).map(r=>r.botId);
    const earned=checkBadges(humanPlayer.grid,humanPlayer.sc,beatenBots);
    const newCount=earned.filter(b=>b.isNew).length;
    const total=loadBadgeData().obtained.length;
    if(newCount>0)recHTML+=`<div class="erecord">🎖 ${newCount} badge${newCount>1?'s':''} débloqué${newCount>1?'s':''} · ${total}/23</div>`;
    else recHTML+=`<div class="erecord" style="opacity:.5;font-size:11px">🎖 ${total}/23 badges</div>`;
  }
  recEl.innerHTML=recHTML;
  if(isDailyMode){
    const human=humans[0];
    if(human){
      saveDailyState({date:getDailyDateStr(),played:true,score:human.sc,duration_s:Math.round((Date.now()-gameStartTime)/1000)});
      localStorage.removeItem(DAILY_SAVE_KEY);
    }
    isDailyMode=false;
    document.getElementById('se-submit').style.display='none';
    document.getElementById('se-daily').style.display='';
    const savedPseudo=localStorage.getItem(PLAYER_NAME_KEY)||localStorage.getItem(DAILY_PSEUDO_KEY)||human?.name||'';
    document.getElementById('sd-pseudo-end').value=savedPseudo;
    document.getElementById('sd-score-end').textContent=human?.sc||0;
    return;
  }
  const seSubmit=document.getElementById('se-submit');
  const seSubmits=document.getElementById('se-submits');
  if(humans.length){
    const d=new Date();
    const date=d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'});
    const duration_s=Math.round((Date.now()-gameStartTime)/1000);
    const allSubmits=humans.map(h=>({
      name:h.name,score:h.sc,date,grid:h.grid,duration_s,
      opponents:res.filter(r=>r!==h).map(r=>({name:r.name,score:r.sc,isBot:r.bot}))
    }));
    if(humans.length===1){
      pendingSubmit=allSubmits[0];
      seSubmit.style.display='';
      seSubmits.style.display='none';
    }else{
      pendingSubmit=null;
      seSubmit.style.display='none';
      seSubmits.style.display='flex';
      seSubmits.innerHTML=allSubmits.map((s,i)=>
        `<button class="e-submit" onclick="showSubmitModal(${i})" id="se-submit-${i}">📤 Publier le score de ${s.name}</button>`
      ).join('');
      window._allSubmits=allSubmits;
    }
  }else{
    pendingSubmit=null;
    seSubmit.style.display='none';
    seSubmits.style.display='none';
  }
  document.getElementById('se-daily').style.display='none';
}

// ══ FX ═══════════════════════════════════════════════════
const FX={canvas:null,ctx:null,parts:[],id:null};
const FXCFG={
  full:{l:'Full !',c:'#27c47e',n:60,fw:false,dur:2400},
  suite:{l:'Suite !',c:'#6ee8b0',n:80,fw:false,dur:2400},
  carre:{l:'Carré !',c:'#f5c842',n:140,fw:false,dur:2400},
  yams:{l:'YAMS !!!',c:'#27c47e',n:300,fw:true,dur:3600},
  seche:{l:'',c:'#36cfc0',n:70,fw:false,dur:2400},
  bonus:{l:'+30 ✓',c:'#f5c842',n:50,fw:false,dur:2000},
};
function spawnFx(type,ox,oy){
  const cfg=FXCFG[type];if(!cfg||!FX.ctx)return;
  if(cfg.l){
    const lbl=document.createElement('div');
    lbl.textContent=cfg.l;
    lbl.style.cssText=`position:fixed;left:${ox}px;top:${oy-30}px;transform:translate(-50%,-50%);font-size:30px;font-weight:800;color:${cfg.c};pointer-events:none;z-index:1000;text-shadow:0 2px 12px rgba(0,0,0,.95);transition:transform ${cfg.dur/1000}s ease-out,opacity ${cfg.dur/1000}s ease-out;`;
    document.body.appendChild(lbl);
    requestAnimationFrame(()=>{lbl.style.transform='translate(-50%,-300%)';lbl.style.opacity='0';});
    setTimeout(()=>lbl.remove(),cfg.dur+100);
  }
  const dec=1/(cfg.dur/16);
  for(let i=0;i<cfg.n;i++){
    const a=cfg.fw?Math.random()*Math.PI*2:-Math.PI/2+(Math.random()-.5)*Math.PI;
    const sp=cfg.fw?5+Math.random()*12:2.5+Math.random()*8;
    FX.parts.push({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
      life:1,dec:dec*(.7+Math.random()*.6),sz:4+Math.random()*8,
      color:cfg.c,circle:Math.random()>.5,rot:Math.random()*Math.PI*2,rs:(Math.random()-.5)*.35});
  }
  if(!FX.id)fxLoop();
}
function fxLoop(){
  FX.ctx.clearRect(0,0,FX.canvas.width,FX.canvas.height);
  FX.parts=FX.parts.filter(p=>p.life>0);
  FX.parts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.vx*=.98;p.life-=p.dec;p.rot+=p.rs;
    FX.ctx.save();FX.ctx.globalAlpha=Math.max(0,p.life);FX.ctx.fillStyle=p.color;
    FX.ctx.translate(p.x,p.y);FX.ctx.rotate(p.rot);
    if(p.circle){FX.ctx.beginPath();FX.ctx.arc(0,0,p.sz/2,0,Math.PI*2);FX.ctx.fill();}
    else FX.ctx.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz);
    FX.ctx.restore();
  });
  FX.id=FX.parts.length>0?requestAnimationFrame(fxLoop):null;
}
function detectFx(){
  let type=null,fig=null;
  if(sc('yams',dice)>0){type='yams';fig='yams';}
  else if(sc('carre',dice)>0){type='carre';fig='carre';}
  else if(sc('suite',dice)>0){type='suite';fig='suite';}
  else if(sc('full',dice)>0){type='full';fig='full';}
  if(secheOk&&fig&&fig!=='yams'){
    const masc=['full','carre','yams'];
    FXCFG.seche.l=RLBL[fig]+(masc.includes(fig)?' sec !':' sèche !');
    type='seche';
  }
  if(!type)return;
  aFig(fig||type);
  spawnFx(type,window.innerWidth/2,window.innerHeight*.88);
}
function triggerBonus(col){
  aEn();aFig('bonus');
  renderTable();
  setTimeout(()=>{
    const tbl=document.getElementById('tbl');if(!tbl)return;
    const rows=tbl.querySelectorAll('tbody tr');
    const br=rows[7];if(!br)return;
    const ci=COLS.indexOf(col);
    const cell=br.querySelectorAll('td')[ci+1]?.querySelector('.cell');
    if(cell){cell.classList.add('banim');setTimeout(()=>cell.classList.remove('banim'),700);}
  },50);
  const tbl=document.getElementById('tbl');
  let ox=window.innerWidth/2,oy=window.innerHeight*.4;
  if(tbl){const r=tbl.getBoundingClientRect();ox=r.left+(COLS.indexOf(col)+1.5)*(r.width/(COLS.length+1));oy=r.top+r.height*.35;}
  spawnFx('bonus',ox,oy);
}

// ══ INTRO ════════════════════════════════════════════════
let introDone=false,introTimers=[];
function closeIntro(){
  if(introDone)return;introDone=true;
  introTimers.forEach(clearTimeout);introTimers=[];
  const el=document.getElementById('si');
  el.style.transition='opacity .35s';el.style.opacity='0';
  document.getElementById('ss').classList.add('on');
  setTimeout(()=>el.classList.remove('on'),350);
  if(!localStorage.getItem(RULES_KEY)){
    setTimeout(()=>document.getElementById('smr').classList.add('on'),600);
  }
}
function startIntro(){
  [150,340,530,720].forEach((t,i)=>introTimers.push(setTimeout(()=>
    document.getElementById('il'+i).classList.add('run'),t)));
  introTimers.push(setTimeout(()=>document.getElementById('isub').classList.add('show'),1060));
  introTimers.push(setTimeout(()=>document.getElementById('iglint').classList.add('run'),1500));
  introTimers.push(setTimeout(()=>{if(!introDone)closeIntro();},2900));
}

// ══ STATS TICKER ══════════════════════════════════════════
const FALLBACK_STATS=['🏆 Record : 1411 pts par Adri','🎯 Score moyen : 1104 pts','🎮 102 parties publiées','⚡ Partie la plus rapide : 7min34s','👥 7 joueurs différents','🎰 3 yams secs réalisés'];
let _tickerTimer=null;
function startStatsTicker(stats){
  if(_tickerTimer){clearInterval(_tickerTimer);_tickerTimer=null;}
  const el=document.getElementById('stats-txt');
  if(!el||!stats.length)return;
  let i=0;
  const show=(idx,fromRight)=>{
    if(fromRight!==undefined){
      el.style.transition='none';
      el.style.transform=fromRight?'translateX(60px)':'translateX(-60px)';
      el.style.opacity='0';
    }
    el.textContent=stats[idx];
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      el.style.transition='transform 0.4s ease-out,opacity 0.4s';
      el.style.transform='translateX(0)';
      el.style.opacity='1';
    }));
  };
  show(0);
  _tickerTimer=setInterval(()=>{
    el.style.transition='transform 0.35s ease-in,opacity 0.35s';
    el.style.transform='translateX(-60px)';
    el.style.opacity='0';
    setTimeout(()=>{i=(i+1)%stats.length;show(i,true);},380);
  },4500);
}
async function loadHomepageStats(){
  startStatsTicker(FALLBACK_STATS);
  try{
    const [scores,evts,lastDefi,dailyRes]=await Promise.all([
      fetch(`${SB_URL}/scores?select=pseudo,score,duration_s,date,grid,opponents`,{headers:SB_HDR}).then(r=>r.json()),
      fetch(`${SB_URL}/events?select=mode,ts&type=eq.game_start`,{headers:SB_HDR}).then(r=>r.json()),
      fetch(`${SB_URL}/daily_scores?select=pseudo,score,date&order=date.desc,score.desc&limit=1`,{headers:SB_HDR}).then(r=>r.json()),
      fetch(`${SB_URL}/daily_scores?select=id`,{method:'HEAD',headers:{...SB_HDR,'Prefer':'count=exact'}})
    ]);
    if(!Array.isArray(scores)||scores.length===0)return;
    const dailyCr=dailyRes.headers.get('content-range');
    const dailyCount=dailyCr?parseInt(dailyCr.split('/')[1])||0:0;
    const paris0=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Paris'}));
    paris0.setHours(0,0,0,0);
    const tzOff=new Date().getTime()-new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Paris'})).getTime();
    const todayISO=new Date(paris0.getTime()+tzOff).toISOString();
    const weekISO=getWeekStart();
    const evtArr=Array.isArray(evts)?evts:[];
    const evtToday=evtArr.filter(e=>e.ts>=todayISO).length;
    const evtWeek=evtArr.filter(e=>e.ts>=weekISO).length;
    const evtBot=scores.filter(s=>{try{return Array.isArray(s.opponents)&&s.opponents.some(o=>o.isBot);}catch(e){return false;}}).length;
    const today=new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'});
    const stats=[];
    const best=scores.reduce((a,b)=>b.score>a.score?b:a);
    stats.push(`🏆 Record : ${best.score} pts par ${best.pseudo}`);
    if(Array.isArray(lastDefi)&&lastDefi.length)stats.push(`⚔️ Dernier vainqueur du Défi : ${lastDefi[0].pseudo} (${lastDefi[0].score} pts)`);
    const avg=Math.round(scores.reduce((a,s)=>a+s.score,0)/scores.length);
    stats.push(`🎯 Score moyen : ${avg} pts`);
    if(evtToday>0)stats.push(`📅 ${evtToday} partie${evtToday>1?'s':''} lancée${evtToday>1?'s':''} aujourd'hui`);
    const n=scores.length+dailyCount;
    stats.push(`🎮 ${n} partie${n>1?'s':''} publiée${n>1?'s':''}`);
    const timed=scores.filter(s=>s.duration_s>0);
    if(timed.length){const f=timed.reduce((a,b)=>b.duration_s<a.duration_s?b:a);const m=Math.floor(f.duration_s/60),s=f.duration_s%60;stats.push(`⚡ Partie la plus rapide : ${m}min${s?s+'s':''}`);}
    stats.push(`🤖 ${evtBot} bot${evtBot>1?'s':''} affronté${evtBot>1?'s':''}`);
    const pl=new Set(scores.map(s=>s.pseudo.trim().toLowerCase())).size;
    stats.push(`👥 ${pl} joueur${pl>1?'s':''} différent${pl>1?'s':''}`);
    stats.push(`📆 ${evtWeek} partie${evtWeek>1?'s':''} lancée${evtWeek>1?'s':''} cette semaine`);
    const ys=scores.filter(s=>{try{return typeof s.grid.seche.yams==='number'&&s.grid.seche.yams>0;}catch(e){return false;}}).length;
    if(ys>0)stats.push(`🎰 ${ys} yams sec${ys>1?'s':''} obtenus`);
    startStatsTicker(stats);
  }catch(e){}
}

// ══ RÈGLES ═══════════════════════════════════════════════
let rulesFrom='ss';
function showRulesScreen(from){
  rulesFrom=from;
  if(from==='smr')document.getElementById('smr').classList.remove('on');
  show('sr');
}
function closeRulesScreen(){
  if(rulesFrom==='smr'){document.getElementById('smr').classList.add('on');show('ss');}
  else show(rulesFrom);
}
function closeRulesModal(){
  document.getElementById('smr').classList.remove('on');
}
function onRulesCheckbox(cb){
  if(cb.checked)localStorage.setItem(RULES_KEY,'1');
  else localStorage.removeItem(RULES_KEY);
}

// ══ INIT ═════════════════════════════════════════════════
(function(){
  loadHomepageStats();
  const c=document.getElementById('fx');
  if(c){FX.canvas=c;FX.ctx=c.getContext('2d');
    c.width=window.innerWidth;c.height=window.innerHeight;
    window.addEventListener('resize',()=>{c.width=window.innerWidth;c.height=window.innerHeight;});}
  buildBotList();
  const savedName=localStorage.getItem(PLAYER_NAME_KEY)||localStorage.getItem(DAILY_PSEUDO_KEY)||'';
  if(savedName){
    document.getElementById('mn0').value=savedName;
    document.getElementById('pname').value=savedName;
    document.getElementById('dname-daily').value=savedName;
    document.getElementById('sd-pseudo-end').value=savedName;
  }
  document.getElementById('broll').onclick=doRoll;
  document.getElementById('hquit').onclick=()=>document.getElementById('mq').classList.add('on');
  document.getElementById('ctog').onclick=function(){
    coachOn=!coachOn;this.classList.toggle('on',coachOn);
    if(!coachOn){suggestCell=null;renderTable();document.getElementById('dcmsg').textContent='';}
    else if(hasRolled){setCoach(coachMsg());renderTable();}
  };
  if(loadDailyGame()){
    introDone=true;_restoreDailyUI();
  } else if(loadSave()){
    introDone=true;
    buildTabs();show('sg');
    document.getElementById('dname').textContent=players[cur].name;
    const br=document.getElementById('broll');
    br.disabled=rollN>=3;
    br.innerHTML=rollN>=3?'<span>✓</span><span>Place</span>':'<span>🎲</span><span>Lancer</span>';
    document.getElementById('ctog').classList.toggle('on',coachOn);
    updBadge();updCoups();updTabs();renderDice(false);renderTable();
    if(players[cur].isBot){setCoach(players[cur].name+' réfléchit…');setTimeout(botTurn,800);}
    else if(hasRolled&&coachOn)setCoach(coachMsg());
    else setCoach('À toi '+players[cur].name+' !');
  } else {
    setTimeout(startIntro,300);
  }
})();
