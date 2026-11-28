// ══ CALENDRIER DE L'AVENT : RÈGLES DES CASES ═══════════════
// Chargé AVANT app.js : en décembre, le Défi du jour de chaque case EST sa variante
// inédite (getDailyVariantForDate() passe d'abord par aventVariante()). Mêmes dés pour
// tout le monde, classement et série du Défi comme d'habitude. Le finir débloque le
// mini-jeu de la case (avent.js). Les jours sans case préparée gardent la rotation.
// Branchements dans app.js repérés par « aventActif » : maxLancers, valeur, startTurn,
// doRoll, renderDice, cellH, place, cross, renderTable, saveDailyGame, loadDailyGame,
// launchDaily. Le reste du calendrier (écran, fiches, mini-jeux) est dans avent.js.
// Modifier une case déjà passée réécrit la variante affichée dans l'historique du Défi.

const AT=a=>Array.isArray(a)?(EN?a[1]:a[0]):a;
// ── Les mini-jeux, attachés à leur case ──
const AVENT_JEUX={
  1:{f:'01-tir-aux-des',nom:['Tir aux dés','Dice Shooting']},2:{f:'02-de-tan',nom:'Dé-Tan'},3:{f:'03-fusion',nom:'Fusion'},
  4:{f:'04-blizzard',nom:['Blizzard','Blizzard']},5:{f:'05-casse-des',nom:['Casse dés','Dice Breaker']},
  6:{f:'06-de-glisse',nom:['Dé glisse','Dice Slide']},7:{f:'07-des-tranches',nom:['Dés tranchés','Dice Slicer']},
  8:{f:'08-des-croques',nom:['Dés croqués','Dice Muncher']},9:{f:'09-descente-du-pere-noel',nom:['La descente du Père Noël','Santa\'s Downhill']},
  10:{f:'10-snake-des',nom:['Snake dés','Dice Snake']},11:{f:'11-grand-prix',nom:['Le Grand Prix du pôle Nord','North Pole Grand Prix']},
  12:{f:'12-la-tour',nom:['La tour','The Tower']},13:{f:'13-velo-des-neiges',nom:['Le vélo des neiges','Snow Bike']},
  14:{f:'14-tape-le-lutin',nom:['Tape le lutin','Whack the Elf']},15:{f:'15-des-runner',nom:['Dés runner','Dice Runner']},
  16:{f:'16-jingle-des',nom:['Jingle dés','Jingle Dice']},17:{f:'17-jetpack-yams',nom:['Jetpack Yams','Jetpack Yams']},
  18:{f:'18-flipper-de-noel',nom:['Flipper de Noël','Christmas Pinball']},19:{f:'19-demineur-de-noel',nom:['Démineur de Noël','Christmas Minesweeper']},
  20:{f:'20-de-roulant',nom:['Dé roulant','Rolling Die']},21:{f:'21-coup-d-oeil',nom:['Coup d\'œil','Quick Eye']},
  22:{f:'22-le-100-m',nom:['Le 100 m des dés','The Dice 100 m']},23:{f:'23-pluie-de-des',nom:['Pluie de dés','Dice Rain']},
  24:{f:'24-la-cascade',nom:['La Cascade','The Cascade']},
};

