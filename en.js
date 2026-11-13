// Mon Yams : textes anglais. Chargé avant app.js, qui ne s'en sert que sur /en.
// Le français reste la source : il vit dans index.html et dans app.js. Ici, uniquement
// les traductions des textes statiques (EN_TXT, EN_ATTR) et des tableaux de données.
// Les chaînes construites à la volée sont traduites sur place dans app.js par tr(fr, en).
//
// Glossaire, à respecter partout :
//   colonnes  Normale = Free, Descendante = Down, Montante = Up, Sèche = One-shot,
//             Annoncée = Called, Milieu = Middle, Double = Double
//   figures   Paire = pair, Brelan = three of a kind, Full = full house, Suite = straight,
//             Carré = four of a kind, Yams = Yams (jamais "Yahtzee", marque déposée)
//   verbes    lancer = roll, garder = keep, barrer = scratch, annoncer = call
//   modes     Parcours = Journey, Défi du Jour = Daily Challenge (onglet : Daily)

// Balises <title> et meta, posées par appliquerLangue()
const EN_META={
  title:'Play Yams online for free: 1, 3 or 5 columns | Mon Yams',
  description:'Free online Yams, the French dice game played with five dice and up to five scoring columns. No sign-up. Solo, guided Journey and a Daily Challenge with the same dice for everyone.',
  ogDescription:'Free online Yams dice game. Classic (1 column), Advanced (3) or Expert (5 columns). Guided Journey and Daily Challenge.',
};

// Éléments marqués data-t="clé" dans index.html (contenu HTML)
const EN_TXT={
  st_players:'players',
  st_today:'games today',
  tab_parcours:'Journey',
  tab_solo:'Solo',
  tab_daily:'Daily',
  daily_tag:'Feeling lucky today?',
  daily_sub:"Play today's dice! One game a day, same dice for everyone: only your choices make the difference.",
  streak:'day streak',
  parcours_tag:'Not ready for 5 columns yet?',
  parcours_sub:'The Journey teaches you classic Yams, then its variants, one step at a time, all the way to the 5-column game (Expert mode).',
  go:'Play!',
  kofi:'Support on Ko-fi',
  back:'← Back',
  parcours_title:'Journey',
  tr_hint:'Your turn!',
  tr_skip:'Tap to skip',
  total:'Total: ',
  fb_new:'New sheet',
  fb_end:'Finish',
  m_play:'Play',
  m_boards:'Leaderboards',
  m_badges:'My badges',
  m_sheet:'Score sheet',
  m_rules:'Rules',
  m_feedback:'Feedback? Message me',
  ms_title:'Post to the leaderboard',
  ms_name:'Your name:',
  cancel:'Cancel',
  post:'Post',
  mgs_title:'Online score sheet',
  mgs_sub:'You roll real dice, the app keeps score.',
  how_many:'How many columns?',
  with_pb:'I play with pair and three of a kind',
  start:'Start',
  close:'Close',
  ok:'OK',
  scratch:'Scratch',
  quit_q:'Quit?',
  quit_sub:'Your scores will be lost.',
  stay:'Stay',
  quit:'Quit',
  mpb_seche:'⚠️ One-shot column: to score there, you must roll <strong>all five dice</strong> every time (keep nothing).',
  lets_go:"Let's go!",
  done:'Done<span>!</span>',
  daily_kicker:'Daily Challenge',
  on_board:'on the leaderboard',
  streak_l:'day streak',
  post_score:'Post my score',
  share:'Share',
  board:'Leaderboard',
  this_week:'this week',
  your_best:'your best',
  replay:'Play again',
  next_level:'Next level',
  retry:'Try again',
  back_journey:'Back to the Journey',
  boards_title:'Leaderboards',
  my_records:'My records',
  clear_records:'Clear records',
  badges_title:'My badges',
  howto:'How to play Yams',
  howto_1:'You roll 5 dice. Keep the ones you like and reroll the rest, up to 3 rolls. Then place your result in one box of the grid.',
  howto_2:'Each box can be filled only once, and you have to fill them all. That is the whole game: picking the right box at the right time.',
  howto_3:'Go for the big combos (full house, straight, four of a kind, Yams), and roll at least three of each number from 2 to 6 in a column to earn the <strong>+30 bonus</strong>.',
  howto_more:'Read the full rules →',
  howto_nope:"Don't show this at startup",
  rules_title:'Rules',
  badge_unlocked:'Badge unlocked!',
  seo:`<h1>Play Yams online: Mon Yams</h1>
  <p>Mon Yams is a free Yams game you can play online with no sign-up. Pick your mode: Classic (1 column), Advanced (3 columns) or Expert (5 columns). The Journey walks you step by step from the basic rules to the full 5-column game.</p>
  <p>The Daily Challenge gives every player the same sequence of dice each day, so you can compare scores. Works on phone, tablet and desktop, nothing to download.</p>
  <p>Yams is the French dice game in which you roll 5 dice up to 3 times per turn to build the best combinations: straight, full house, four of a kind, Yams. Mon Yams adds extra columns (Down, Up, One-shot, Called) for much deeper strategy.</p>`,
};

