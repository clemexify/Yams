// ══ THÈME DE NOËL ════════════════════════════════════════
// Du 25 novembre au 6 janvier : bonnet sur le « s » du logo et décorations qui tombent
// derrière les écrans (jamais devant la grille ni les dés). Moitié flocons générés (100),
// moitié pictos du Yams (100), toujours au trait, jamais d'aplat, dorés ou argentés, et qui
// changent de dessin à chaque chute. Repris du thème de Villodoku.
// Chargé après app.js. Hors production : ?jour=2026-12-05 (comme le Défi) ou ?noel=1 / ?noel=0.

(function(){
const f=n=>Math.round(n*100)/100;
/** Cercle */
const o=(cx,cy,r)=>`M${f(cx-r)} ${f(cy)}a${r} ${r} 0 1 0 ${f(2*r)} 0a${r} ${r} 0 1 0 ${f(-2*r)} 0`;
/** Ellipse */
const el=(cx,cy,rx,ry)=>`M${f(cx-rx)} ${f(cy)}a${rx} ${ry} 0 1 0 ${f(2*rx)} 0a${rx} ${ry} 0 1 0 ${f(-2*rx)} 0`;
/** Étoile à 5 branches */
const star=(cx,cy,r)=>{
  const p=Array.from({length:10},(_,i)=>{
    const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;
    return`${f(cx+Math.cos(a)*rr)} ${f(cy+Math.sin(a)*rr)}`;
  });
  return`M${p.join('L')}Z`;
};

// ── Dés ────────────────────────────────────────────────
const PIPS={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],
  5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1]]};
/** Dé vu de face : carré arrondi de côté s, tourné de `deg` degrés, avec ses points */
function de(cx,cy,s,n,deg=0){
  const a=deg*Math.PI/180,c=Math.cos(a),si=Math.sin(a);
  const P=(x,y)=>`${f(cx+x*c-y*si)} ${f(cy+x*si+y*c)}`;
  const h=s/2,r=s*.2,k=h-r;
  const d=`M${P(-k,-h)}L${P(k,-h)}A${f(r)} ${f(r)} 0 0 1 ${P(h,-k)}L${P(h,k)}A${f(r)} ${f(r)} 0 0 1 ${P(k,h)}`+
    `L${P(-k,h)}A${f(r)} ${f(r)} 0 0 1 ${P(-h,k)}L${P(-h,-k)}A${f(r)} ${f(r)} 0 0 1 ${P(-k,-h)}Z`;
  const q=s*.27,pr=Math.max(.45,s*.07);
  return[d,...PIPS[n].map(([x,y])=>{const X=cx+(x*q)*c-(y*q)*si,Y=cy+(x*q)*si+(y*q)*c;return o(X,Y,pr);})];
}
/** Dé en perspective : dessus, face gauche, face droite */
function cube(t,l,r,a=9.5,cx=12,cy=12.5){
  const u=.866*a;
  const H=[[cx,cy-a],[cx+u,cy-a/2],[cx+u,cy+a/2],[cx,cy+a],[cx-u,cy+a/2],[cx-u,cy-a/2]];
  const parts=[`M${H.map(p=>p.map(f).join(' ')).join('L')}Z`,
    `M${cx} ${cy}L${f(H[1][0])} ${f(H[1][1])}M${cx} ${cy}L${f(H[5][0])} ${f(H[5][1])}M${cx} ${cy}L${cx} ${f(cy+a)}`];
  const face=(n,c,e1,e2)=>PIPS[n].forEach(([x,y])=>parts.push(o(c[0]+.6*(x*e1[0]+y*e2[0]),c[1]+.6*(x*e1[1]+y*e2[1]),.5)));
  face(t,[cx,cy-a/2],[u/2,-a/4],[-u/2,-a/4]);
  face(l,[cx-u/2,cy+a/4],[-u/2,-a/4],[0,a/2]);
  face(r,[cx+u/2,cy+a/4],[u/2,-a/4],[0,a/2]);
  return parts;
}
const plat=(...l)=>l.flat();