// ── Le programme des grilles de Yams de décembre (validé avec Clément le 2026-11-26) ──
// Chaque jour, le Défi du jour est une grille inédite : quatre modes (feu d'artifice, lancer bonus,
// cadeau, dé étoile), les colonnes classiques, la Milieu, la Double ×2 et la nouvelle Triple ×3,
// avec ou sans Paire et Brelan, ou avec les suites. 2 à 4 colonnes en semaine, 4 ou 5 le week-end.
// Modifier un jour déjà passé réécrit la variante affichée dans l'historique du Défi.
// [jour, titre FR, titre EN, modes, colonnes, lignes]
const AVENT_PROGRAMME=[
  [1,"Le grand feu d'artifice",'The Great Fireworks','feu',['normal','desc','asc','seche'],'brelans'],
  [2,'Le lancer de Noël','The Christmas Roll','bonus',['normal','asc'],'base'],
  [3,"L'étoile du berger","The Shepherd's Star",'etoile',['normal','desc','asc'],'suites'],
  [4,'Le premier cadeau','The First Gift','cadeau',['normal','asc','cadeau'],'base'],
  [5,'Feu au milieu','Fire in the Middle','feu',['normal','desc','asc','milieu'],'brelans'],
  [6,'Double et triple','Double and Triple','',['normal','double','triple'],'base'],
  [7,"L'étoile sous le sapin",'Star under the Tree','etoile cadeau',['normal','milieu','cadeau'],'brelans'],
  [8,'Coup sec','One Shot','bonus',['normal','seche','double'],'base'],
  [9,'Le feu des sommets','Fire on the Peaks','feu',['desc','asc','milieu'],'suites'],
  [10,'Paquet surprise','Surprise Parcel','cadeau',['normal','asc','cadeau'],'brelans'],
  [11,'Étoile au centre','Star in the Centre','etoile',['normal','milieu','triple'],'base'],
  [12,'Le grand samedi','The Big Saturday','bonus',['normal','desc','asc','annonce','double'],'base'],
  [13,'La nuit des cadeaux','Night of Gifts','feu cadeau',['normal','desc','asc','cadeau','double'],'suites'],
  [14,'Le feu classique','Classic Fireworks','feu',['normal','desc','asc','seche','annonce'],'brelans'],
  [15,'Double suite','Double Straight','',['normal','double'],'suites'],
  [16,'Hauts et bas','Ups and Downs','cadeau etoile',['desc','asc','cadeau'],'base'],
  [17,'Feu annoncé','Called Fire','feu',['normal','annonce','double'],'brelans'],
  [18,'Le juste milieu','The Happy Medium','bonus',['normal','milieu','triple'],'suites'],
  [19,'La fête des étoiles','Festival of Stars','etoile feu',['normal','desc','asc','milieu','double'],'brelans'],
  [20,'Le grand cadeau','The Big Gift','cadeau',['normal','desc','asc','cadeau','triple'],'base'],
  [21,'Double feu','Double Fire','feu bonus',['normal','double','triple'],'base'],
  [22,"L'étoile sèche",'The Dry Star','etoile',['normal','seche','milieu'],'suites'],
  [23,'Le dernier paquet','The Last Parcel','cadeau bonus',['normal','cadeau','double'],'brelans'],
  [24,'Yams de Noël','Christmas Yams','etoile feu cadeau',['normal','desc','asc','cadeau','double'],'brelans'],
];
// La règle affichée se compose des modes du jour, puis des colonnes particulières
const REGLES_MODES={
  feu:["Feu d'artifice : chaque figure posée juste après une autre allume le multiplicateur, de ×1,5 jusqu'à ×3. Un chiffre, une case + ou −, une case barrée ou une figure à zéro l'éteint.",
       'Fireworks: each combo placed right after another lights the multiplier, from ×1.5 up to ×3. A number, a + or − box, a scratch or a zero combo puts it out.'],
  bonus:['Lancer bonus : une fois dans la partie, tu peux faire un 4e lancer. Garde-le pour le bon moment.',
         'Bonus roll: once in the game, you may roll a 4th time. Save it for the right moment.'],
  cadeau:['Cadeau ✦ : à chaque tour, une case de la colonne Cadeau est emballée en or. Remplis-la ce tour-ci et ses points comptent double.',
          'Gift ✦: each turn, one box of the Gift column is wrapped in gold. Fill it this turn and its points count double.'],
  etoile:['Dé étoile : le dé doré a une étoile à la place du 6, un joker qui prend la face qui rapporte le plus (la plus petite dans la case −).',
          'Star die: the gold die has a star instead of a 6, a joker that takes the best face (the lowest in the − box).'],
};
const REGLES_COLS={
  // dans l'ordre des colonnes de la grille
  milieu:['Colonne ↕ : commence par la case + ou −, puis remplis en t\'éloignant du centre.','↕ column: start with the + or − box, then fill outward from the centre.'],
  seche:['Colonne Sèche : pose en un seul lancer, sans garder de dé.','One-shot column: place after a single roll, without keeping any die.'],
  annonce:['Colonne Annoncée : annonce ta case après le 1er lancer, puis tente-la.','Called column: call your box after the 1st roll, then go for it.'],
  double:['Colonne ×2 : points doublés si tu poses en 1 ou 2 lancers, bonus +60 à partir de 120.','×2 column: points doubled if you place within 1 or 2 rolls, +60 bonus from 120.'],
  triple:['Colonne ×3 : points triplés si tu poses dès le 1er lancer, simples ensuite, bonus +90 à partir de 180.','×3 column: points tripled if you place right after the 1st roll, single after that, +90 bonus from 180.'],
};
const AVENT_CASES={};
for(const[n,fr,en,modes,cols,rows]of AVENT_PROGRAMME){
  const m=modes.split(' ').filter(Boolean),c={titre:[fr,en],cols,rows,jeu:AVENT_JEUX[n],modes:m};
  for(const k of m)c[k]=true;
  const parts=m.map(k=>REGLES_MODES[k]).concat(Object.keys(REGLES_COLS).filter(k=>cols.includes(k)&&!(k==='cadeau')).map(k=>REGLES_COLS[k]));
  if(rows==='suites')parts.push(['Petite suite : 4 dés qui se suivent, 30 points.','Small straight: 4 dice in a row, 30 points.']);
  c.regle=[parts.map(p=>p[0]).join(' '),parts.map(p=>p[1]).join(' ')];
  if(!parts.length)c.regle=['Une grille inédite.','A brand new grid.'];
  AVENT_CASES[n]=c;
}