// Éléments marqués data-ta="clé" : attributs à remplacer
const EN_ATTR={
  name_ph:{placeholder:'Your name'},
  undo:{'aria-label':'Undo last move'},
  coach:{'aria-label':'Coach tip'},
  rules_btn:{'aria-label':'Rules'},
  quit_btn:{'aria-label':'Quit game'},
  menu_x:{'aria-label':'Close menu'},
  menu_nav:{'aria-label':'Main menu'},
  howto_dlg:{'aria-label':'How to play Yams'},
  close_x:{'aria-label':'Close'},
};

// Écran des règles complètes (remplace le contenu de .sr-body)
const EN_RULES=`
    <h2>The basics</h2>
    <p>Yams is simple: you roll 5 dice, reroll the ones you want, and try to build the best combinations, all within 3 rolls per turn. Every turn you must fill one box, even when the result is bad. That is where your choices start to matter.</p>
    <p>The score grid (numbers, bonus and combos below) is the same in every mode: Classic (1 column), Advanced (3 columns), Expert (5 columns) and the Journey. What sets the modes apart is which columns are in play (described further down). The Journey introduces them one at a time.</p>

    <h2>The score grid</h2>
    <h3>Numbers</h3>
    <p>You score only the sum of the dice showing the number you picked. Roll three 4s and you write 12 in the Fours box. The goal is to reach 60 points in this section to earn the <strong>+30 bonus</strong>. It is an overall total, so four 6s instead of three puts you ahead and can make up for a number where you only had two dice. Good players regularly collect all 5 bonuses.</p>
    <h3>Combos</h3>
    <ul class="rules-list">
      <li><strong>Pair</strong>: 2 matching dice → 2× the highest value + 10</li>
      <li><strong>Three of a kind</strong>: 3 matching dice → 3× the highest value + 20</li>
      <li><strong>Full house</strong>: three matching dice plus a pair (or 5 of a kind) → sum of the dice + 20</li>
      <li><strong>Straight</strong>: 5 values in a row → sum of the dice + 30</li>
      <li><strong>Small straight</strong> (some Daily Challenges): 4 values in a row → 30 points. The Straight then becomes the <strong>large straight</strong>.</li>
      <li><strong>Four of a kind</strong>: 4 matching dice → 4× the value + 40</li>
      <li><strong>Yams</strong>: 5 matching dice → sum of the dice + 50</li>
    </ul>
    <h3>The + and − boxes</h3>
    <p>The <strong>+</strong> box takes the sum of all your dice when it is high. The <strong>−</strong> box takes the sum when it is low. <strong>Diff</strong> = (+) minus (−). It can go negative if you are not careful. These two boxes are often your fallback when nothing else works.</p>

    <h2>The 5 columns: the heart of the game</h2>
    <h3>F: Free</h3>
    <p>The easy one. Fill the boxes in any order, at any time. It is your safety column: keep it in reserve as long as you can.</p>
    <h3>↓: Down</h3>
    <p>You must fill the boxes from top to bottom, without skipping. You cannot write your full house before every number box above it is filled. The fixed order forces you to plan ahead.</p>
    <h3>↑: Up</h3>
    <p>Same idea in reverse, from bottom to top. You start with the Yams and work your way up to the numbers. Will you dare scratch the Yams to get going?</p>
    <h3>O: One-shot</h3>
    <p>The most demanding column. To score a combo here, you must get it from a roll of all 5 dice at once (on your 1st, 2nd or 3rd roll, it does not matter), without keeping any die from a previous roll. A one-shot full house, straight, four of a kind or Yams: rare and delicious.</p>
    <h3>C: Called</h3>
    <p>After your first roll, you can call the box you are going for. You commit and cannot change your mind. Make it and you score as usual. Miss it and you write 0. A call is a bet on your own ability to get what you are after.</p>

    <h3>↕: Middle (some Daily Challenges)</h3>
    <p>You start with the + box or the − box, in the middle of the grid. After that, every box you fill must touch the ones already filled, right above or right below. You work your way outward in both directions, at your own pace.</p>
    <h3>×2: Double (some Daily Challenges)</h3>
    <p>Fill it in any order. If you place after 1 or 2 rolls, your points count double. On the 3rd roll, they count once. The bonus follows the same logic: you need 120 points on the numbers, and it pays +60. The whole question: stop early to double, or roll again for a better combo.</p>

    <h2>3 habits of good players</h2>
    <p><strong>1. Down and Up come first.</strong> These two columns are restrictive: you cannot choose when to fill them. As soon as your dice let you move forward in one of them, it is almost always the right call, even if you could score more elsewhere.</p>
    <p><strong>2. Always have a plan B.</strong> Before chasing a hard combo, work out where your score goes if you miss. A failed four of a kind can go in the + box. Scratching a Yams is sometimes the only way out. Just never leave yourself with no way out!</p>
    <p><strong>3. The number bonus is worth 30 points.</strong> Three of each number (ones aside) is enough: 3×2=6, 3×3=9, 3×4=12, 3×5=15, 3×6=18, exactly 60 points in total. If you are ahead on one number, you can afford to be less precise on another. Always keep an eye on that bonus: it decides games.</p>

    <h2>Scoring</h2>
    <p>A well-played 5-column game lands around 1000 to 1100 points. Experienced players regularly pass 1150. The all-time record on Mon Yams is above 1400 points: a feat that takes sound strategy, steady nerves and a bit of luck.</p>

    <h2>The Daily Challenge</h2>
    <p>Every day, all players get exactly the same dice. Same sequence for everyone, same opportunities. Will you be the one who makes the best choices?</p>

    <h2>Undo</h2>
    <p>After placing a score, and as long as you have not rolled again, you can undo it (back arrow, top right). Handy after a misclick :) Except in the Daily Challenge, where the next turn's dice are already drawn.</p>
`;

