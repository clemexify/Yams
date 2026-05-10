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
let mode='bot',nbPl=2,selBotIdx=0;
let players=[],cur=0,over=false;
let rollN=0,dice=[0,0,0,0,0],kept=[false,false,false,false,false];
let hasRolled=false,secheOk=false,announced=null,suggestCell=null,botTarget=null,culmanFallbackCell=null;
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
  document.getElementById('dproj').textContent=fi?'~'+Math.round(cv/fi*tot):'—';
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
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=260+Math.random()*60;
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
      const vol=0.50*Math.pow(0.82,b);
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
  if(type==='full'){pl(440,.18,.12,'sine',0);cr(800,.28,80);pl(660,.22,.14,'sine',120);}
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
  ['bot','solo','multi'].forEach(x=>{
    document.getElementById('mt-'+x).classList.toggle('on',x===m);
    document.getElementById('cfg-'+x).style.display=x===m?'flex':'none';
  });
}
function setNb(n){
  nbPl=n;
  [2,3].forEach(i=>document.getElementById('nb'+i).classList.toggle('on',i===n));
  const wrap=document.getElementById('mnames');
  const inputs=wrap.querySelectorAll('input');
  if(n===3&&inputs.length<3){
    const inp=document.createElement('input');
    inp.className='sinput';inp.id='mn2';inp.type='text';inp.placeholder='Joueur 3';inp.maxLength=14;
    wrap.appendChild(inp);
  } else if(n===2&&inputs.length>2){
    wrap.removeChild(inputs[2]);
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
  clearSave();players=[];over=false;cur=0;
  if(mode==='bot'){
    const name=document.getElementById('pname').value.trim()||'Joueur';
    const bot=BOTS[selBotIdx];
    players=[{name,sc:mkSc(),isBot:false,lastMove:null},{name:bot.name,sc:mkSc(),isBot:true,bot,lastMove:null}];
  } else if(mode==='solo'){
    const name=document.getElementById('sname').value.trim()||'Joueur';
    players=[{name,sc:mkSc(),isBot:false,lastMove:null}];
  } else {
    for(let i=0;i<nbPl;i++){
      const el=document.getElementById('mn'+i);
      players.push({name:el?.value.trim()||`Joueur ${i+1}`,sc:mkSc(),isBot:false,lastMove:null});
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
    return`<button class="htab${isBot?' bot-tab':''}" data-i="${i}" onclick="viewPlayer(${i})">${p.name}</button>`;
  }).join('');
  updTabs();
}
function updTabs(){
  document.querySelectorAll('.htab').forEach((t,i)=>t.classList.toggle('on',i===cur));
}
function viewPlayer(i){cur=i;updTabs();renderTable();}

// ══ TURN ════════════════════════════════════════════════
function startTurn(){
  rollN=0;dice=[0,0,0,0,0];kept=[false,false,false,false,false];
  hasRolled=false;secheOk=false;announced=null;suggestCell=null;
  document.getElementById('dname').textContent=players[cur].name;
  const br=document.getElementById('broll');br.disabled=false;br.innerHTML='<span>🎲</span><span>Lancer</span>';
  document.getElementById('dann').textContent='';
  updBadge();updCoups();updTabs();renderDice(false);renderTable();updSecheInd();
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
  for(let i=0;i<5;i++)if(!kept[i])dice[i]=Math.floor(Math.random()*6)+1;
  hasRolled=true;
  aDice(n);renderDice(true);updBadge();
  if(rollN>=3){const br=document.getElementById('broll');br.disabled=true;br.innerHTML='<span>✓</span><span>Place</span>';}
  const sv=hasRolled;hasRolled=false;renderTable();hasRolled=sv;
  setTimeout(()=>{
    if(rollN===1&&!announced){
      const auto=autoAnn(players[cur].sc);
      if(auto){announced=auto;document.getElementById('dann').textContent='Ann: '+RLBL[auto];}
      else document.getElementById('dann').textContent='Annonce ↑';
    }
    renderTable();updSecheInd();
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
  announced=row;document.getElementById('dann').textContent='Ann: '+RLBL[row];renderTable();
  aAnnounce();
  setCoach('Annoncé '+RLBL[row]+' 🎯');
}

// ══ SÈCHE ═══════════════════════════════════════════════
function updSecheInd(){
  const ind=document.getElementById('dsec'),txt=document.getElementById('dsectxt');
  const sc2=players[cur].sc;
  const has=ROWS.some(r=>r!=='bonus'&&r!=='diff'&&sc2['seche'][r]===null);
  if(!has){ind.style.display='none';return;}
  ind.style.display='flex';
  if(secheOk){ind.className='dsec ok';txt.textContent='Sèche ✓';}
  else{ind.className='dsec';txt.textContent='Sèche';}
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
  h+=`<span style="font-size:9px;color:var(--mu)">Total : </span><span class="cgr">${grandTot(sc2)} pts</span></td></tr>`;
  h+='</tbody>';
  document.getElementById('tbl').innerHTML=h;
  updProj();
}

function cellH(col,row,sc2){
  const v=sc2[col][row];
  if(row==='bonus'){
    if(v!==null)return`<span class="cell ${v===30?'vf':'vx'}">${v===30?'+30':'—'}</span>`;
    return`<span class="cell vbonus">${numTot(col,sc2)}/60</span>`;
  }
  if(row==='diff'){
    if(v!==null)return`<span class="cell ${v>=0?'vf':'vx'}">${v>=0?'+'+v:v}</span>`;
    return`<span class="cell ve">—</span>`;
  }
  if(v!==null)return`<span class="cell ${v===0?'vx':'vf'}">${(v==='X'||v===0)?'✕':v}</span>`;
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
    if(isBot){
      const isTgt=botTarget?.col===col&&botTarget?.row===row;
      return`<span class="cell ${isTgt?'vbt':'vba'}">${s>0?s:'✕'}</span>`;
    }
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

// ══ PLACE ═══════════════════════════════════════════════
function place(col,row){
  if(!hasRolled||players[cur].isBot)return;
  const p=players[cur];
  if(!canPlace(col,row,p.sc,announced,rollN,secheOk))return;
  if(col==='annonce'&&!announced&&rollN===1){doAnn(row);return;}
  const s=sc(row,dice);
  p.sc[col][row]=s;updAll(col,p.sc);
  p.lastMove={col,row,s};
  aPlace();setCoach(afterMsg(row,s));doNext();
}
function cross(col,row){
  if(!hasRolled||players[cur].isBot)return;
  const p=players[cur];
  if(!canPlace(col,row,p.sc,announced,rollN,secheOk))return;
  p.sc[col][row]='X';updAll(col,p.sc);
  p.lastMove={col,row,s:'X'};
  aPlace();setCoach(afterMsg(row,'X'));doNext();
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
  show('st');
  document.getElementById('tr-who').textContent=prev.name+' a joué :';
  document.getElementById('tr-sc').textContent=grandTot(prev.sc)+' pts';
  const mv=prev.lastMove;
  let mTxt='';
  if(mv){mTxt=mv.s==='X'||mv.s===0?`${RLBL[mv.row]} barré en ${CLBL[mv.col]}`:`${RLBL[mv.row]} en ${CLBL[mv.col]} — ${mv.s} pts`;}
  document.getElementById('tr-move').innerHTML=mTxt?`<strong>${mTxt}</strong>`:'';
  const qEl=document.getElementById('tr-quote');
  if(prev.isBot&&prev.bot){
    const pool=prev.bot.trans;
    qEl.textContent='« '+pool[Math.floor(Math.random()*pool.length)]+' »';
  } else {qEl.textContent='';}
  document.getElementById('tr-next').textContent=next.name;
  const f=document.getElementById('tr-fill');
  f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
  setTimeout(()=>{
    cur=transNextIdx;
    show('sg');startTurn();
  },2850);
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
  if(announced&&canPlace('annonce',announced,sc2,announced,rollN,secheOk))
    return{col:'annonce',row:announced,score:sc(announced,d)};
  const c=mkCnt(d);
  const targets=[
    ...['yams','carre','full','suite'].filter(f=>sc(f,d)>0),
    ...['6','5','4','3','2','1'].filter(r=>(c[+r]||0)>=3)
  ];
  for(const row of targets){
    let best=null,bv=-Infinity;
    for(const col of ['desc','asc']){
      if(!canPlace(col,row,sc2,announced,rollN,secheOk))continue;
      const s=sc(row,d);if(s>bv){bv=s;best={col,row,score:s};}
    }
    if(best)return best;
  }
  let best=null,bv=-Infinity;
  for(const col of ['normal','seche']){
    for(const row of ROWS){
      if(row==='bonus'||row==='diff')continue;
      if(col==='seche'&&FIGS.includes(row)&&sc(row,d)===0)continue;
      if(!canPlace(col,row,sc2,announced,rollN,secheOk))continue;
      const s=sc(row,d);if(s>bv){bv=s;best={col,row,score:s};}
    }
  }
  return best;
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
    const nec=culmanNecessity(col,row,sc2,totalFree);
    const colW={desc:1.35,asc:1.35,annonce:1.25,seche:1.2,normal:1.0}[col];
    items.push({col,row,ev:prob*expScore*colW+nec,prob,expScore,curScore:sc(row,d),nec});
  });});
  return items.sort((a,b)=>b.ev-a.ev);
}
function culmanExpScore(row,d){
  if(row==='yams')return 83;
  if(row==='carre'){const v=+Object.keys(mkCnt(d)).sort((a,b)=>mkCnt(d)[b]-mkCnt(d)[a])[0]||4;return v*4+40;}
  if(row==='full')return sum(d)+20;
  if(row==='suite')return 55;
  if('123456'.includes(row)){const n=+row;const cnt=mkCnt(d)[n]||0;return cnt>=3?n*cnt:n*3.5;}
  if(row==='plus')return Math.max(sum(d),22);
  if(row==='minus')return 15;
  return sc(row,d);
}
function culmanNecessity(col,row,sc2,totalFree){
  if(row==='1')return 6;
  if(row==='plus'||row==='minus')return 2;
  if(totalFree<=8)return 4;
  return 0;
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
        if(secheAvail&&bestNow<20&&!bAnn){d=d.map(()=>Math.floor(Math.random()*6)+1);bSok=true;}
        rolls.push({d:[...d],kept:[false,false,false,false,false],rn});break;
      }
      // Sélection par EV (si pas en mode amélioration)
      if(!upgradeMode){
        const ev=culmanEval(d,sc2,rl,bAnn,bSok,rn);
        if(secheAvail&&!bAnn&&(ev.length===0||ev[0].ev<10)){
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
        if(sf&&bestNow<20&&!bAnn){d=d.map(()=>Math.floor(Math.random()*6)+1);bSok=true;}
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
      for(let i=0;i<5;i++){const e=ex2?.[i];if(e)e.className='die'+(roll.kept[i]?' kept':'');}
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
    renderDice(false);renderTable();updSecheInd();
    const m=s>0?`${p.name} → ${RLBL[row]} en ${CLBL[col]} (${s}pts) 🤓`:`${p.name} barre ${RLBL[row]} en ${CLBL[col]} 🤓`;
    setCoach(m);
    setTimeout(()=>setCoach(p.name+' : « '+botQuote(bot,sc2)+' »'),1000);
    setTimeout(doNext,2100);
  },700);
}
function botBestPlacement(d,sc2,ann,sok){
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
      if(!canPlace(col,row,sc2,ann,3,sok))return;
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
      if(proj>=60)val+=30*cp;else if(proj>=54)val+=18*cp;else if(proj>=48)val+=8*cp;
      return val;
    }
    if(nD===2){
      if(col==='desc'||col==='asc'){const bR=bonusReach(col,sc2);if(bR)return s*0.05*cp;return s*0.4*cp;}
      return s*0.5*cp;
    }
    if(col==='desc'||col==='asc')return s*0.02;
    return s*0.1*cp;
  }
  if(row==='1'){
    let ob=0,mn=0;
    '23456'.split('').forEach(r=>{const v=sc2[col][r];if(typeof v==='number'){ob+=v;mn+=NM[r];}});
    const onTrack=(ob-mn)>=0;
    if(onTrack)return s*1.2*cp;
    return s*0.5*cp;
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

// ══ HIGHSCORES ═══════════════════════════════════════════
const HS_KEY='yams_hs';
function loadHS(){try{return(JSON.parse(localStorage.getItem(HS_KEY))||[]).map(e=>({...e,score:e.score??e.pts??0}));}catch{return[];}}
function saveHS(name,score){
  const hs=loadHS();
  const d=new Date();
  const date=d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'});
  hs.push({name,score,date});
  hs.sort((a,b)=>b.score-a.score);
  hs.splice(10);
  localStorage.setItem(HS_KEY,JSON.stringify(hs));
}
function isNewRecord(score){
  const hs=loadHS();
  return hs.length<10||score>hs[hs.length-1].score;
}
function showHS(){
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
      </div>`).join('');
  document.getElementById('sh-list').innerHTML=rows;
  show('sh');
}
function clearHS(){
  if(!confirm('Effacer tous les records ?'))return;
  localStorage.removeItem(HS_KEY);
  showHS();
}

// ══ SAVE / RESTORE ═══════════════════════════════════════
function saveGame(){
  if(!players.length||over)return;
  try{
    localStorage.setItem(SAVE_KEY,JSON.stringify({
      mode,nbPl,selBotIdx,
      players:players.map(p=>({name:p.name,sc:p.sc,isBot:p.isBot,botId:p.bot?p.bot.id:null,lastMove:p.lastMove})),
      cur,rollN,dice:[...dice],kept:[...kept],hasRolled,secheOk,announced,coachOn
    }));
  }catch(e){}
}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
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
  const res=players.map(p=>({name:p.name,sc:grandTot(p.sc),bot:p.isBot})).sort((a,b)=>b.sc-a.sc);
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
    saveHS(r.name,r.sc);
  });
  if(newRecord)recEl.innerHTML='<div class="erecord">🏆 Nouveau record !</div>';
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
}
function startIntro(){
  [150,340,530,720].forEach((t,i)=>introTimers.push(setTimeout(()=>
    document.getElementById('il'+i).classList.add('run'),t)));
  introTimers.push(setTimeout(()=>document.getElementById('isub').classList.add('show'),1060));
  introTimers.push(setTimeout(()=>document.getElementById('iglint').classList.add('run'),1500));
  introTimers.push(setTimeout(()=>{if(!introDone)closeIntro();},2900));
}

// ══ INIT ═════════════════════════════════════════════════
(function(){
  const c=document.getElementById('fx');
  if(c){FX.canvas=c;FX.ctx=c.getContext('2d');
    c.width=window.innerWidth;c.height=window.innerHeight;
    window.addEventListener('resize',()=>{c.width=window.innerWidth;c.height=window.innerHeight;});}
  buildBotList();
  document.getElementById('broll').onclick=doRoll;
  document.getElementById('hquit').onclick=()=>document.getElementById('mq').classList.add('on');
  document.getElementById('ctog').onclick=function(){
    coachOn=!coachOn;this.classList.toggle('on',coachOn);
    if(!coachOn){suggestCell=null;renderTable();document.getElementById('dcmsg').textContent='';}
    else if(hasRolled){setCoach(coachMsg());renderTable();}
  };
  if(loadSave()){
    introDone=true;
    buildTabs();show('sg');
    document.getElementById('dname').textContent=players[cur].name;
    const br=document.getElementById('broll');
    br.disabled=rollN>=3;
    br.innerHTML=rollN>=3?'<span>✓</span><span>Place</span>':'<span>🎲</span><span>Lancer</span>';
    document.getElementById('dann').textContent=announced?'Ann: '+RLBL[announced]:'';
    document.getElementById('ctog').classList.toggle('on',coachOn);
    updBadge();updCoups();updTabs();renderDice(false);renderTable();updSecheInd();
    if(players[cur].isBot){setCoach(players[cur].name+' réfléchit…');setTimeout(botTurn,800);}
    else if(hasRolled&&coachOn)setCoach(coachMsg());
    else setCoach('À toi '+players[cur].name+' !');
  } else {
    setTimeout(startIntro,300);
  }
})();