const DES=[
  ...[1,2,3,4,5,6].map(n=>de(12,12,17,n)),
  ...[1,2,3,4,5,6].map((n,i)=>de(12,12,15.5,n,i%2?16:-16)),
  ...[[1,2,3],[2,3,1],[3,1,2],[1,4,2],[2,1,4],[1,3,2]].map(t=>cube(...t)),
  ...[1,2,3].map((n,i)=>plat(de(7,7.5,9,n,-12),de(17,16.5,9,n,10+i))),
  plat(de(12,6.3,8.6,1,-6),de(7,16.8,8.6,1,8),de(17,16.8,8.6,1,-4)),
  plat(de(12,6.3,8.6,2,4),de(7,16.8,8.6,2,-8),de(17,16.8,8.6,2,6)),
  plat(de(12,6.3,8.6,3,-4),de(7,16.8,8.6,3,6),de(17,16.8,8.6,3,-8)),
  plat(de(7,7,8.6,1,-6),de(17,7,8.6,1,5),de(7,17,8.6,1,4),de(17,17,8.6,1,-7)),
  plat(de(5.5,5.5,6,1),de(18.5,5.5,6,1),de(12,12,6,1,45),de(5.5,18.5,6,1),de(18.5,18.5,6,1)),
  plat(de(5.5,18.5,6.5,1,-8),de(12,12,6.5,2,-8),de(18.5,5.5,6.5,3,-8)),
  // Dé qui roule, avec traînée
  plat(de(15,13,12,5,20),['M2 10h5M3 14h4M4 18h4']),
  // Dé qui rebondit
  plat(de(17.5,16,9,4,-15),['M2 20c2-12 6-14 9-6','M11 14c.6-2 1.5-3 2.5-3']),
  // Dé qui brille (le Yams !)
  plat(de(12,13,12,6,-8),['M12 2.5v2M4 6l1.5 1.5M20 6l-1.5 1.5M2.5 13h2M21.5 13h-2']),
];