// Badges : [nom, description] par identifiant
const EN_BADGES={
  premiere:['First game','Play your first game'],
  r10:['Regular','10 games played'],
  r20:['Familiar face','20 games played'],
  r30:['Devoted','30 games played'],
  r40:['Veteran','40 games played'],
  r50:['Expert','50 games played'],
  r60:['Master','60 games played'],
  yams_master:['Yams Master','Score over 1250 pts in one game'],
  pojuste:['So Unfair','Finish a game under 800 pts'],
  bol:['Mr. Lucky','3 Yams in one game'],
  boumbacar:['Boumbacar','A Yams with five 6s'],
  yams_seche:['Culman','Roll a one-shot Yams'],
  brasgueille:['Butterfingers','Finish without a single +30 bonus'],
  propre:['Mr. Clean','No combo scratched (Yams aside)'],
  bonus30:['The Bonus','Earn a +30 bonus in a column'],
  col_parfaite:['Perfect Column','+30 AND no combo scratched in a column'],
  suite_ideas:['Straight Thinking','A straight in every column (3 columns minimum)'],
  madame:['Little Miss Perfect','+30 bonus in every column (3 columns minimum)'],
  seum_master:['Salty Master','Place a Yams outside the Yams row'],
  beat_culman:['Culman Crusher','Beat Culman'],
};

