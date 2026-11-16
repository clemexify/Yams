'use strict';
// Le Mont Yams : description des mondes, des niveaux et des boss (source unique).
// mont-gen.js complète chaque niveau (positions, seuils d'étoiles) et écrit ../mont-niveaux.js.
//
// Formats :
//   fin    : fin de partie, la grille est déjà remplie sauf k tours (position produite par le bot)
//   mini   : une partie de la grille seulement (colonnes `cols`, lignes jouées `rows`)
//   grille : grille complète
// `cfg` : configuration entraînée dont le bot sert à simuler le niveau (vparams/<cfg>.json).
// Pour un mini, les cases hors du niveau sont posées à 0 avant de simuler.

const UP = ['1', '2', '3', '4', '5', '6'];
const FIG4 = ['full', 'suite', 'carre', 'yams'];
const EXPERT = 'normal+desc+asc+seche+annonce~base';

const L = (f, cfg, extra, fr, en) => ({ f, cfg, ...extra, name: [fr, en] });
const fin = (cfg, k, fr, en) => L('fin', cfg, { k }, fr, en);
const mini = (cfg, cols, rows, fr, en) => L('mini', cfg, { cols, rows }, fr, en);
const grille = (cfg, fr, en) => L('grille', cfg, {}, fr, en);