// ── Pictos dessinés ────────────────────────────────────
const DESSINS=[
  // Gobelets et pistes
  ['M6 5h12l-1.6 15.2a1 1 0 0 1-1 .8H8.6a1 1 0 0 1-1-.8z',el(12,5,6,1.4),'M6.6 9.5h10.8M7.4 16.5h9.2'],
  ['M3 12.5 8 3l9.5 4.5-3 10.5z',el(5.6,7.8,1.5,5.3),...de(18,18.5,7,3,18)],
  ['M7 12h10l-1.2 9H8.2z',el(12,12,5,1.2),...de(8,5,5.5,1,-20),...de(16.5,4.5,5.5,2,15)],
  ['M6 5h12l-1.6 15.2a1 1 0 0 1-1 .8H8.6a1 1 0 0 1-1-.8z',el(12,5,6,1.4),'M8 8.5v.01M10 8.5v.01M12 8.5v.01M14 8.5v.01M16 8.5v.01','M9 18.5v.01M11 18.5v.01M13 18.5v.01M15 18.5v.01'],
  ['M8 3h8l5 5v8l-5 5H8l-5-5V8z','M9.3 6h5.4l3.3 3.3v5.4L14.7 18H9.3L6 14.7V9.3z',...de(12,12,6.5,2,12)],
  [el(12,14,10,6),el(12,13,8,4.4),...de(9,12.5,4.6,1,-10),...de(15,13,4.6,1,12)],
  // Feuille de score et papeterie
  ['M5 2.5h14v19H5z','M5 7h14M5 11h14M5 15h14M10 2.5v19M14.5 2.5v19'],
  ['M3 3h12v18H3z','M3 7.5h12M3 12h12M3 16.5h12M7.5 3v18','M21.5 6.5 14 14l-1 3 3-1 7.5-7.5z','M19.5 8.5l2 2'],
  ['M5 4h14v17H5z','M8 2v4M12 2v4M16 2v4','M8 10h8M8 13.5h8M8 17h5'],
  ['M4 20 5 15 17 3l4 4L9 19z','M15 5l4 4','M5 15l4 4'],
  ['M3 21l1.5-5L15 5.5l3.5 3.5L8 19.5z','M15 5.5 17 3.5a1.4 1.4 0 0 1 2 0l1.5 1.5a1.4 1.4 0 0 1 0 2L18.5 9','M13.5 7l3.5 3.5'],
  ['M3 15 12 6l8 8-5 5H9z','M8 10l8 8','M3 21h18'],
  ['M6 4h12v17H6z','M9 2.5h6v3H9z','M9 10h6M9 13.5h6M9 17h3'],
  // Temps
  ['M6 2.5h12M6 21.5h12','M7 2.5c0 5 10 6 10 9.5s-10 4.5-10 9.5M17 2.5c0 5-10 6-10 9.5s10 4.5 10 9.5','M10 18h4'],
  [o(12,13.5,8),'M10 2.5h4M12 2.5v3','M12 13.5V9.5M12 13.5l2.5 2','M19 6l1.5-1.5'],
  [o(12,12,9.5),'M12 6.5V12l3.5 2','M12 3.5v.01M20.5 12h-.01M12 20.5v.01M3.5 12h.01'],
  // Défi du jour, calendrier, série
  ['M3 5h18v16H3z','M3 9.5h18','M8 3v4M16 3v4',...de(12,15.3,6.4,5)],
  ['M3 3h18v18H3z','M9 3v18M15 3v18M3 9h18M3 15h18','M15 9l3.5-1.5V13.5L15 15'],
  ['M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z','M12 21c-1.8 0-3-1.3-3-3 0-1.5 1.5-2.5 2-4 1 1.5 4 2.5 4 4 0 1.7-1.2 3-3 3z'],
  // Récompenses
  ['M7 3h10v6a5 5 0 0 1-10 0z','M7 5H4v1.5a3.5 3.5 0 0 0 3.5 3.5M17 5h3v1.5a3.5 3.5 0 0 1-3.5 3.5','M12 14v4','M8 21h8M9 18h6'],
  ['M6 3h12v5a6 6 0 0 1-12 0z','M6 4.5C3 4.5 2.5 9 6.5 10M18 4.5c3 0 3.5 4.5-.5 5.5','M12 14v3.5','M7.5 21l1-3.5h7l1 3.5z',star(12,7.5,2.6)],
  [o(12,15.5,5.5),'M8.5 11.2 5 2.5h4.5l2.5 6 2.5-6H19l-3.5 8.7',star(12,15.5,2.8)],
  ['M3 7l4.5 4L12 4.5l4.5 6.5L21 7l-2 11H5z','M5 21h14',o(12,13.5,1.5)],
  ['M8.5 9h7v12h-7z','M2 13h6.5v8H2zM15.5 15H22v6h-6.5z','M12 4.5v2M11 5l1-1'],
  [star(12,12.5,10)],
  [star(4.5,14,3.2),star(12,10,4.4),star(19.5,14,3.2)],
  // Mont Yams
  ['M2 20 9.5 8l3.5 5.5 3-4.5L22 20z','M9.5 8V2.5l4 1.5-4 1.5','M7.5 11.2l2 1 2-1.5'],
  ['M1.5 20 8 9.5l4 6 4-9L22.5 20z','M14 11l2-4.5 2 4-2-1z','M6.2 12.3 8 9.5l1.6 2.4'],
  ['M5 21V3','M5 4h13l-3 4 3 4H5'],
  ['M3 11 12 4l9 7','M5 9.5V21h14V9.5','M10 21v-5h4v5','M7.5 12.5h2.5v2.5H7.5zM14 12.5h2.5v2.5H14z'],
  ['M5 9h14v11H5z','M12 9V5',o(12,4,1.2),'M3 13v3M21 13v3',o(9,13.5,1.4),o(15,13.5,1.4),'M9 17.5h6'],
  ['M4 20 18 6M20 20 6 6','M15 3.5l5 0 .5 5M9 3.5H4L3.5 8.5','M3 18l3 3M21 18l-3 3'],
  // Colonnes de la grille
  ['M4 3h16v18H4z','M12 7v10M8 13l4 4 4-4'],
  ['M4 3h16v18H4z','M12 17V7M8 11l4-4 4 4'],
  ['M4 3h16v18H4z','M12 5.5v13M9 8.5l3-3 3 3M9 15.5l3 3 3-3'],
  ['M3 8l6 8M9 8l-6 8','M13 9.5a3.5 3.5 0 0 1 7 0c0 3-7 4.5-7 7h7.5'],
  ['M3 10v4h3l7 5V5L6 10z','M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11'],
  [o(12,12,9.5),o(12,12,6),o(12,12,2.5)],
  ['M18 4H6l6.5 8L6 20h12'],
  // Chance
  [o(9,8.5,3.5),o(15.5,8.5,3.5),o(9,15,3.5),o(15.5,15,3.5),'M12.2 11.8c2 3 3 6 3.3 9.7'],
  ['M6.5 20c-3-4-3-13 5.5-14.5S20.5 16 17.5 20','M9.5 20c-1.5-3-1.5-9.5 2.5-10.5s4 7.5 3 10.5','M6.5 20h3M14.5 20h3','M6.4 15.5h.01M6.7 11h.01M17.3 11h.01M17.6 15.5h.01'],
  [o(12,12,9),o(12,12,6.5),'M15 9a3.8 3.8 0 1 0 0 6','M8 11h5M8 13.2h5'],
  ['M9 18h6M10 21h4','M9 18c0-3-3.5-4.5-3.5-8.5a6.5 6.5 0 0 1 13 0c0 4-3.5 5.5-3.5 8.5','M10.5 13 12 10.5l1.5 2.5'],
  [o(10,10,6.5),'M15 15l6 6'],
  ['M5 11h14v10H5z','M8 11V7a4 4 0 0 1 8 0v4',o(12,15.5,1.5),'M12 17v1.5'],
  ['M12 2.5 20 6v6c0 5-3.5 8-8 9.5-4.5-1.5-8-4.5-8-9.5V6z',star(12,11.5,4.2)],
  // Noël et Yams
  plat(de(12,15,13,5,0),['M4.5 9C6 3 13 1 18 3.5c1.5 1 2 2 2.5 3.5','M5 8.5h14',o(20.5,8,1.5)]),
  plat(de(12,13,17,1,0).slice(0,1),['M12 4.5v17M3.5 13h17','M12 4.5C10 1.5 7 1.5 7 3.2s2.5 1.3 5 1.3c2.5 0 5 .4 5-1.3s-3-1.7-5 1.3'],[o(7.5,8.7,.7),o(16.5,17.3,.7)]),
  [o(12,14,7.5),'M10 6.5h4v-1.8h-4zM12 4.7V2.5','M8.5 11.5v.01M15.5 11.5v.01M12 14v.01M8.5 16.5v.01M15.5 16.5v.01'],
  ['M12 2 6.5 9h3L5 15.5h3.5L4.5 21h15L15.5 15.5H19L14.5 9h3z','M12 21v1.5',o(11,11.5,.8),o(14,15,.8),o(9.5,17.5,.8)],
  ['M8 2.5h7v10l2.5 3a2.5 2.5 0 0 1-2 4H11a4 4 0 0 1-3-1.5L5.5 14.5a2.6 2.6 0 0 1 2.5-3.6z','M8 5.5h7',o(10.2,9,.6),o(12.8,12,.6),o(14.5,16.5,.6)],
  [o(12,7,3.5),o(12,16.5,5.5),'M9.5 4.2 8.8 2h6.4l-.7 2.2','M12 13.8v.01M10.5 15.5v.01M13.5 17.5v.01M12 19.3v.01','M6.8 14 3.5 11.5M17.2 14l3.3-2.5','M10.8 7.2h.01M13.2 7.2h.01'],
  // Fête
  ['M3 21 8 8l8 8z','M6 13l5 5M5 16.5l2.5 2.5','M14 3.5v2M18.5 5.5l-1.5 1.5M20.5 10h-2','M11 3l.5 2M17 12.5l2 .5'],
  ['M6 3h5l-.5 5a2 2 0 0 1-4 0z','M13 3h5l.5 5a2 2 0 0 1-4 0z','M8.5 10v8M15.5 10v8','M6 21h5M13 21h5','M12 1.5v1'],
  ['M7 8.5h10v4a5 5 0 0 1-10 0z','M17 9.5h1.5a2.5 2.5 0 0 1 0 5H16','M5 20.5h14','M9.5 5.5c-.8-1 .8-2 0-3M13 5.5c-.8-1 .8-2 0-3'],
  ['M6 17c1-2 1-4 1-7a5 5 0 0 1 10 0c0 3 0 5 1 7z','M4.5 17h15',o(12,19.5,1.5),'M12 5V3.5'],
  ['M4 10h16v11H4z','M3 7h18v3H3z','M12 7v14','M12 7C10 4 7 3 7 5s3 2 5 2c2 0 5 0 5-2s-3-1-5 2'],
  [star(16,8,5.5),'M11 11 3 19M9 9 2 13M13 13 9 21'],
  ['M8 3c0 3-2 4-2 6a6 6 0 0 0 12 0c0-2-2-3-2-6','M8 3h8','M7 12c3 1.5 7 1.5 10 0',...de(12,16.8,4.5,1)],
  ['M2 6h20v12H2z','M2 6l10 7 10-7',...de(18,15,4,2,10)],
  ['M12 21c-6-4-9-7.5-9-11.5A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 9 2.5c0 4-3 7.5-9 11.5z','M9.5 11v.01M14.5 11v.01M12 14v.01'],
  // Ajouts
  ['M5 16c0-6 3-10 7-10s7 4 7 10','M4 16h16v3.5H4z',o(12,4,2),'M9 12h.01M12 10.5h.01M15 12h.01'],
  ['M15 21V8a3.5 3.5 0 0 0-7 0v1','M15 11l-2.5 2M15 15.5l-2.5 2M14.5 7l-2.8 2.4'],
  [...de(12,12,18,1).slice(0,1),'M12 6.5v11M7.2 9.2l9.6 5.6M7.2 14.8l9.6-5.6'],
  ['M12 21.5s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z',o(12,10.5,2.3)],
  ['M8.5 7h7','M9 7 5.8 16.5A3.5 3.5 0 0 0 9.1 21h5.8a3.5 3.5 0 0 0 3.3-4.5L15 7','M9.5 3.5c1 2 4 2 5 0',...de(12,15,5.5,3,10)],
  ['M7 2.5h10a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V4A1.5 1.5 0 0 1 7 2.5z','M10.5 18.5h3',...de(12,10,7,5,-10)],
  ['M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z',star(18,5,2.5)],
  ['M2 4c5 4 15 4 20 0','M6 6.5v2M12 7.5v2.5M18 6.5v2',...de(6,11.5,5,1,-8),...de(12,13,5,2,4),...de(18,11.5,5,3,10)],
  ['M8 3.5h8V15H8z','M3.5 15h17','M8 12h8',...de(12,19.5,4,1)],
  [o(12,9,6.5),'M9 15l-1.5 6.5L12 19l4.5 2.5L15 15','M11 7.5l1.5-1v5.5'],
];