// Culman, seul adversaire en service (boss du Parcours). Les cinq autres bots ne sont
// branchés nulle part : à traduire le jour où l'action A2 de la feuille de route les rebranche.
const EN_BOTS={
  culman:{
    desc:'Luckiest guy alive',quip:'Unpredictable, always lucky',
    dice:['Oh! 🍀','Well, look at that!','A free gift! 🍜',"Can't complain!"],
    ahead:['Again?! Even I am surprised. 🍀','I have no idea how this is possible. 🤷','Noodles bring good luck. 🍜'],
    behind:['My noodles are charging. 🍜','I often lose early on. Then it takes off.','Normal. I am calibrating. 🍀'],
    equal:['Close game? Wait for the end. 🍜',"Yeah, that's normal, I'm taking it slow. 🍀"],
    trans:['Honestly, I have no idea what I just did, but it works. 🍀','The dice love me. Nothing to be done.','🍜 Another lucky break?'],
  },
};

// Paliers du Parcours, dans l'ordre
const EN_TIERS=['1 column','2 columns','3 columns','4 columns'];

// Niveaux du Parcours (qui servent aussi de variantes au Défi) : [nom, description, conseil]
const EN_LEVELS={
  t1l1:['First steps','1 Free column: place your combos as you like.',
    'One single column, completely free: you place each combo where you want, in the order you want. Go for the combos that pay big (straight, full house, four of a kind, Yams) and try to reach 60 pts on the numbers 1 to 6 to earn the +30 bonus.'],
  t1l2:['One shot','1 One-shot column: a single roll, all or nothing.',
    'No keeping strategy here: one roll decides everything. Always place the most valuable combo that roll gives you instead of waiting for a specific one. You will not get a second chance.'],
  t1l3:['Bold call','1 Called column: call your target and own it.',
    'After your first roll, you must call the box you are going for this turn. Otherwise you will not be able to place anything. Pick a combo your dice already make, or one you have a good chance of getting with 2 rolls left.'],
  t1l3b:['Pair & three of a kind','1 Free column: meet the pair and three of a kind boxes.',
    'Two new combos join the grid: the Pair (the highest value showing at least twice, ×2 + 10) and Three of a kind (the highest value showing at least three times, ×3 + 20). They count in every column, this one included. Spot them from your first roll: they often pay better than you would think.'],
  t1l4:['Beat the machine','Beat Culman in 1 Free column.',
    'The final fight of tier 1! Same rules as level 1: one free column. Make the most of every turn without waiting for the perfect combo. Culman does not waste time.'],
  t2l1:['Going down','2 columns: Free + Down.',
    'New rule: the Down column (↓) is a restricted column. You must fill its boxes in order, from top to bottom (1, 2, 3, 4, 5, 6, then +, −, full house, straight, four of a kind, Yams). When your dice match the current box, put it first: otherwise you will sometimes have to sacrifice a box (fill it with 0) to move on.'],
  t2l2:['Going up','2 columns: Free + Up.',
    'The Up column (↑) is the reverse of Down: you start with the hardest combos (Yams, four of a kind, straight, full house, then −, +) and finish with the numbers. Same logic: put this column first when your dice match the current box, and accept a sacrifice if needed so you do not get stuck.'],
  t2l3:['Tightrope','2 columns: Down + Up.',
    'No free column anymore: everything has to go in Down or Up. Each turn, see which of the two needs what your dice offer the most, and do not hesitate to sacrifice a lagging box to unlock the rest of the column.'],
  t2l3b:['Winning combo','2 columns: Down + Up, with pair and three of a kind.',
    'Pair and three of a kind work well with Down and Up: if your dice do not match the current box yet, a good pair or three of a kind can wait in the other column without costing you a turn.'],
  t2l4:['Beat the machine','Beat Culman in 2 columns (Free + Down).',
    'Culman is back, with the Down column added. Move steadily in order (1 → Yams) without waiting for the perfect roll: one wasted turn can be enough to let Culman take the lead.'],
  t3l1:['Three columns','3 columns: Free, Down, Up.',
    'You get a free column back, on top of the two restricted ones. Use the Free column as your buffer: it can absorb your best rolls as well as the ones that fit neither Down nor Up.'],
  t3l2:['Tight and tense','3 columns: Down, Up, One-shot.',
    'The One-shot column is back (a single roll, all dice rolled every time). Save it for a roll where luck hands you a good combo straight away, without disturbing your progress in Down and Up.'],
  t3l3:['The big call','3 columns: Free, Up, Called.',
    'The Called column is back, but this time you have other columns to fall back on if the call fails. Call an ambitious combo when your dice would already score well elsewhere: a chance to grab extra points without risking everything.'],
  t3l3b:['Triple threat','3 columns: Free, Down, Up, with pair and three of a kind.',
    'Three columns to manage, and now 16 boxes per column thanks to pair and three of a kind. Use them as fallback scores in the free column when neither Down nor Up needs your dice.'],
  t3l4:['Beat the machine','Beat Culman in 3 columns.',
    'The tier 3 boss, with three columns to manage. Keep an eye on your two restricted columns: do not let Culman pull ahead while you chase the perfect roll in the free column.'],
  t4l1:['Four columns','4 columns: Free, Down, Up, One-shot.',
    'Four open columns: you almost always have a move. Never waste a roll, there is nearly always a box (Free, Down, Up or One-shot) that can use it.'],
  t4l2:['The final call','4 columns: Free, Down, Up, Called.',
    'The Called column returns alongside the two restricted columns. A well-placed call can pay big: aim for a combo you have a good chance of making with 2 rolls left.'],
  t4l3:['No safety net','4 columns without Free: Down, Up, One-shot, Called.',
    'No free column this time: every box matters twice as much. Plan your sacrifices in Down and Up, and use One-shot and Called to catch the rolls that fit neither.'],
  t4l3b:['No mercy','4 columns without Free, with pair and three of a kind.',
    'With no free column, every box matters twice as much. Pair and three of a kind become precious fallback scores so you never have to sacrifice an important box in Down, Up, One-shot or Called.'],
  t4l4:['Beat the machine: Finale','The final fight before Expert mode (5 columns)!',
    'Everything you have learned comes together: manage your free column, move in order through Down and Up, and make the most of every one-shot roll. Beat Culman and you will be ready for the 5-column adventure!'],
};

// Variantes Solo : [nom, libellé court, description] par nombre de colonnes
const EN_SOLO={
  1:['Classic','1 column','Classic Yams: one free column, in any order you like.'],
  3:['Advanced','3 columns','3 columns: Free, Down and Up. The last two must be filled in order.'],
  5:['Expert','5 columns','All 5 columns: Free, Down, Up, One-shot and Called. The full game of Yams.'],
};

// Variante "Yams expert" du Défi, puis les variantes inédites : [nom, description]
const EN_DAILY={
  expert:['Expert Yams','All 5 columns: Free, Down, Up, One-shot and Called.'],
  n1:['Double or nothing','4 columns: Free, Down, Up and Double.'],
  n2:['Dead center','2 columns: Free and Middle.'],
  n3:['Small and large','3 columns: Free, Down and Up, with small and large straights.'],
  n4:['Double shot','3 columns: Free, One-shot and Double.'],
  n5:['Every which way','3 columns: Down, Up and Middle.'],
  n6:['Doubled straights','2 columns: Free and Double, with small and large straights.'],
  n7:['The happy medium','3 columns: Free, Middle and Called, with small and large straights.'],
  n8:['The full works','5 columns: Down, Up, Middle, Called and Double.'],
};