const WORLDS = [
  { id: 'village', name: ['Le Village', 'The Village'], sub: ['La colonne Normale', 'The Free column'],
    learn: ['Normale, + et −, les figures', 'Free column, + and −, the combos'], color: '#27c47e',
    levels: [
      // Premier niveau : dés préparés (une réserve fixe de 15 dés par tour, lancers 1 à 3).
      // Premiers lancers ordinaires (paire de 5, paire de 3, paire de 4). Un seul carré possible
      // dans tout le niveau : celui de 4, au 3e tour, après deux relances. Les tours 1 et 2 ne
      // dépassent pas le brelan. Cases ouvertes : 3, 5 et Carré, haut de grille à 38.
      // Jeu parfait : brelan de 5, brelan de 3 (le bonus tombe), carré de 4 = 110. Rater le carré
      // donne 54, rater un brelan 77 (bonus manqué), poser au premier lancer 16.
      // Seuils fixés à la main, voir mont-gen.js (merge).
      { ...fin('normal~base', 3, 'Premier lancer', 'First roll'), stars: [50, 75, 110],
        des: [[5, 2, 5, 6, 1, 3, 5, 1, 4, 3, 1, 4, 6, 2, 6], [3, 6, 1, 3, 4, 4, 3, 5, 6, 2, 2, 5, 6, 1, 1], [4, 2, 4, 6, 1, 6, 4, 1, 5, 3, 2, 3, 5, 4, 2]] },
      mini('normal~base', ['normal'], UP, 'La ligne du haut', 'The top row'),
      mini('normal~base', ['normal'], FIG4, 'Les grosses figures', 'The big combos'),
      fin('normal~base', 5, 'Fin de soirée', 'Last orders'),
      grille('normal~base', 'La grille entière', 'The full grid'),
      mini('normal~base', ['normal'], [...UP, 'plus', 'minus'], 'Plus ou moins', 'More or less'),
      fin('normal~base', 6, 'Le coup de feu', 'Rush hour'),
      grille('normal~base', 'Le grand classique', 'The great classic'),
    ],
    boss: { id: 'gege', cfg: 'normal~base', noise: 50, name: ['Gégé', 'Gégé'], role: ['Le patron du bistrot', 'The bistro owner'],
      skin: 'bois', skinName: ['Bois', 'Wood'],
      intro: ["Un petit Yams avant l'apéro ?", 'Quick game of Yams before drinks?'],
      ahead: [['La maison mène, gamin.', 'House is ahead, kid.'], ["On n'apprend pas à un vieux singe.", "You can't teach an old dog new tricks."]],
      behind: [["Tu as de la chance, c'est tout.", "That's just luck."], ['Je remets une tournée et je reviens.', 'Let me pour another round.']],
      yams: ['Et un Yams pour la 3 !', 'One Yams for table 3!'],
      win: ["Reviens quand tu veux, l'ardoise est ouverte.", 'Come back anytime, your tab is open.'],
      lose: ['Bon. Je remets ma tournée.', 'Fine. Drinks are on me.'] } },

  { id: 'pistes', name: ['Les Pistes', 'The Slopes'], sub: ['Descendante et Montante', 'Down and Up'],
    learn: ['Descendante ↓ et Montante ↑', 'Down ↓ and Up ↑'], color: '#4d9bf0',
    levels: [
      fin('normal+desc~base', 3, 'Tout schuss', 'Straight down'),
      fin('normal+asc~base', 4, 'Remontée mécanique', 'Ski lift'),
      grille('normal+desc~base', 'La bonne piste', 'The right run'),
      fin('desc+asc~base', 5, 'Slalom', 'Slalom'),
      grille('normal+asc~base', 'Le télésiège', 'The chairlift'),
      fin('normal+desc~base', 6, 'Hors-piste', 'Off-piste'),
      fin('desc+asc~base', 4, 'Tire-fesses', 'Drag lift'),
      grille('desc+asc~base', 'Funambule', 'Tightrope'),
    ],
    boss: { id: 'moniteur', cfg: 'normal+desc~base', noise: 50, name: ['Le Moniteur', 'The Instructor'], role: ['Champion de la Descendante', 'Downhill champion'],
      skin: 'glacier', skinName: ['Glacier', 'Glacier'],
      intro: ["Dans l'ordre. Toujours dans l'ordre.", 'In order. Always in order.'],
      ahead: [['Fléchis les genoux, ça ira mieux.', 'Bend your knees, it helps.'], ['Tu dérapes un peu, là.', "You're skidding a bit."]],
      behind: [['Belle trace.', 'Nice line.'], ["Hmm. La neige est lourde aujourd'hui.", 'Hmm. Heavy snow today.']],
      yams: ['Schuss !', 'Straight down!'],
      win: ['Reviens demain, on reprend les bases.', "Come back tomorrow, we'll work on the basics."],
      lose: ['Belle descente. Ta médaille est méritée.', 'Great run. You earned your medal.'] } },

  { id: 'mine', name: ['La Mine', 'The Mine'], sub: ['Paire, Brelan, petite suite', 'Pair, three of a kind, small straight'],
    learn: ['Paire, Brelan, petite suite, 3 colonnes', 'Pair, three of a kind, small straight, 3 columns'], color: '#ff8a4c',
    levels: [
      mini('normal~pb', ['normal'], ['paire', 'brelan', 'full', 'carre'], 'Premier filon', 'First seam'),
      grille('normal~pb', 'Paire et Brelan', 'Pair and three of a kind'),
      mini('normal+desc+asc~suites', ['normal'], ['psuite', 'suite', 'full', 'carre', 'yams'], 'Petite suite', 'Small straight'),
      fin('normal+desc+asc~base', 4, 'La galerie', 'The tunnel'),
      grille('normal+desc+asc~base', 'Trois colonnes', 'Three columns'),
      fin('normal+desc+asc~pb', 5, 'Le wagonnet', 'The mine cart'),
      grille('normal+desc+asc~suites', 'Petite et grande', 'Small and large'),
      grille('normal+desc+asc~pb', 'Le grand filon', 'The mother lode'),
    ],
    boss: { id: 'contre', cfg: 'normal+desc+asc~pb', noise: 40, name: ['La Contremaîtresse', 'The Forewoman'], role: ['Rien ne se perd à la mine', 'Nothing goes to waste down here'],
      skin: 'acier', skinName: ['Acier', 'Steel'],
      intro: ['Ici on ne gâche rien. Pas même une paire.', 'We waste nothing here. Not even a pair.'],
      ahead: [["Le rendement, ça s'apprend.", 'Productivity can be learned.'], ['Plus vite, la galerie ferme à six heures.', 'Faster, the shaft closes at six.']],
      behind: [['Du travail propre. Je note.', "Clean work. I'm taking notes."], ['Pas mal, pour une recrue.', 'Not bad for a rookie.']],
      yams: ['Filon !', 'Jackpot!'],
      win: ['Demain, 6 heures. Casque obligatoire.', 'Tomorrow, 6 a.m. Helmet required.'],
      lose: ['Tu montes en grade.', "You've earned a promotion."] } },

  { id: 'hotel', name: ['Le Grand Hôtel', 'The Grand Hotel'], sub: ['La colonne Annoncée', 'The Called column'],
    learn: ['Annoncée', 'Called column'], color: '#9b78f0',
    levels: [
      fin('normal+asc+annonce~base', 3, 'Faites vos jeux', 'Place your bets'),
      grille('annonce~base', 'Pari osé', 'Bold bet'),
      fin('normal+asc+annonce~base', 4, 'Le salon', 'The lounge'),
      grille('normal+asc+annonce~base', 'Le grand pari', 'The big bet'),
      fin('normal+desc+asc+annonce~base', 5, 'Service en chambre', 'Room service'),
      fin('normal+asc+annonce~base', 6, "Le bar de l'hôtel", 'The hotel bar'),
      grille('normal+desc+asc+annonce~base', "L'annonce finale", 'The final call'),
      fin('normal+desc+asc+annonce~base', 6, 'Dernière annonce', 'Last call'),
    ],
    boss: { id: 'croupier', cfg: 'normal+desc+asc+annonce~base', noise: 35, name: ['Le Croupier', 'The Croupier'], role: ['Ne rate jamais une annonce', 'Never misses a call'],
      skin: 'rubis', skinName: ['Rubis', 'Ruby'],
      intro: ['Faites vos annonces. Rien ne va plus.', 'Place your calls. No more bets.'],
      ahead: [['La banque gagne toujours.', 'The house always wins.'], ['Une petite annonce pour vous refaire ?', 'Care to call your way back?']],
      behind: [['Joli coup.', 'Nicely played.'], ['La chance tourne. Elle tourne toujours.', 'Luck turns. It always does.']],
      yams: ['Yams annoncé, Yams payé.', 'Yams called, Yams paid.'],
      win: ["Merci d'avoir joué au Grand Hôtel.", 'Thank you for playing at the Grand Hotel.'],
      lose: ['La banque a sauté. Mes compliments.', 'You broke the bank. My compliments.'] } },

  { id: 'col', name: ['Le Col', 'The Pass'], sub: ['La colonne Sèche', 'The One-shot column'],
    learn: ['Sèche', 'One-shot column'], color: '#36cfc0',
    levels: [
      mini('seche~base', ['seche'], FIG4, 'Un seul lancer', 'One shot'),
      grille('seche~base', 'Coup sec', 'Dry shot'),
      fin('desc+asc+seche~base', 4, 'Rafale', 'Gust'),
      grille('desc+asc+seche~base', 'Sec et tendu', 'Dry and tense'),
      fin('normal+desc+asc+seche~base', 5, 'Le refuge', 'The hut'),
      fin('desc+asc+seche~base', 6, 'La crête', 'The ridge'),
      grille('normal+desc+asc+seche~base', 'Quatre colonnes', 'Four columns'),
      fin('normal+desc+asc+seche~base', 6, 'Le passage du col', 'Crossing the pass'),
    ],
    boss: { id: 'foehn', cfg: 'normal+desc+asc+seche~base', noise: 30, name: ['Le Foehn', 'The Foehn'], role: ['Le vent sec du col', 'The dry wind of the pass'],
      skin: 'ardoise', skinName: ['Ardoise', 'Slate'],
      intro: ['Un seul lancer. Pas de regrets.', 'One roll. No regrets.'],
      ahead: [['Le vent tourne toujours dans mon sens.', 'The wind always blows my way.'], ["Tu hésites. Le vent, lui, n'hésite jamais.", 'You hesitate. The wind never does.']],
      behind: [['Rafale contraire.', 'Headwind.'], ['Tu tiens bien sur la crête.', "You're holding the ridge well."]],
      yams: ['Coup sec !', 'One shot!'],
      win: ["Redescends te mettre à l'abri.", 'Head down and take shelter.'],
      lose: ['Le vent est tombé. Tu peux passer.', 'The wind has died down. You may pass.'] } },

  { id: 'seracs', name: ['Les Séracs', 'The Seracs'], sub: ['La colonne Milieu', 'The Middle column'],
    learn: ['Milieu ↕', 'Middle ↕'], color: '#7b83f5',
    levels: [
      fin('normal+milieu~base', 3, 'Premier pas sur la glace', 'First step on the ice'),
      grille('normal+milieu~base', 'Plein centre', 'Dead centre'),
      fin('normal+milieu~base', 5, 'La crevasse', 'The crevasse'),
      grille('desc+asc+milieu~base', 'Dans tous les sens', 'Every which way'),
      fin('desc+asc+milieu~base', 5, 'Pont de neige', 'Snow bridge'),
      grille('normal+milieu+annonce~suites', 'Le juste milieu', 'The happy medium'),
      fin('normal+milieu+annonce~suites', 6, 'Le labyrinthe', 'The maze'),
      fin('desc+asc+milieu~base', 7, 'Au cœur du glacier', 'Heart of the glacier'),
    ],
    boss: { id: 'yeti', cfg: 'desc+asc+milieu~base', noise: 25, name: ['Le Yéti', 'The Yeti'], role: ['Gardien du milieu', 'Keeper of the middle'],
      skin: 'cristal', skinName: ['Cristal', 'Crystal'],
      intro: ["On entre par le milieu. On n'en sort pas.", "You come in through the middle. You don't come out."],
      ahead: [['Grrr. On est bien, au milieu.', 'Grrr. Nice and cosy in the middle.'], ['Tu tournes en rond.', "You're going round in circles."]],
      behind: [['Grrr ?', 'Grrr?'], ["Personne n'est jamais sorti d'ici.", 'No one has ever got out of here.']],
      yams: ['GRRRAAAH !', 'GRRRAAAH!'],
      win: ['Reste un peu. Il fait bon au milieu.', "Stay a while. It's cosy in the middle."],
      lose: ['Tu as trouvé la sortie. Personne ne te croira.', 'You found the way out. No one will believe you.'] } },

  { id: 'lac', name: ['Le Lac Miroir', 'Mirror Lake'], sub: ['La colonne Double', 'The Double column'],
    learn: ['Double ×2', 'Double ×2'], color: '#f5c842',
    levels: [
      fin('normal+double~suites', 3, 'Reflet', 'Reflection'),
      grille('normal+double~suites', 'Suites doublées', 'Doubled straights'),
      fin('normal+seche+double~base', 4, 'Ricochet', 'Skimming stones'),
      grille('normal+seche+double~base', 'Coup double', 'Double strike'),
      fin('normal+desc+asc+double~base', 5, 'Eau calme', 'Still water'),
      fin('normal+double~suites', 6, 'Le ponton', 'The jetty'),
      grille('normal+desc+asc+double~base', 'Quitte ou double', 'Double or nothing'),
      fin('normal+desc+asc+double~base', 6, 'Le miroir brisé', 'The broken mirror'),
    ],
    boss: { id: 'jumeaux', cfg: 'normal+desc+asc+double~base', noise: 15, name: ['Les Jumeaux', 'The Twins'], role: ['Deux fois plus de points', 'Twice the points'],
      skin: 'miroir', skinName: ['Miroir', 'Mirror'],
      intro: ['Tout ce que tu fais, on le fait deux fois.', 'Whatever you do, we do twice.'],
      ahead: [['Deux fois plus, deux fois mieux.', 'Twice as much, twice as good.'], ["On t'attend. Deux fois.", "We're waiting. Twice."]],
      behind: [['Pas mal. Pas mal.', 'Not bad. Not bad.'], ["C'est sa faute. Non, la sienne.", 'His fault. No, his.']],
      yams: ['Yams ! Yams !', 'Yams! Yams!'],
      win: ['À la prochaine. À la prochaine.', 'See you. See you.'],
      lose: ["Deux fois battus. C'est beaucoup.", "Beaten twice over. That's a lot."] } },

  { id: 'sommet', name: ['Le Sommet', 'The Summit'], sub: ['Expert, 5 colonnes', 'Expert, 5 columns'],
    learn: ['Tout, en 5 colonnes', 'Everything, in 5 columns'], color: '#e9e4ff',
    levels: [
      fin(EXPERT, 4, 'Le dernier camp', 'Last camp'),
      grille('desc+asc+seche+annonce~base', 'Sans filet', 'No safety net'),
      fin('desc+asc+seche+annonce~pb', 5, 'La corde fixe', 'Fixed rope'),
      grille('desc+asc+seche+annonce~pb', 'Sans pitié', 'No mercy'),
      fin(EXPERT, 6, 'Haute altitude', 'High altitude'),
      grille('desc+asc+milieu+annonce+double~base', 'Le grand jeu', 'The big game'),
      fin(EXPERT, 8, 'Le ressaut', 'The last step'),
      grille(EXPERT, "L'arête sommitale", 'Summit ridge'),
    ],
    boss: { id: 'maitre', cfg: EXPERT, noise: 0, name: ['Le Grand Maître', 'The Grand Master'], role: ['Le bot complet, sans retenue', 'The full bot, holding nothing back'],
      skin: 'or', skinName: ['Or', 'Gold'],
      intro: ["J'ai joué des dizaines de milliers de parties contre moi-même.", 'I have played tens of thousands of games against myself.'],
      ahead: [['Chaque case a un prix. Tu viens de le payer.', 'Every box has a price. You just paid it.'], ['Intéressant. Faux, mais intéressant.', 'Interesting. Wrong, but interesting.']],
      behind: [['Tu calcules bien.', 'You calculate well.'], ["Je n'avais pas prévu ça.", 'I did not see that coming.']],
      yams: ['Probabilité 4,6 %. Obtenu.', 'Probability 4.6%. Achieved.'],
      win: ['Le sommet se mérite. Reviens.', 'The summit must be earned. Come back.'],
      lose: ["Enfin quelqu'un. Le sommet est à toi.", 'At last. The summit is yours.'] } },
];

module.exports = { WORLDS, UP, FIG4, EXPERT };
