// Socle commun des mini-jeux du calendrier de l'avent de Mon Yams.
// Chaque jeu est une page autonome qui charge shared/pont.js puis ce fichier, et appelle
// Kit.jeu({...}). Le socle fournit : la page (en-tête, canvas à l'échelle, écrans de début,
// de pause et de fin), la langue (fr ou en), les sons synthétisés, les dés dessinés comme
// dans le jeu, les figures au barème de Mon Yams, les particules, le meilleur score et le
// lien avec le calendrier (AventPont).
(function(){
  'use strict';
  const K=window.Kit={};
  const q=new URLSearchParams(location.search);

  // ── Langue : paramètre de l'adresse, sinon la page du calendrier, sinon le navigateur ──
  K.EN=(()=>{
    const l=q.get('lang');if(l==='en')return true;if(l==='fr')return false;
    try{const p=window.parent!==window&&window.parent.document.documentElement.lang;if(p)return!p.startsWith('fr');}catch(e){}
    try{const m=localStorage.getItem('yams_lang');if(m)return m==='en';}catch(e){}
    return!/^fr/i.test(navigator.language||'fr');
  })();
  K.t=(fr,en)=>K.EN?en:fr;
  K.T=a=>Array.isArray(a)?(K.EN?a[1]:a[0]):a;
  document.documentElement.lang=K.EN?'en':'fr';
  K.nb=n=>Math.round(n).toLocaleString(K.EN?'en-US':'fr-FR');

  // ── Couleurs de Mon Yams ──
  K.C={bg:'#09090d',s1:'#111117',s2:'#17171f',s3:'#1e1e28',s4:'#25252f',tx:'#eceaf6',mu:'#8b86a3',
    g:'#27c47e',gl:'#6ee8b0',y:'#f5c842',r:'#f05555',p:'#9b78f0',b:'#4d9bf0',t:'#36cfc0',
    de:'#f3ede2',point:'#1c1a24',neige:'#e9eef7'};
  K.POLICE='ui-rounded,"SF Pro Rounded",-apple-system,BlinkMacSystemFont,system-ui,sans-serif';
  K.police=(px,poids)=>`${poids||700} ${px}px ${K.POLICE}`;

  // ── Outils ──
  K.rnd=(a,b)=>a+Math.random()*(b-a);
  K.ent=(a,b)=>Math.floor(K.rnd(a,b+1));
  K.clamp=(v,a,b)=>v<a?a:v>b?b:v;
  K.lerp=(a,b,t)=>a+(b-a)*t;
  K.dist=(ax,ay,bx,by)=>Math.hypot(bx-ax,by-ay);
  K.mulberry32=a=>function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};

  // ── Figures au barème de Mon Yams (app.js, sc()) ──
  const NOMS={paire:['Paire','Pair'],brelan:['Brelan','Three of a kind'],full:['Full','Full house'],
    suite:['Suite','Straight'],carre:['Carré','Four of a kind'],yams:['Yams','Yams'],rien:['Somme','Sum']};
  K.nomFig=id=>K.T(NOMS[id]||id);
  K.figures=d=>{
    const s=d.reduce((a,v)=>a+v,0),c={};d.forEach(v=>c[v]=(c[v]||0)+1);
    const vv=Object.values(c).sort((a,b)=>b-a),f={};
    const max=n=>Math.max(...Object.keys(c).filter(k=>c[k]>=n).map(Number));
    if(d.length>=2&&vv[0]>=2)f.paire=max(2)*2+10;
    if(d.length>=3&&vv[0]>=3)f.brelan=max(3)*3+20;
    if(d.length===5&&((vv[0]>=3&&vv[1]>=2)||vv[0]===5))f.full=s+20;
    const u=[...new Set(d)].sort((a,b)=>a-b);
    if(d.length===5&&u.length===5&&u[4]-u[0]===4)f.suite=s+30;
    if(d.length>=4&&vv[0]>=4)f.carre=max(4)*4+40;
    if(d.length===5&&vv[0]===5)f.yams=s+50;
    return f;
  };
  // Meilleure figure d'une main : {id, nom, pts}. Sans figure, la somme des dés.
  K.main=d=>{
    // Plus de cinq dés : la meilleure main de cinq parmi eux
    if(d.length>5){
      let best=null;const n=d.length;
      const mieux=(a,b)=>(a.id!=='rien')!==(b.id!=='rien')?a.id!=='rien':a.pts>b.pts;
      const rec=(i,pris)=>{if(pris.length===5){const m=K.main(pris);if(!best||mieux(m,best))best=m;return;}
        if(n-i<5-pris.length)return;rec(i+1,[...pris,d[i]]);rec(i+1,pris);};
      rec(0,[]);return best;
    }
    // Une figure passe toujours avant la somme : une paire reste une paire, même si la
    // somme des dés vaudrait davantage. Sans figure, la main vaut la somme des dés.
    const f=K.figures(d);let best=null;
    for(const k in f)if(!best||f[k]>best.pts)best={id:k,pts:f[k]};
    if(!best)best={id:'rien',pts:d.reduce((a,v)=>a+v,0)};
    best.nom=K.nomFig(best.id);return best;
  };

  // ── Dés dessinés comme dans le jeu ──
  const PIPS={1:[[.5,.5]],2:[[.28,.28],[.72,.72]],3:[[.28,.28],[.5,.5],[.72,.72]],
    4:[[.28,.28],[.72,.28],[.28,.72],[.72,.72]],5:[[.28,.28],[.72,.28],[.5,.5],[.28,.72],[.72,.72]],
    6:[[.28,.25],[.72,.25],[.28,.5],[.72,.5],[.28,.75],[.72,.75]]};
  K.rr=(c,x,y,w,h,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
  // o : {angle, fond, point, bord, alpha, ombre, eclat}
  K.de=(c,x,y,s,face,o)=>{
    o=o||{};c.save();c.translate(x,y);if(o.angle)c.rotate(o.angle);if(o.alpha!=null)c.globalAlpha*=o.alpha;
    const h=s/2,r=s*.2;
    if(o.ombre!==false){c.fillStyle='rgba(0,0,0,.35)';K.rr(c,-h+s*.05,-h+s*.09,s,s,r);c.fill();}
    if(o.eclat){c.shadowColor=o.eclat;c.shadowBlur=s*.6;}
    c.fillStyle=o.fond||K.C.de;K.rr(c,-h,-h,s,s,r);c.fill();c.shadowBlur=0;
    c.lineWidth=Math.max(1,s*.05);c.strokeStyle=o.bord||'rgba(0,0,0,.12)';c.stroke();
    if(face>=1&&face<=6){c.fillStyle=o.point||K.C.point;const pr=s*.095;
      for(const[px,py]of PIPS[face]){c.beginPath();c.arc(-h+px*s,-h+py*s,pr,0,7);c.fill();}}
    else if(face===7){c.fillStyle=o.point||K.C.y;c.font=K.police(s*.62,800);c.textAlign='center';c.textBaseline='middle';c.fillText('★',0,s*.04);}
    c.restore();
  };
  K.DE_OR={fond:'#f5c842',point:'#3a2a05',bord:'rgba(120,80,0,.35)'};

  // ── Sons synthétisés (aucun fichier) ──
  let ac=null,muet=false;
  try{muet=localStorage.getItem('yams_avent_son')==='0';}catch(e){}
  const audio=()=>{
    if(muet)return null;
    if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}
    if(ac.state==='suspended')ac.resume();
    return ac;
  };
  const bip=(f,d,type,vol,glisse,retard)=>{
    const a=audio();if(!a)return;const t=a.currentTime+(retard||0);
    const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
    if(glisse)o.frequency.exponentialRampToValueAtTime(glisse,t+d);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||.12,t+.012);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.03);
  };
  const bruit=(d,vol,filtre,retard)=>{
    const a=audio();if(!a)return;const t=a.currentTime+(retard||0);
    const b=a.createBuffer(1,Math.ceil(a.sampleRate*d),a.sampleRate),x=b.getChannelData(0);
    for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*(1-i/x.length);
    const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();
    s.buffer=b;f.type='bandpass';f.frequency.value=filtre||1800;f.Q.value=.9;g.gain.value=vol||.2;
    s.connect(f).connect(g).connect(a.destination);s.start(t);
  };
  K.note=(f,d,type,vol,retard)=>bip(f,d||.25,type||'triangle',vol||.12,null,retard);
  const SONS={
    tap:()=>bip(660,.06,'triangle',.08),
    clac:()=>{bruit(.07,.25,2400);bip(900,.04,'square',.03);},
    pop:()=>bip(520,.12,'sine',.14,980),
    point:()=>{bip(880,.08,'triangle',.1);bip(1320,.1,'triangle',.08,null,.05);},
    bonus:()=>[523,659,784,1047].forEach((f,i)=>bip(f,.14,'triangle',.1,null,i*.06)),
    yams:()=>[523,659,784,1047,1319,1568].forEach((f,i)=>bip(f,.22,'triangle',.11,null,i*.07)),
    aie:()=>{bip(180,.25,'sawtooth',.08,70);bruit(.15,.15,400);},
    woosh:()=>bruit(.25,.12,900),
    saut:()=>bip(330,.14,'square',.05,660),
    fin:()=>[659,523,392,262].forEach((f,i)=>bip(f,.3,'triangle',.1,null,i*.13)),
    go:()=>[392,523,659].forEach((f,i)=>bip(f,.12,'triangle',.1,null,i*.08)),
  };
  K.son=n=>{try{SONS[n]&&SONS[n]();}catch(e){}};
  K.bruit=bruit;K.bip=bip;

  // ── Particules et textes flottants (dans le repère du jeu) ──
  const parts=[],textes=[];
  K.eclats=(x,y,coul,n,vit)=>{for(let i=0;i<(n||14);i++){const a=Math.random()*Math.PI*2,v=K.rnd(.3,1)*(vit||220);
    parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,vie:K.rnd(.45,.9),t:0,c:Array.isArray(coul)?coul[i%coul.length]:coul,r:K.rnd(2,4.5)});}};
  K.texte=(x,y,txt,coul,taille)=>textes.push({x,y,txt,c:coul||K.C.y,s:taille||22,t:0,vie:1.1});
  let secousse=0;K.secoue=v=>secousse=Math.max(secousse,v);
  const fxMaj=dt=>{
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;p.vx*=.98;if(p.t>p.vie)parts.splice(i,1);}
    for(let i=textes.length-1;i>=0;i--){const t=textes[i];t.t+=dt;t.y-=38*dt;if(t.t>t.vie)textes.splice(i,1);}
    secousse=Math.max(0,secousse-dt*30);
  };
  const fxDessin=c=>{
    for(const p of parts){c.globalAlpha=Math.max(0,1-p.t/p.vie);c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill();}
    c.globalAlpha=1;c.textAlign='center';c.textBaseline='middle';
    for(const t of textes){const k=Math.min(1,t.t*8);c.globalAlpha=Math.max(0,1-Math.max(0,t.t-.6)/.5);
      c.font=K.police(t.s*(.6+.4*k),800);c.lineWidth=4;c.strokeStyle='rgba(9,9,13,.85)';c.strokeText(t.txt,t.x,t.y);c.fillStyle=t.c;c.fillText(t.txt,t.x,t.y);}
    c.globalAlpha=1;
  };
  K.viderFx=()=>{parts.length=0;textes.length=0;secousse=0;};

  // ── Flocons de fond, communs à tous les jeux ──
  let flocons=[];
  K.neige=(c,W,H,dt,dens)=>{
    if(!flocons.length||flocons._w!==W){flocons=Array.from({length:dens||40},()=>({x:Math.random()*W,y:Math.random()*H,r:K.rnd(.6,2),v:K.rnd(12,34),o:Math.random()*6}));flocons._w=W;}
    c.fillStyle='rgba(233,238,247,.5)';
    for(const f of flocons){f.y+=f.v*dt;f.o+=dt;f.x+=Math.sin(f.o)*6*dt;if(f.y>H+4){f.y=-4;f.x=Math.random()*W;}
      c.globalAlpha=.25+f.r/4;c.beginPath();c.arc(f.x,f.y,f.r,0,7);c.fill();}
    c.globalAlpha=1;
  };

  // ── Page et boucle ──
  const $=id=>document.getElementById(id);
  const ICO_SON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICO_MUET='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

  K.jeu=cfg=>{
    const n=+q.get('case')||cfg.case;
    const cle='yams_avent_jeu_'+cfg.id;
    let meilleur=0;try{meilleur=+localStorage.getItem(cle)||0;}catch(e){}
    document.title=K.T(cfg.titre)+' | Mon Yams';
    const stats=(cfg.stats||[]).map(s=>`<div class="stat${s[0]==='score'?' score':['coeurs','vies'].includes(s[0])?' vie':''}"><b id="st-${s[0]}">${s[2]??0}</b><span>${K.T(s[1])}</span></div>`).join('');
    document.body.innerHTML=`<div id="app">
  <header><h1${K.T(cfg.titre).length>13?' class="long"':''}><small><span class="mo">Mon Yams, </span>${K.t('case','door')} ${n}</small>${K.T(cfg.titre)}</h1>
    <div class="stats">${stats}<button id="son" aria-label="${K.t('Son','Sound')}"></button></div></header>
  <div id="wrap"><canvas id="cv"></canvas><div id="bulle"></div>
    <div class="voile on" id="v-debut"><div class="carte">
      <h2>${K.T(cfg.titre)}</h2><p>${K.T(cfg.accroche)}</p>
      <ul class="regles">${cfg.regles.map(r=>`<li>${K.T(r).replace(/([^.])\.\s*$/,"$1")}</li>`).join('')}</ul>
      ${meilleur?`<p class="record">${K.t('Ton record :','Your best:')} <b>${K.nb(meilleur)}</b></p>`:''}
      <div class="btns"><button class="btn" id="b-go">${K.T(cfg.bouton||['Jouer','Play'])}</button></div></div></div>
    <div class="voile" id="v-pause"><div class="carte"><h2>${K.t('Pause','Paused')}</h2>
      <div class="btns"><button class="btn" id="b-reprendre">${K.t('Reprendre','Resume')}</button></div></div></div>
    <div class="voile" id="v-fin"><div class="carte"><h2 id="f-titre"></h2><div class="gros" id="f-score">0</div>
      <div class="record" id="f-record"></div><div class="grille" id="f-grille"></div><div class="pub" id="f-pub"></div>
      <div class="btns"><button class="btn alt" id="b-partage">${K.t('Partager','Share')}</button><button class="btn" id="b-rejouer">${K.t('Rejouer','Play again')}</button></div></div></div>
  </div></div>`;
    const W=cfg.W||400,H=cfg.H||640,cv=$('cv'),c=cv.getContext('2d'),wrap=$('wrap');
    let echelle=1;
    const taille=()=>{const r=wrap.getBoundingClientRect();echelle=Math.min(r.width/W,r.height/H);const d=window.devicePixelRatio||1;
      cv.style.width=W*echelle+'px';cv.style.height=H*echelle+'px';cv.width=Math.round(W*echelle*d);cv.height=Math.round(H*echelle*d);};
    window.addEventListener('resize',taille);taille();
    const majSon=()=>{$('son').innerHTML=muet?ICO_MUET:ICO_SON;};majSon();
    $('son').onclick=()=>{muet=!muet;try{localStorage.setItem('yams_avent_son',muet?'0':'1');}catch(e){}majSon();if(!muet)K.son('tap');};

    K.etat='debut';K.W=W;K.H=H;K.temps=0;
    K.stat=(id,v)=>{const e=$('st-'+id);if(typeof v==='number')v=K.nb(v);if(e&&e.textContent!==String(v))e.textContent=v;};
    let bulleT=0;K.bulle=(txt,ms)=>{const b=$('bulle');b.textContent=txt;b.classList.add('on');clearTimeout(bulleT);bulleT=setTimeout(()=>b.classList.remove('on'),ms||1600);};

    const lancer=()=>{
      ['v-debut','v-fin','v-pause'].forEach(v=>$(v).classList.remove('on'));
      K.viderFx();K.temps=0;K.etat='jeu';audio();K.son('go');
      cfg.demarrer();window.AventPont&&AventPont.debut();
    };
    $('b-go').onclick=lancer;$('b-rejouer').onclick=lancer;
    $('b-reprendre').onclick=()=>{$('v-pause').classList.remove('on');K.etat='jeu';dernier=performance.now();};
    K.pause=()=>{if(K.etat!=='jeu')return;K.etat='pause';$('v-pause').classList.add('on');actif=null;cfg.relache&&cfg.relache();};
    document.addEventListener('visibilitychange',()=>{if(document.hidden)K.pause();});
    window.addEventListener('blur',()=>K.pause());

    let partage='';
    $('b-partage').onclick=()=>{
      const url='https://monyams.app/avent/'+n;
      if(navigator.share){navigator.share({text:partage,url}).catch(()=>{});return;}
      navigator.clipboard?.writeText(partage+'\n'+url).then(()=>K.bulle(K.t('Score copié','Score copied'))).catch(()=>{});
    };
    // o : {score, titre:[fr,en], details:[[valeur,[fr,en]],...], rang}
    K.fin=o=>{
      if(K.etat==='fin')return;K.etat='fin';
      const sc=Math.max(0,Math.round(o.score||0)),neuf=sc>meilleur;
      if(neuf){meilleur=sc;try{localStorage.setItem(cle,sc);}catch(e){}}
      window.AventPont&&AventPont.fin(sc,o.rang);
      K.son(neuf&&sc>0?'bonus':'fin');
      $('f-titre').textContent=K.T(o.titre||['Partie terminée','Game over']);
      $('f-score').textContent=K.nb(sc);
      const r=$('f-record');r.className='record'+(neuf&&sc>0?' neuf':'');
      r.textContent=neuf&&sc>0?K.t('Nouveau record !','New best!'):K.t(`Ton record : ${K.nb(meilleur)}`,`Your best: ${K.nb(meilleur)}`);
      $('f-grille').innerHTML=(o.details||[]).map(d=>`<div><b>${d[0]}</b><span>${K.T(d[1])}</span></div>`).join('');
      partage=K.t(`🎄 ${K.T(cfg.titre)}, case ${n} du calendrier de l'avent de Mon Yams : ${K.nb(sc)} points. À toi !`,
        `🎄 ${K.T(cfg.titre)}, door ${n} of the Mon Yams advent calendar: ${K.nb(sc)} points. Your turn!`);
      $('f-pub').innerHTML=window.AventPont&&AventPont.dansCalendrier?`<p class="pub-l">${K.t('Publication du score…','Posting your score…')}</p>`:'';
      setTimeout(()=>$('v-fin').classList.add('on'),o.delai??700);
    };

    // Publication du score, pilotée par la page du calendrier : prénom demandé s'il est
    // inconnu, puis rang et podium de la case
    const rang=r=>K.EN?r+(r%10===1&&r%100!==11?'st':r%10===2&&r%100!==12?'nd':r%10===3&&r%100!==13?'rd':'th'):r+(r===1?'er':'e');
    window.addEventListener('message',e=>{
      if(e.source!==window.parent||!e.data||e.data.type!=='avent-pub')return;
      const box=$('f-pub'),m=e.data;box.innerHTML='';
      if(m.etat==='nom'){
        box.innerHTML=`<p class="pub-l">${K.t('Ton prénom pour le classement de la case :','Your name for the door leaderboard:')}</p>
          <div class="pub-f"><input id="f-nom" maxlength="20" autocomplete="given-name" placeholder="${K.t('Ton prénom','Your name')}"><button class="btn" id="f-ok">${K.t('Publier','Post')}</button></div>`;
        const go=()=>{const v=$('f-nom').value.trim();if(!v){$('f-nom').focus();return;}$('f-ok').disabled=true;
          window.parent.postMessage({type:'avent-publier',pseudo:v},location.origin);};
        $('f-ok').onclick=go;$('f-nom').onkeydown=ev=>{if(ev.key==='Enter')go();};
      }else if(m.etat==='ok'){
        const l=document.createElement('p');l.className='pub-l';
        l.textContent=K.t(`Classement de la case : ${rang(m.rang)} sur ${m.total}`,`Door leaderboard: ${rang(m.rang)} of ${m.total}`);box.appendChild(l);
        const ol=document.createElement('ol');ol.className='pub-top';
        m.top.forEach((r,i)=>{const li=document.createElement('li');if(r.pseudo.toLowerCase()===m.pseudo.toLowerCase())li.className='moi';
          const a=document.createElement('span');a.textContent=`${i+1}. ${r.pseudo}`;const b=document.createElement('b');b.textContent=K.nb(r.score);
          li.append(a,b);ol.appendChild(li);});
        box.appendChild(ol);
      }
    });
    // Pointeur dans le repère du jeu
    const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H];};
    let actif=null;
    // zone tactile : le canvas, ou toute la zone de jeu (cfg.zone==='wrap') pour une manette
    const zt=cfg.zone==='wrap'?wrap:cv;
    // un second doigt posé pendant que le premier dirige : rappel à part, sans voler la direction
    zt.addEventListener('pointerdown',e=>{if(K.etat!=='jeu')return;audio();
      if(actif!==null&&actif!==e.pointerId&&cfg.second){const[x,y]=pos(e);cfg.second(x,y,e);e.preventDefault();return;}
      actif=e.pointerId;try{zt.setPointerCapture(e.pointerId);}catch(x){}
      const[x,y]=pos(e);cfg.bas&&cfg.bas(x,y,e);e.preventDefault();});
    zt.addEventListener('pointermove',e=>{if(K.etat!=='jeu')return;const[x,y]=pos(e);
      if(actif===e.pointerId)cfg.glisse&&cfg.glisse(x,y,e);cfg.survol&&cfg.survol(x,y,e);});
    const haut=e=>{if(actif!==e.pointerId)return;actif=null;if(K.etat!=='jeu')return;const[x,y]=pos(e);cfg.haut&&cfg.haut(x,y,e);};
    zt.addEventListener('pointerup',haut);zt.addEventListener('pointercancel',haut);
    window.addEventListener('keydown',e=>{
      if(document.activeElement?.tagName==='INPUT')return;
      if((e.key===' '||e.key==='Enter')&&K.etat!=='jeu'&&K.etat!=='pause'&&document.activeElement?.tagName!=='BUTTON'){e.preventDefault();lancer();return;}
      if(e.key==='Escape'||e.key==='p'){if(K.etat==='jeu')K.pause();else if(K.etat==='pause')$('b-reprendre').click();return;}
      if(K.etat==='jeu'&&cfg.touche){cfg.touche(e.key,true,e);if(e.key.startsWith('Arrow')||e.key===' ')e.preventDefault();}
    });
    window.addEventListener('keyup',e=>{if(K.etat==='jeu'&&cfg.touche)cfg.touche(e.key,false,e);});

    let dernier=performance.now();
    const boucle=t=>{
      // dt : temps du jeu, arrêté hors partie ; dtv : temps du décor, arrêté seulement en pause
      const dtv=K.etat==='pause'?0:Math.min(.033,(t-dernier)/1000);dernier=t;K.tFrame=t;
      const dt=K.etat==='jeu'?dtv:0;
      if(dt){K.temps+=dt;cfg.maj(dt);}
      fxMaj(dtv);
      const d=window.devicePixelRatio||1;c.setTransform(echelle*d,0,0,echelle*d,0,0);
      if(secousse>0)c.translate(K.rnd(-secousse,secousse)*.4,K.rnd(-secousse,secousse)*.4);
      cfg.dessiner(c,dtv);fxDessin(c);
      requestAnimationFrame(boucle);
    };
    if(cfg.preparer)cfg.preparer();
    requestAnimationFrame(boucle);
    // Accès pour les tests automatisés
    window.__kit={lancer,cfg,get etat(){return K.etat;}};
  };
})();