// Résumé court pour l'accueil (la règle complète, trop longue pour l'écran, s'affiche au
// début de la partie et en touchant le bandeau). Appelé à l'affichage : CNAME vient d'app.js.
const NOMS_MODES={feu:["feu d'artifice",'fireworks'],bonus:['lancer bonus','bonus roll'],cadeau:['cadeau','gift'],etoile:['dé étoile','star die']};
function aventResume(n){
  const c=AVENT_CASES[n];if(!c?.cols)return'';
  const liste=a=>a.length>1?a.slice(0,-1).join(', ')+(EN?' and ':' et ')+a[a.length-1]:(a[0]||'');
  const maj=t=>t.charAt(0).toUpperCase()+t.slice(1);
  const modes=liste(c.modes.map(k=>AT(NOMS_MODES[k])));
  // colonnes en symboles (colsSymboles, app.js), avec quelques mots pour les colonnes inédites seulement
  const GLOSES={milieu:['↕ part du centre','↕ starts from the middle'],cadeau:['✦ une case cadeau par tour','✦ one gift box per turn'],
    double:['×2 points doublés','×2 double points'],triple:['×3 points triplés','×3 triple points']};
  const gloses=c.cols.filter(k=>GLOSES[k]).map(k=>AT(GLOSES[k]));
  const lignes={brelans:[', avec paire et brelan',', with pair and three of a kind'],suites:[', avec petite et grande suite',', with small and large straights']}[c.rows];
  return(modes?maj(modes)+'. ':'')+colsSymboles(c.cols)
    +(gloses.length?` (${gloses.join(', ')})`:'')+(lignes?AT(lignes):'')+'. '
    +tr('La règle complète s\'affiche en début de partie.','The full rules appear when the game starts.');
}
function aventRegle(){if(aventCtx)showTip(AT(aventCtx.cfg.regle));}

// Numéro de la case dont la variante remplace le Défi de cette date, sinon null
function aventNumDuJour(dateStr){
  const m=/^2026-12-(\d\d)$/.exec(dateStr||'');
  // une case sans « cols » n'a qu'un mini-jeu : le Défi garde alors la rotation habituelle
  return m&&AVENT_CASES[+m[1]]?.cols?+m[1]:null;
}
function aventVariante(dateStr){
  const n=aventNumDuJour(dateStr);if(!n)return null;
  const c=AVENT_CASES[n];
  return{id:'avent'+n,avent:n,name:AT(c.titre),cols:[...c.cols],rows:c.rows,
    desc:AT(c.regle)};
}

// ── État de la partie en cours ──
// aventCtx n'a de sens que pendant un Défi du jour de décembre (isDailyMode)
let aventCtx=null;
function aventActif(){return isDailyMode&&!!aventCtx;}
// Appelée au lancement (nouvelle) ou à la reprise d'un Défi : relie la partie à sa case
function aventLierDefi(nouvelle){
  const v=isDailyMode?getDailyVariant():null;
  if(!v||!v.avent){aventCtx=null;return;}
  let sv=null;
  if(!nouvelle){try{sv=JSON.parse(localStorage.getItem(DAILY_SAVE_KEY))?.avent||null;}catch(e){}}
  aventCtx={n:v.avent,cfg:AVENT_CASES[v.avent],chaine:sv?.chaine||0,emb:sv?.emb??null,
    bonusDispo:sv?sv.bonusDispo!==false:true,bonusTour:!!sv?.bonusTour,poolBonus:sv?.poolBonus||null};
}
function aventSauvegarde(){return aventActif()?{chaine:aventCtx.chaine,emb:aventCtx.emb,bonusDispo:aventCtx.bonusDispo,bonusTour:aventCtx.bonusTour,poolBonus:aventCtx.poolBonus}:null;}
// Lancer bonus : un 4e lancer, une fois dans la partie, tiré d'un générateur à part (mêmes dés pour tous)
function aventBonusPossible(){return aventActif()&&!!aventCtx.cfg.bonus&&aventCtx.bonusDispo&&!aventCtx.bonusTour&&rollN>=3&&hasRolled!==undefined;}
function aventUtiliserBonus(){
  aventCtx.bonusDispo=false;aventCtx.bonusTour=true;
  const r=mulberry32((getDailySeed()*100+dailyTurnIndex+50)>>>0);aventCtx.poolBonus=Array.from({length:5},()=>r());
}
function aventDeBonus(i){return aventCtx?.poolBonus?aventCtx.poolBonus[i]:Math.random();}
// Début de tour : tirage de la case emballée de la colonne Cadeau, d'après la date et le
// numéro du tour, sur un générateur à part pour ne pas décaler les dés du Défi.
function aventTourDebut(){
  if(!aventActif())return;
  aventCtx.emb=null;aventCtx.bonusTour=false;
  if(aventCtx.cfg.cadeau&&players[0].sc.cadeau){
    const libres=ROWS.filter(x=>!['bonus','diff','plus','minus'].includes(x)&&players[0].sc.cadeau[x]===null);
    const r=mulberry32((getDailySeed()*100+dailyTurnIndex)>>>0);
    if(libres.length)aventCtx.emb=libres[Math.floor(r()*libres.length)];
  }
}