// Base de 100 pictos : complétée par des dés tournés s'il en manque, coupée au-delà.
const PICTOS=DES.concat(DESSINS);
while(PICTOS.length<100)PICTOS.push(de(12,12,14+(PICTOS.length%3)*2,1+PICTOS.length%6,(PICTOS.length*23)%60-30));
PICTOS.length=100;

// ── Flocons générés ─────────────────────────────────────
function rng(seed){
  let a=seed>>>0;
  return()=>{a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
}
function flocon(n){
  const r=rng(n*7919+17);
  const bras=r()<.2?8:6,len=8.5+r()*1.5,parts=[];
  const branches=Array.from({length:1+Math.floor(r()*3)},()=>({at:.3+r()*.55,size:1.5+r()*2.5,angle:.5+r()*.5}));
  const bout=Math.floor(r()*4),coeur=Math.floor(r()*3);
  for(let k=0;k<bras;k++){
    const a=k/bras*Math.PI*2-Math.PI/2,ux=Math.cos(a),uy=Math.sin(a);
    const at=(d,side=0,s=0)=>[12+ux*d+Math.cos(a+side)*s,12+uy*d+Math.sin(a+side)*s];
    const [x0,y0]=at(coeur?2.4:0),[x1,y1]=at(len);
    let d=`M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`;
    for(const b of branches){
      const [bx,by]=at(len*b.at),[lx,ly]=at(len*b.at,-b.angle,b.size),[rx,ry]=at(len*b.at,b.angle,b.size);
      d+=`M${f(lx)} ${f(ly)}L${f(bx)} ${f(by)}L${f(rx)} ${f(ry)}`;
    }
    if(bout===1){const [cx,cy]=at(len+.9);d+=o(cx,cy,.9);}
    else if(bout>1){
      const [ax,ay]=bout===2?at(len-1.2,-.6,1):at(len,-.7,1.6),[bx,by]=bout===2?at(len-1.2,.6,1):at(len,.7,1.6);
      d+=`M${f(ax)} ${f(ay)}L${f(x1)} ${f(y1)}L${f(bx)} ${f(by)}`;
    }
    parts.push(d);
  }
  if(coeur===1)parts.push(o(12,12,2.4));
  if(coeur===2)parts.push(`M${Array.from({length:6},(_,i)=>{const a=i/6*Math.PI*2;return`${f(12+Math.cos(a)*2.6)} ${f(12+Math.sin(a)*2.6)}`;}).join('L')}Z`);
  return parts;
}
const FLOCONS=Array.from({length:100},(_,i)=>flocon(i));

/** Décoration au hasard : un flocon une fois sur deux, sinon un picto du Yams */
const tirer=()=>(Math.random()<.5?FLOCONS:PICTOS)[Math.floor(Math.random()*100)];
const svg=(parts,taille,metal)=>`<svg class="neige-${metal}" viewBox="0 0 24 24" width="${f(taille)}" height="${f(taille)}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${parts.map(d=>`<path d="${d}"/>`).join('')}</svg>`;
const metal=()=>Math.random()<.5?'or':'argent';
const rand=(a,b)=>a+Math.random()*(b-a);

// ── Période ────────────────────────────────────────────
function estNoel(){
  const prod=/(^|\.)monyams\.app$/.test(location.hostname);
  if(!prod){const p=new URLSearchParams(location.search).get('noel');if(p==='1')return true;if(p==='0')return false;}
  const d=typeof jourDuDefi==='function'?jourDuDefi():new Date();
  // du 25 novembre au 6 janvier (mise en place avancée au 25 novembre 2026, demande de Clément)
  return(d.getMonth()===10&&d.getDate()>=25)||d.getMonth()===11||(d.getMonth()===0&&d.getDate()<=6);
}

// ── Compte à rebours jusqu'à Noël, sous le logo de l'accueil ──
// « 29 J 08 H 12 M » avec un petit sapin au trait. Minuit le 25 décembre, heure de Paris
// (23 h UTC le 24). Le jour de Noël et jusqu'au 6 janvier : « Joyeux Noël ! ».
const SAPIN=`<svg class="noel-sapin" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5L11 4.5z"/><path d="M12 8.5l-5 6h3l-4 5h12l-4-5h3z"/><path d="M12 19.5v2"/></svg>`;
function compteNoel(){
  const stats=document.getElementById('ss-stats');if(!stats)return;
  let el=document.getElementById('noel-compte');
  if(!el){el=document.createElement('p');el.id='noel-compte';el.className='noel-compte';stats.after(el);}
  const tr_=(fr,en)=>typeof tr==='function'?tr(fr,en):fr;
  const maj=()=>{
    const now=Date.now(),an=new Date().getUTCFullYear(),cible=Date.UTC(an,11,24,23,0,0);
    let ms=cible-now;
    if(ms<=0||new Date().getUTCMonth()===0){el.innerHTML=SAPIN+`<span>${tr_('Joyeux Noël !','Merry Christmas!')}</span>`;return;}
    const j=Math.floor(ms/864e5),h=Math.floor(ms/36e5)%24,m=Math.floor(ms/6e4)%60,z=n=>String(n).padStart(2,'0');
    const[J,H,M]=typeof EN!=='undefined'&&EN?['d','h','m']:['J','H','M'];
    el.innerHTML=SAPIN+`<span><b>${j}</b> ${J} <b>${z(h)}</b> ${H} <b>${z(m)}</b> ${M}</span>`;
    el.setAttribute('aria-label',tr_(`Noël dans ${j} jours, ${h} heures et ${m} minutes`,`Christmas in ${j} days, ${h} hours and ${m} minutes`));
  };
  maj();setInterval(maj,20000);
}

const BONNET=`<svg class="bonnet" viewBox="0 0 34 28" aria-hidden="true"><path d="M25.5 20C25 10 20 3.5 13.5 4 9 4.5 5.5 7.5 4 11.5c3-1.5 6-1.5 8.5 0C9.5 14 7.5 17 6.5 20z" fill="#d93a3a"/><path d="M12.5 11.5c3 1.2 6 4.5 7 8.5" stroke="#8f1f1f" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6"/><rect x="3.5" y="18.5" width="24.5" height="7" rx="3.5" fill="#f4f3f8" stroke="#c9c6d6" stroke-width=".8"/><circle cx="4.2" cy="11.5" r="3.3" fill="#f4f3f8" stroke="#c9c6d6" stroke-width=".8"/></svg>`;

function lancer(){
  document.body.classList.add('noel');
  // Bonnet sur le « s » final du logo (le <i> jaune), pointe retombant vers la droite
  document.querySelectorAll('.logo i,.desk-logo i').forEach(s=>s.insertAdjacentHTML('beforeend',BONNET));

  const couche=document.createElement('div');
  couche.id='neige';couche.style.cssText='position:fixed;inset:0;z-index:5;overflow:hidden;pointer-events:none';couche.setAttribute('aria-hidden','true');
  const N=window.innerWidth>=600?26:16;
  for(let i=0;i<N;i++){
    const it=document.createElement('div');
    it.className='neige-item';
    const dur=rand(18,30);
    it.style.cssText=`position:absolute;top:-40px;left:${f((i+Math.random())/N*100)}%;--dur:${f(dur)}s;--delay:${f(-rand(0,dur))}s;--rest:${f(rand(5,95))}vh`;
    const sw=document.createElement('div');
    sw.className='neige-sway';
    sw.style.cssText=`--sway:${f(rand(10,30)*(Math.random()<.5?-1:1))}px;--sway-dur:${f(rand(2.8,5))}s`;
    const taille=rand(14,28);
    sw.innerHTML=svg(tirer(),taille,metal());
    // Nouveau dessin à chaque chute, invisible puisqu'il repart d'au-dessus de l'écran
    it.addEventListener('animationiteration',e=>{if(e.target===it)sw.innerHTML=svg(tirer(),taille,metal());});
    it.appendChild(sw);couche.appendChild(it);
  }
  document.body.insertBefore(couche,document.body.firstChild);
  gerbes();
}

// ── Gerbes au toucher ──────────────────────────────────
// Taper une zone libre fait jaillir des décorations sous le doigt ; tant que le doigt reste
// appuyé, il en repart une toutes les 90 ms. Mouvement calculé image par image : élan freiné
// par l'air, gravité faible, balancement, d'où une montée puis une chute de flocon.
// Zones : accueil au-dessus des onglets de mode, bandeau du haut en partie, marges sur ordinateur.
// Jamais sur un bouton, un lien, un champ, une case ou un dé.
const MAX=70,TOUS_LES=90,GRAVITE=220,FREIN=2.4;
function zoneLibre(cible,y){
  if(cible.closest('button,a,input,select,textarea,label,[onclick],[role="button"],.mov,#mmenu'))return false;
  if(cible===document.body||cible===document.documentElement)return true;
  const ecran=cible.closest('.screen');
  if(!ecran)return false;
  if(ecran.id==='ss'){const tabs=ecran.querySelector('.mode-tabs');return!tabs||y<tabs.getBoundingClientRect().top;}
  if(ecran.id==='sg')return!!cible.closest('.hdr,.desk-logo');
  return false;
}
function gerbes(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const couche=document.createElement('div');
  couche.setAttribute('aria-hidden','true');
  couche.style.cssText='position:fixed;inset:0;z-index:45;overflow:hidden;pointer-events:none';
  document.body.appendChild(couche);
  const corps=[];
  let frame=0,last=0,appui=null;

  const lancer=(x,y,n,ecart)=>{
    for(let i=0;i<n;i++){
      const a=-Math.PI/2+rand(-ecart,ecart),v=rand(230,380);
      const node=document.createElement('div');
      node.style.cssText='position:absolute;left:0;top:0;opacity:0;will-change:transform,opacity';
      node.innerHTML=svg(tirer(),rand(18,28),metal());
      couche.appendChild(node);
      corps.push({node,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,rot:rand(0,360),spin:rand(-90,90),
        amp:rand(8,18),freq:rand(1.6,2.8),phase:rand(0,Math.PI*2),age:0,vie:rand(4.5,6.5)});
    }
    // Au-delà du plafond, les plus anciennes disparaissent
    while(corps.length>MAX)corps.shift().node.remove();
    if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}
  };
  const tick=now=>{
    const dt=Math.min(.05,(now-last)/1000);last=now;
    for(let i=corps.length-1;i>=0;i--){
      const b=corps[i];
      b.age+=dt;
      b.vx-=b.vx*FREIN*dt;
      b.vy+=(GRAVITE-b.vy*FREIN)*dt;
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      b.spin-=b.spin*.6*dt;b.rot+=b.spin*dt;
      const sway=Math.sin(b.age*b.freq+b.phase)*b.amp*Math.min(1,b.age);
      const apparu=Math.min(1,b.age/.18),fondu=Math.min(1,(b.vie-b.age)/1.2);
      b.node.style.transform=`translate(${b.x+sway}px,${b.y}px) translate(-50%,-50%) rotate(${b.rot+sway*2}deg) scale(${.4+.6*apparu})`;
      b.node.style.opacity=Math.max(0,fondu);
      if(b.age>=b.vie||b.y>innerHeight+60){b.node.remove();corps.splice(i,1);}
    }
    frame=corps.length?requestAnimationFrame(tick):0;
  };
  const stop=e=>{
    if(!appui||(e&&e.pointerId!==appui.id))return;
    clearInterval(appui.timer);appui=null;
  };
  addEventListener('pointerdown',e=>{
    if(e.button>0||!zoneLibre(e.target,e.clientY))return;
    stop();
    lancer(e.clientX,e.clientY,6,1.2);
    appui={id:e.pointerId,x:e.clientX,y:e.clientY,timer:setInterval(()=>{if(appui)lancer(appui.x,appui.y,1,.9);},TOUS_LES)};
  });
  addEventListener('pointermove',e=>{if(appui&&e.pointerId===appui.id){appui.x=e.clientX;appui.y=e.clientY;}});
  addEventListener('pointerup',stop);
  addEventListener('pointercancel',stop);
}

if(estNoel()){lancer();compteNoel();}
// Planche de tous les dessins, pour la recette : NOEL_PLANCHE() dans la console.
window.NOEL_PLANCHE=()=>({pictos:PICTOS.map(p=>svg(p,40,'or')),flocons:FLOCONS.map(p=>svg(p,40,'argent'))});
})();
