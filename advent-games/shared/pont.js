// Pont entre un mini-jeu et le calendrier de l'avent de Mon Yams.
// Le jeu est affiché dans une iframe de la page du calendrier (même origine) : il
// signale chaque début de partie et le score final, la page enregistre le meilleur
// score et l'envoie au classement de la case. Ouvert seul, le jeu fonctionne sans.
(function(){
  const dansCalendrier=window.parent!==window;
  const envoyer=m=>{if(dansCalendrier)try{window.parent.postMessage(m,location.origin);}catch(e){}};
  window.AventPont={
    dansCalendrier,
    debut(){envoyer({type:'avent-debut'});},
    // rang : critère de tri prioritaire (Fusion : niveau du meilleur dé)
    fin(score,rang){envoyer({type:'avent-score',score:Math.round(score)||0,rang:rang??null});},
  };
  if(dansCalendrier){
    document.documentElement.classList.add('dans-calendrier');
    // Place pour le bouton de retour au calendrier, posé en haut à gauche par la page
    const st=document.createElement('style');
    st.textContent='html.dans-calendrier h1{margin-left:46px}';
    document.head.appendChild(st);
  }
})();