// ── Règles branchées sur le moteur ──
function aventLancers(){return 3+(aventCtx?.bonusTour?1:0);}
function aventApresLancer(){if(aventCtx?.cfg.etoile&&dice[0]===6)dice[0]=7;}
function aventDeClasse(i){
  if(!aventCtx)return'';
  return(aventCtx.cfg.etoile&&i===0?' de-etoile':'')+(dice[i]===7?' etoile':'');
}
function aventCadeau(col,row){return!!(aventCtx&&aventCtx.cfg.cadeau&&col==='cadeau'&&aventCtx.emb===row);}
function aventMultFeu(){return Math.min(3,1+.5*(aventCtx?.chaine||0));}
const fmtMult=m=>String(m).replace('.',EN?'.':',');
function aventMult(col,row,v){
  if(!aventCtx)return 1;
  let m=1;
  if(aventCtx.cfg.feu&&v>0&&FIGS.includes(row))m*=aventMultFeu();
  if(aventCadeau(col,row))m*=2;
  return m;
}
function aventApresPose(col,row,s){
  if(!aventCtx)return;
  if(aventCtx.cfg.feu){
    if(FIGS.includes(row)&&typeof s==='number'&&s>0){
      const m=aventMultFeu();
      aventCtx.chaine++;
      if(m>1){
        FXCFG.avfeu={l:'×'+fmtMult(m)+' !',c:m>=3?'#f5c842':m>=2?'#ff9b4a':'#6ee8b0',n:Math.round(60*m),fw:m>=2,dur:2400};
        setTimeout(()=>{try{spawnFx('avfeu',innerWidth/2,innerHeight*.35);}catch(e){}},150);
      }
    }else{
      if(aventCtx.chaine>=2)montBulle(tr('Mèche éteinte, le multiplicateur repart à ×1.','Fuse out, the multiplier drops back to ×1.'),2600);
      aventCtx.chaine=0;
    }
  }
  if(aventCadeau(col,row)&&typeof s==='number'&&s>0)montBulle(tr(`Cadeau ouvert : ${s} points !`,`Gift unwrapped: ${s} points!`),2200);
}
function aventBande(){
  const el=document.getElementById('my-band');if(!el||!aventCtx)return;
  const cfg=aventCtx.cfg,bits=[];
  if(cfg.feu){const m=aventMultFeu();bits.push(`<span class="avb-x${m>1?' on':''}">${tr('prochaine figure','next combo')} <b>×${fmtMult(m)}</b></span>`);}
  if(cfg.cadeau)bits.push(aventCtx.emb?`<span class="avb-x on">✦ ${nomFig(aventCtx.emb)} <b>×2</b></span>`:`<span class="avb-x">✦ ${tr('plus de cadeau','no gift left')}</span>`);
  if(cfg.etoile)bits.push(`<span class="avb-x">★ ${tr('= joker','= joker')}</span>`);
  if(cfg.bonus)bits.push(aventCtx.bonusDispo&&!aventCtx.bonusTour?`<span class="avb-x on">✦ ${tr('lancer bonus','bonus roll')}</span>`:`<span class="avb-x">${tr('bonus utilisé','bonus used')}</span>`);
  el.hidden=false;
  // Toucher le bandeau relit la règle complète du jour
  el.innerHTML=`<button type="button" class="avb" onclick="aventRegle()" aria-label="${tr('Relire la règle du jour','Read the rules of the day')}"><span class="avb-t">${tr('Case','Door')} ${aventCtx.n}<b>${AT(cfg.titre)}</b></span>${bits.join('')}</button>`;
}

