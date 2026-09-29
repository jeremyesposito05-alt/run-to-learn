'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   BANQUES DE QUESTIONS — fichier à compléter par les enseignants.

   Une question par ligne, cinq parties séparées par des barres « | » :
       question | bonne réponse | erreur typique 1 | erreur typique 2 | explication (facultative)
   • Les réponses restent courtes : elles s'affichent sur un bouton.
   • Les deux erreurs doivent être PLAUSIBLES (celles que font vraiment les élèves).
   • L'explication s'affiche quand l'élève se trompe : une règle, une astuce, un moyen de retrouver la réponse.
   • Une ligne qui commence par # est un commentaire.
   Chaque banque est rattachée à un thème et à des années dans content.js (liste THEMES).
   ══════════════════════════════════════════════════════════════════════════ */
const BANQUES = {

/* ═══════════════ MATHÉMATIQUES ═══════════════ */
'm.geo': `
Combien de côtés a un triangle ? | 3 | 4 | 5 | tri- veut dire trois
Combien de faces a un cube ? | 6 | 4 | 8 | comme un dé : une face par nombre, de 1 à 6
Combien de côtés a un carré ? | 4 | 3 | 5 | quatre côtés égaux et quatre angles droits
Combien de côtés a un hexagone ? | 6 | 5 | 8 | hexa- veut dire six (comme les alvéoles des abeilles)
Combien de côtés a un pentagone ? | 5 | 4 | 6 | penta- veut dire cinq
Un angle droit mesure… | 90° | 45° | 180° | le coin d'une feuille : un quart de tour
Triangle aux trois côtés égaux ? | équilatéral | isocèle | rectangle | équi- : égal ; -latéral : côté
Solide sans aucune arête ? | la sphère | le cube | le cône | une balle n'a ni sommet ni arête
Faces d'une pyramide à base carrée ? | 5 | 4 | 6 | 1 base carrée + 4 faces triangulaires
Combien de sommets a un cube ? | 8 | 6 | 12 | 4 en haut et 4 en bas
Périmètre d'un carré de 5 cm de côté ? | 20 cm | 25 cm | 10 cm | 4 côtés × 5 cm (l'aire serait 25 cm²)
Aire d'un rectangle de 6 cm sur 4 cm ? | 24 cm² | 20 cm² | 10 cm² | longueur × largeur (20 cm serait le périmètre)
Somme des angles d'un triangle ? | 180° | 360° | 90° | toujours un demi-tour
`,

/* ═══════════════ FRANÇAIS ═══════════════ */
'f.homo1': `
Il ___ un chat. | a | à | as | « a » = verbe avoir : on peut dire « il avait un chat »
Je vais ___ l'école. | à | a | as | « à » ne se remplace pas par « avait »
Le ciel ___ bleu. | est | et | ai | « est » = verbe être : on peut dire « était »
Un chat ___ un chien. | et | est | ai | « et » relie deux mots : on peut dire « et puis »
Ils ___ faim. | ont | on | onts | « ont » = verbe avoir : on peut dire « avaient »
___ joue dans la cour. | On | Ont | Onts | « on » se remplace par « il »
Les fleurs ___ belles. | sont | son | sons | « sont » = verbe être : on peut dire « étaient »
Il range ___ vélo. | son | sont | sons | « son » se remplace par « mon »
Tu ___ un frère. | as | a | à | avec « tu », avoir s'écrit « as »
Il ___ parti hier. | est | et | ai | « est parti » : on peut dire « était parti »
Il pense ___ ses vacances. | à | a | as | « à » ne se remplace pas par « avait »
Ils ___ perdu leur ballon. | ont | on | sont | « ont » : on peut dire « avaient perdu »
`,
'f.voc': `
Synonyme de « content » | heureux | triste | fatigué | deux mots de même sens
Synonyme de « rapide » | vite | lent | calme
Contraire de « chaud » | froid | tiède | sec | tiède est entre les deux
Synonyme de « beau » | joli | laid | bizarre
Contraire de « jour » | nuit | matin | midi
Contraire de « grand » | petit | moyen | long
Synonyme de « ami » | copain | ennemi | voisin
Contraire de « commencer » | finir | démarrer | ouvrir | démarrer est un synonyme, pas un contraire
Synonyme de « fatigué » | épuisé | reposé | actif
Contraire de « facile » | difficile | simple | gentil
Synonyme de « effrayé » | apeuré | joyeux | calme
Contraire de « ouvrir » | fermer | porter | monter
Synonyme de « commencer » | débuter | terminer | arrêter
Contraire de « généreux » | avare | gentil | riche
`,
'f.gram': `
Nature de « chien » ? | nom | verbe | adjectif | on peut mettre « un » ou « le » devant
Nature de « courir » ? | verbe | nom | adjectif | on peut le conjuguer : je cours
Nature de « belle » ? | adjectif | nom | verbe | il dit comment est le nom : une belle fleur
Nature de « lentement » ? | adverbe | adjectif | verbe | il précise le verbe ; les mots en -ment sont souvent des adverbes
Nature de « nous » ? | pronom | nom | verbe | il remplace des personnes
Pluriel de « cheval » | chevaux | chevals | chevaus | les noms en -al font -aux (sauf bal, carnaval, festival…)
Pluriel de « bijou » | bijoux | bijous | bijoues | bijou, caillou, chou, genou, hibou, joujou, pou prennent un x
Pluriel de « journal » | journaux | journals | journeaux | -al → -aux
Féminin de « acteur » | actrice | acteuse | acteure | -teur → -trice
Féminin de « boulanger » | boulangère | boulangeuse | boulangeure | -er → -ère
Féminin de « chanteur » | chanteuse | chantrice | chanteure | -eur → -euse quand on reconnaît le verbe (chanter)
Pluriel de « œil » | yeux | œils | œux | pluriel irrégulier à retenir
`,
'f.homo2': `
Regarde ___ montagnes ! | ces | ses | c'est | « ces » montre : on peut dire « ces montagnes-là »
Il a perdu ___ clés. | ses | ces | c'est | « ses » = les siennes : on peut dire « ses propres clés »
___ mon meilleur ami. | C'est | S'est | Ses | « c'est » = cela est
Elle ___ trompée de route. | s'est | c'est | ses | verbe pronominal : se tromper → elle s'est trompée
Je ___ ai parlé hier. | leur | leurs | leure | devant un verbe, « leur » est un pronom et ne prend jamais de s
Ils promènent ___ chiens. | leurs | leur | leures | devant un nom pluriel, le déterminant « leurs » prend un s
___ belle journée ! | Quelle | Qu'elle | Quel | « quelle » s'accorde avec « journée » (féminin singulier)
Je pense ___ viendra. | qu'elle | quelle | quel | « qu'elle » = que + elle : on peut dire « qu'il viendra »
Il ___ mis à pleuvoir. | s'est | c'est | ses | se mettre à : verbe pronominal
Tu veux du thé ___ du café ? | ou | où | oû | « ou » = ou bien
La ville ___ j'habite. | où | ou | oû | « où » indique le lieu
___ décidé : on part demain ! | C'est | S'est | Ces | « c'est » = cela est
Il ___ fait mal au genou. | s'est | c'est | ses | se faire mal : verbe pronominal
Il est venu ___ ami. | sans son | s'en son | sans sont | « sans » = le contraire de « avec »
`,
'f.fonc': `
« Le chat mange la souris. » Fonction de « la souris » ? | COD | sujet | COI | le chat mange quoi ? → la souris
« Le chat mange la souris. » Fonction de « Le chat » ? | sujet | COD | attribut | c'est le chat qui mange
« Je parle à Léa. » Fonction de « à Léa » ? | COI | COD | CC de lieu | parler à quelqu'un : complément introduit par « à »
« Demain, nous partirons. » Fonction de « Demain » ? | CC de temps | sujet | COD | il répond à « quand ? » et peut se déplacer
« Il joue dans le jardin. » Fonction de « dans le jardin » ? | CC de lieu | COD | COI | il répond à « où ? »
« Marie est heureuse. » Fonction de « heureuse » ? | attribut du sujet | COD | épithète | après le verbe être, l'adjectif est attribut du sujet
« Une grande maison » : fonction de « grande » ? | épithète | attribut du sujet | COD | l'adjectif est collé au nom, sans verbe
« Il travaille avec courage. » Fonction de « avec courage » ? | CC de manière | COD | CC de lieu | il répond à « comment ? »
« Elle offre un livre à son frère. » Fonction de « un livre » ? | COD | COI | sujet | offrir quoi ? → un livre
« Elle offre un livre à son frère. » Fonction de « à son frère » ? | COI | COD | CC de lieu | offrir à qui ? → à son frère
« Il est resté chez lui à cause de la pluie. » Fonction de « à cause de la pluie » ? | CC de cause | CC de lieu | COI | il répond à « pourquoi ? »
`,
'f.figures': `
« Tes yeux sont des étoiles. » | métaphore | comparaison | personnification | une image sans outil de comparaison
« Fort comme un lion. » | comparaison | métaphore | hyperbole | outil de comparaison : « comme »
« Le vent hurle dans la nuit. » | personnification | métaphore | litote | le vent reçoit une action humaine
« Je meurs de faim. » | hyperbole | litote | euphémisme | exagération volontaire
« Va, je ne te hais point. » (Corneille) | litote | hyperbole | oxymore | dire moins pour faire entendre plus
« Cette obscure clarté » (Corneille) | oxymore | antithèse | métaphore | deux mots contraires réunis dans le même groupe
« Il nous a quittés » (pour « il est mort ») | euphémisme | litote | hyperbole | atténuer une réalité pénible
« Rome, l'unique objet… Rome, à qui… Rome… » | anaphore | chiasme | gradation | répétition d'un mot en début de vers
« Va, cours, vole, et nous venge ! » (Corneille) | gradation | anaphore | oxymore | intensité croissante
« Il faut manger pour vivre et non pas vivre pour manger. » | chiasme | anaphore | antithèse | structure croisée A-B-B-A
« Boire un verre » | métonymie | métaphore | euphémisme | le contenant désigne le contenu
« Je vis, je meurs » (Louise Labé) | antithèse | oxymore | chiasme | deux idées opposées rapprochées
`,
'f.litt': `
Victor Hugo, « Les Misérables » | romantisme | naturalisme | classicisme | XIXe siècle : sentiment, engagement, lyrisme
Émile Zola, « Germinal » | naturalisme | romantisme | surréalisme | peindre le réel de façon quasi scientifique
Molière, Racine, Corneille | classicisme | romantisme | réalisme | XVIIe siècle : règles, bienséance, raison
Balzac, Flaubert : peindre la société telle qu'elle est | réalisme | surréalisme | classicisme
André Breton, l'écriture automatique | surréalisme | naturalisme | les Lumières
Voltaire, Diderot : la raison contre les préjugés | les Lumières | le romantisme | le réalisme | XVIIIe siècle
Ronsard, Du Bellay | la Pléiade | le classicisme | le symbolisme | XVIe siècle : imiter les Anciens, défendre le français
Verlaine, Mallarmé : suggérer plutôt que décrire | symbolisme | naturalisme | classicisme
Beckett, Ionesco : « En attendant Godot » | théâtre de l'absurde | classicisme | romantisme
Sartre : « l'existence précède l'essence » | existentialisme | surréalisme | réalisme
Récit bref avec une chute, souvent publié en journal | la nouvelle | le roman | la fable
Récit en vers qui se termine par une morale (La Fontaine) | la fable | l'épopée | la nouvelle
Pièce où le héros est écrasé par le destin | la tragédie | la comédie | la farce
`,
'f.analyse': `
Un texte qui cherche à faire rire | comique | tragique | épique
Le « je » exprime ses sentiments (amour, mélancolie) | lyrique | polémique | épique
Un combat héroïque, grandiose et amplifié | épique | lyrique | comique
Un texte qui attaque vivement une idée ou une personne | polémique | lyrique | fantastique
Un texte qui cherche à émouvoir, à faire pitié | pathétique | comique | ironique
Le lecteur hésite entre explication rationnelle et surnaturelle | fantastique | merveilleux | réaliste | définition de Todorov
Dire le contraire de ce qu'on pense pour se moquer | ironie | lyrisme | litote
Thèse, arguments et exemples : quel type de texte ? | argumentatif | narratif | descriptif
Le narrateur sait tout de tous les personnages | focalisation zéro | focalisation interne | focalisation externe | on dit aussi « narrateur omniscient »
On ne voit que ce que voit et pense un personnage | focalisation interne | focalisation zéro | focalisation externe
On voit les personnages de l'extérieur, comme une caméra | focalisation externe | focalisation interne | focalisation zéro
« Je vous prie d'agréer mes salutations distinguées. » Registre ? | soutenu | familier | courant
« T'inquiète, c'est trop cool. » Registre ? | familier | soutenu | courant
`,

/* ═══════════════ ANGLAIS (niveaux du cadre européen A1 → C1) ═══════════════ */
'e.voc1': `
« Dog » en français ? | chien | chat | oiseau
« Cat » en français ? | chat | chien | lapin
« Red » en français ? | rouge | bleu | vert
« Blue » en français ? | bleu | rouge | noir
« Bird » en français ? | oiseau | poisson | chat
« Green » en français ? | vert | jaune | bleu
« Fish » en français ? | poisson | chien | oiseau
« Yellow » en français ? | jaune | rouge | blanc
« Big » en français ? | grand | petit | lourd
« Ten » en chiffres ? | 10 | 9 | 11
« Five » en chiffres ? | 5 | 4 | 6
« Horse » en français ? | cheval | vache | chèvre
`,
'e.voc2': `
« House » en français ? | maison | école | jardin
« School » en français ? | école | maison | rue
« Book » en français ? | livre | stylo | cahier
« Tree » en français ? | arbre | fleur | herbe
« Apple » en français ? | pomme | poire | banane
« Water » en français ? | eau | lait | jus
« Window » en français ? | fenêtre | porte | mur
« Chair » en français ? | chaise | table | lit
« Sun » en français ? | soleil | lune | étoile
« Rain » en français ? | pluie | neige | vent
`,
'e.be': `
I ___ a student. | am | is | are | I am (je suis)
She ___ to school. | goes | go | going | 3e personne du singulier : on ajoute -s (ou -es)
They ___ happy. | are | is | am | they are (ils sont)
He ___ a book. | reads | read | reading | he → -s
We ___ friends. | are | is | am | we are
I ___ an apple every day. | eat | eats | eating | avec « I », pas de -s
My dog ___ very fast. | runs | run | running | my dog = it → -s
The children ___ in the park. | play | plays | playing | children est un pluriel : pas de -s
I live ___ France. | in | on | at | in + pays ou ville
There ___ a dog in the garden. | is | are | am | there is + singulier
There ___ many children. | are | is | am | there are + pluriel
How old ___ you? | are | is | do | on dit « How old are you? »
What ___ your name? | is | are | do | your name est singulier
I ___ not understand. | do | does | am | négation avec I : do not (don't)
She ___ not like spiders. | does | do | is | négation avec she : does not (doesn't)
`,
'e.irr': `
Pluriel de « child » | children | childs | childrens
Pluriel de « mouse » | mice | mouses | mices
Pluriel de « foot » | feet | foots | feets
Passé de « go » | went | goed | gone | go – went – gone
Passé de « eat » | ate | eated | eaten | eat – ate – eaten
Passé de « see » | saw | seed | seen | see – saw – seen
Passé de « have » | had | haved | has
Passé de « run » | ran | runned | runs | run – ran – run
Pluriel de « man » | men | mans | mens
Pluriel de « tooth » | teeth | tooths | teeths
Pluriel de « sheep » | sheep | sheeps | sheepes | invariable, comme « fish »
Passé de « make » | made | maked | making
Passé de « come » | came | comed | comes
Passé de « swim » | swam | swimmed | swum | swim – swam – swum
`,
'e.cont': `
Listen! The baby ___. | is crying | cries | cry | « Listen! » : ça se passe maintenant → présent continu
She ___ to school every day. | goes | is going | go | « every day » : habitude → présent simple
Water ___ at 100 °C. | boils | is boiling | boil | vérité générale → présent simple
Look! It ___. | is snowing | snows | snow | « Look! » : maintenant
I ___ TV right now. | am watching | watch | watches | « right now » → présent continu
He usually ___ coffee. | drinks | is drinking | drink | « usually » : habitude
They ___ football on Saturdays. | play | are playing | plays | habitude
We ___ dinner at the moment. | are having | have | has | « at the moment » → présent continu
My brother ___ French. (il la connaît) | speaks | is speaking | speak | fait permanent → présent simple
What ___? — I'm reading. | are you doing | do you do | you are doing | question sur l'action en cours
`,
'e.comp': `
My bag is ___ than yours. | heavier | more heavy | heavyer | adjectif court en -y : -y devient -ier
This is the ___ film I've ever seen. | best | better | goodest | good – better – the best
Maths is ___ than history for me. | more difficult | difficulter | most difficult | adjectif long : more + adjectif
He is as tall ___ his father. | as | than | like | égalité : as … as
You ___ wear a seatbelt. It's the law. | must | can | might | obligation → must
___ I open the window, please? | May | Must | Should | permission polie → may
You ___ see a doctor. (conseil) | should | mustn't | can't | conseil → should
It ___ rain later. (possible) | might | must | has to | possibilité → might
She is the ___ girl in the class. | tallest | taller | most tall | superlatif court : the + -est
This is ___ than I thought. (bad) | worse | badder | worst | bad – worse – the worst
`,
'e.pp': `
I ___ to London last year. | went | have gone | go | « last year » : moment précis du passé → prétérit
I have never ___ sushi. | eaten | ate | eat | present perfect = have + participe passé (eat – ate – eaten)
She ___ here since 2020. | has lived | lived | lives | « since » : depuis, jusqu'à maintenant → present perfect
Have you ever ___ to Paris? | been | went | go | expérience de vie : have been
We ___ the film yesterday. | saw | have seen | seen | « yesterday » → prétérit
He ___ his keys, so he can't get in. | has lost | lost | loses | conséquence au présent → present perfect
They ___ married in 2015. | got | have got | get | date précise → prétérit
I ___ my homework yet. | haven't finished | didn't finish | don't finish | « yet » → present perfect
Participe passé de « write » | written | wrote | writed | write – wrote – written
How long have you ___ here? | lived | live | living | have + participe passé
`,
'e.cond': `
If it rains, we ___ at home. | will stay | would stay | stayed | if + présent → will + verbe
If I ___ rich, I would travel. | were | am | will be | 2e conditionnel : if + prétérit (were pour toutes les personnes)
If I had studied, I ___ the exam. | would have passed | will pass | would pass | if + past perfect → would have + participe
If you heat ice, it ___. | melts | would melt | melted | vérité générale : présent + présent
I ___ you if I had your number. | would call | will call | called | situation imaginaire → would
If she ___ earlier, she wouldn't have missed the bus. | had left | left | has left | regret sur le passé → past perfect
Unless you hurry, you ___ late. | will be | would be | are | unless = if not
I wish I ___ taller. | were | am | will be | souhait irréel : wish + prétérit
If I were you, I ___ apologise. | would | will | am | conseil : If I were you, I would…
`,
'e.pass': `
The Mona Lisa ___ by Leonardo da Vinci. | was painted | painted | is painting | passif : be + participe passé
English ___ all over the world. | is spoken | speaks | is speaking | passif au présent
The bridge ___ next year. | will be built | will build | is built | passif au futur : will be + participe
The letter ___ yet. | hasn't been sent | didn't send | hasn't sent | passif au present perfect
She said, "I am tired." → She said that she ___ tired. | was | is | were | discours indirect : le présent recule au prétérit
He said, "I will come." → He said he ___ come. | would | will | can | will devient would
"Do you like tea?" → She asked me if I ___ tea. | liked | like | do like | question indirecte : if + sujet + verbe, temps reculé
"We have finished." → They told me they ___ finished. | had | have | has | present perfect → past perfect
My phone ___ yesterday. | was stolen | stole | is stolen | passif au prétérit
`,
'e.phr': `
« to give up » | abandonner | donner un cadeau | monter | I gave up smoking
« to look forward to » | attendre avec impatience | regarder derrière | chercher | suivi de -ing : I look forward to seeing you
« to run out of » milk | ne plus en avoir | courir avec | sortir en courant
« to turn down » an offer | refuser | accepter | éteindre
« to put off » a meeting | reporter | annuler | mettre
« It's raining cats and dogs. » | il pleut des cordes | des animaux tombent | il fait beau
« to break the ice » | briser la glace | avoir froid | casser quelque chose | engager la conversation
« a piece of cake » | très facile | un dessert | très cher
« to get along with » someone | bien s'entendre avec | partir avec | suivre
« to find out » | découvrir | perdre | sortir
« once in a blue moon » | très rarement | tous les mois | la nuit | l'équivalent de « tous les 36 du mois »
`,
'e.link': `
___ it was raining, we went out. | Although | Because | Therefore | although = bien que (concession)
She studied hard; ___, she passed. | therefore | however | although | therefore = donc (conséquence)
I like tea. ___, I prefer coffee. | However | Because | So that | however = cependant (opposition)
He stayed home ___ he was ill. | because | although | however | because = parce que (cause)
___ his efforts, he failed. | Despite | Although | Because | despite + nom = malgré
We left early ___ we wouldn't miss the train. | so that | although | however | so that = pour que (but)
___, the essay argues that… (pour conclure) | In conclusion | Moreover | For instance
Cycling is healthy. ___, it's cheap. | Moreover | However | Although | moreover = de plus (ajout)
Many sports, ___ tennis, need a racket. | such as | despite | whereas | such as = comme, par exemple
I love summer, ___ my sister prefers winter. | whereas | despite | therefore | whereas = alors que (contraste)
`,

/* ═══════════════ ALLEMAND ═══════════════ */
'd.nom': `
« Maison » en allemand ? | das Haus | der Hund | die Katze
« Chat » en allemand ? | die Katze | der Hund | das Haus
« Chien » en allemand ? | der Hund | die Katze | der Fisch
« Voiture » en allemand ? | das Auto | der Bus | das Rad
« École » en allemand ? | die Schule | das Haus | das Buch
« Livre » en allemand ? | das Buch | die Schule | das Heft
« Eau » en allemand ? | das Wasser | die Milch | der Saft
« Pain » en allemand ? | das Brot | der Apfel | das Ei
« Table » en allemand ? | der Tisch | der Stuhl | die Bank
« Chaise » en allemand ? | der Stuhl | der Tisch | das Bett
« Arbre » en allemand ? | der Baum | die Blume | der Wald
« Fleur » en allemand ? | die Blume | der Baum | das Gras
« Soleil » en allemand ? | die Sonne | der Mond | der Stern
« Enfant » en allemand ? | das Kind | der Mann | die Frau
« Mère » en allemand ? | die Mutter | der Vater | die Schwester
« Père » en allemand ? | der Vater | die Mutter | der Bruder
`,
'd.adj': `
« Rouge » en allemand ? | rot | blau | grün
« Bleu » en allemand ? | blau | rot | schwarz
« Vert » en allemand ? | grün | blau | weiß
« Noir » en allemand ? | schwarz | weiß | grau
« Grand » en allemand ? | groß | klein | alt
« Petit » en allemand ? | klein | groß | neu
« Rapide » en allemand ? | schnell | langsam | schön
« Vieux » en allemand ? | alt | neu | jung
« Beau » en allemand ? | schön | hässlich | kalt
« Froid » en allemand ? | kalt | warm | heiß
`,
'd.phr': `
« Bonjour » en allemand ? | Guten Tag | Tschüss | Danke
« Merci » en allemand ? | Danke | Bitte | Hallo
« S'il te plaît » en allemand ? | Bitte | Danke | Ja
« Au revoir » en allemand ? | Tschüss | Hallo | Danke
Ich ___ müde. (être) | bin | bist | ist | sein : ich bin, du bist, er ist
Er ___ ein Buch. (avoir) | hat | habe | hast | haben : ich habe, du hast, er hat
Wir ___ Freunde. (être) | sind | seid | bin | wir sind, ihr seid
Du ___ nett. (être) | bist | bin | sind
Ich ___ zehn Jahre alt. | bin | habe | ist | en allemand, on « est » dix ans
Sie ___ zwei Brüder. (elle, avoir) | hat | ist | haben
`,
'd.plur': `
Pluriel de « das Haus » | die Häuser | die Hause | die Hauser
Pluriel de « der Hund » | die Hunde | die Hunds | die Hunden
Article de « Katze » | die | der | das
Article de « Buch » | das | der | die
Article de « Mann » | der | die | das
Pluriel de « das Kind » | die Kinder | die Kinds | die Kindes
Pluriel de « die Blume » | die Blumen | die Blume | die Blumes
Article de « Sonne » | die | der | das
Article de « Baum » | der | die | das
Article de « Mädchen » | das | die | der | les mots en -chen sont toujours neutres
Pluriel de « der Stuhl » | die Stühle | die Stuhls | die Stühlen
Pluriel de « das Auto » | die Autos | die Auto | die Auten
`,
'd.verb': `
ich ___ (spielen) | spiele | spielst | spielt | ich → -e
du ___ (spielen) | spielst | spielt | spiele | du → -st
er ___ (fahren) | fährt | fahrt | fähre | verbe fort : a devient ä avec du, er, sie, es
du ___ (lesen) | liest | lest | lesst | e devient ie : du liest
wir ___ (gehen) | gehen | geht | gehst | wir → -en
ihr ___ (kommen) | kommt | kommen | kommst | ihr → -t
sie (elle) ___ (sprechen) | spricht | sprecht | sprechen | e devient i : sie spricht
ich ___ (sein) | bin | ist | bist | sein : ich bin, du bist, er ist
er ___ (haben) | hat | habt | haben | haben : er hat
du ___ (essen) | isst | esst | essen | e devient i : du isst
`,
'd.akk': `
Ich sehe ___ Hund. | den | der | dem | Akkusativ masculin : der devient den
Ich gebe ___ Frau das Buch. | der | die | den | Dativ féminin : die devient der
Er hilft ___ Mann. | dem | den | der | helfen + Dativ ; masculin → dem
Wir kaufen ___ Auto. | ein | einen | einem | neutre à l'accusatif : ein ne change pas
Ich habe ___ Bruder. | einen | ein | einem | masculin à l'accusatif : einen
Ich fahre mit ___ Zug. | dem | den | der | mit + Dativ ; der Zug → dem
Das Geschenk ist für ___ Mutter. | meine | meiner | meinen | für + Akkusativ ; le féminin ne change pas
Ich wohne bei ___ Oma. | meiner | meine | meinen | bei + Dativ ; féminin → meiner
Er trinkt ___ Kaffee. | einen | ein | einem | der Kaffee → Akkusativ einen
Die Katze schläft auf ___ Sofa. | dem | das | den | Wo? (sans mouvement) → Dativ ; das Sofa → dem
`,
'd.perf': `
Ich ___ Fußball gespielt. | habe | bin | hat | la plupart des verbes : haben + participe
Wir ___ nach Berlin gefahren. | sind | haben | seid | verbe de déplacement : sein
Participe de « machen » | gemacht | gemachen | machte | verbe faible : ge- + radical + -t
Participe de « sehen » | gesehen | gesieht | gesehtet | verbe fort : ge- + radical + -en
Er ___ spät aufgestanden. | ist | hat | habt | changement d'état → sein
Participe de « trinken » | getrunken | getrinkt | getrankt | trinken – trank – getrunken
Participe de « besuchen » | besucht | gebesucht | besuchen | pas de ge- avec be-, ver-, er-…
Sie ___ ein Buch gelesen. | hat | ist | haben | lesen → haben
Participe de « gehen » | gegangen | gegeht | gangen | gehen – ging – gegangen (avec sein)
Participe de « einkaufen » | eingekauft | geeinkauft | einkaufgt | verbe à particule : ge- entre la particule et le radical
`,
'd.modal': `
Ich ___ gut schwimmen. (capacité) | kann | muss | darf | können = pouvoir, savoir faire
Du ___ hier nicht rauchen. (interdit) | darfst | kannst | willst | nicht dürfen = ne pas avoir le droit
Wir ___ morgen früh aufstehen. (obligation) | müssen | dürfen | mögen | müssen = devoir
Er ___ ein Eis essen. (volonté) | will | soll | darf | wollen = vouloir
___ ich dir helfen? (proposition) | Soll | Muss | Will | « Soll ich…? » = veux-tu que je… ?
Ich ___ Schokolade. | mag | muss | kann | mögen = aimer
Ich möchte einen Tee ___. | trinken | trinke | getrunken | avec un verbe de modalité, l'infinitif va à la fin
Sie ___ Deutsch sprechen. (elle sait) | kann | können | kannst | sie (elle) → kann
Ihr ___ leise sein! | müsst | muss | müssen | ihr → müsst
`,
'd.neben': `
Ich bleibe zu Hause, weil ich krank ___. | bin | ist | sein | après weil, le verbe conjugué va à la fin
Ich weiß, dass er morgen ___. | kommt | kommen | komme | après dass, le verbe conjugué va à la fin
Wenn es regnet, ___ ins Kino. | gehe ich | ich gehe | gehen ich | après une subordonnée en tête : verbe puis sujet
Er sagt, dass er keine Zeit ___. | hat | haben | habt | verbe conjugué en fin de subordonnée
Ich lerne Deutsch, ___ ich in Berlin arbeiten will. | weil | aber | und | weil = parce que ; verbe à la fin
Weißt du, ___ der Zug abfährt? | wann | wenn | als | question indirecte sur le moment : wann
___ ich klein war, wohnte ich in Genf. | Als | Wenn | Wann | événement unique dans le passé : als
Ich hoffe, ___ du kommst. | dass | das | weil | dass (conjonction) ≠ das (article ou pronom)
Ich komme nicht, ___ ich bin krank. | denn | weil | dass | denn = car : l'ordre des mots ne change pas
`,
'd.konj': `
Wenn ich Zeit ___, würde ich reisen. | hätte | habe | hatte | Konjunktiv II de haben : hätte
Wenn ich reich ___, würde ich ein Haus kaufen. | wäre | bin | war | Konjunktiv II de sein : wäre
Ich ___ gern ein Eis. (politesse) | hätte | habe | hatte | « Ich hätte gern… » = je voudrais
___ Sie mir helfen? (poli) | Könnten | Können | Konnten | Konjunktiv II de können : könnten
Präteritum de « ich gehe » | ich ging | ich gehte | ich gang | gehen – ging – gegangen
Präteritum de « er kommt » | er kam | er kommte | er kamt | kommen – kam – gekommen
Präteritum de « wir machen » | wir machten | wir machen | wir mochten | verbe faible : -te
Präteritum de « sie ist » | sie war | sie ist gewesen | sie wäre | sein – war – gewesen
Wenn ich du ___, würde ich mehr lernen. | wäre | bin | war | conseil : Wenn ich du wäre…
Er tut so, als ob er krank ___. | wäre | ist | war | als ob + Konjunktiv II
`,
};
