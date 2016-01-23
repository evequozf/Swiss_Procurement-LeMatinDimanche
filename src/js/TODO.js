/************
TODO :

TEL ALEXANDRE 21.01.2016
- tooltip entreprise: quel département paie ? quelle catégorie de services ?
- catégories: nettoyer données pour n'avoir que les 22 catégories principales
- prévoir chargement des données avec un fichier par année / langue


A DISCUTER
~ - quoi afficher dans détails
√ - comment faire figurer montant connus / inconnus (ma suggestion: pas dans sunburst)

HIGH
√ - calculer pourcentages dans données (0.5h : 16:00)
~ - multilingue : à discuter -> fichier lang.fr.js importé dans .html et qui crée une variable globale ? 
Probablement le plus simple...

CONVENU CAFE DE GRANCY
√ - fixed-tooltip à cacher sur mobile 
√ - tooltip: afficher aussi on mouse-over du breadcrumb (1h - 15:30)
~ - catégories : sparkline similaire NY times pour vue détaillée, fonction qui le fait (+ icônes?) -> refactor disposition
√ - détails, comme dans carnet
√ - résumé dans structures bootstrap plutôt que table
~ - switch années au-dessous sunburst "Année: 2011 2012 2013 etc."
√ - intégrer données Alex
√ - refactor données pour calculer la valeur des 'Unknown'
- basic tracking analytics
0- tooltip sur entreprise: table avec catégories de dépenses (reprendre icônes ?)
X - label sunburst : mettre % en + sur les plus gros (si place)
0- dernier niveau (seulement) -> ajouter le type de prestation, par ex. avec icône ? 
- show more ? cf. http://jsfiddle.net/KyleMit/MD2FP/


MIDDLE
~- Meilleur passage des années (pas reconstruire le SVG...)
√ garder "état de la visualisation" quand on change d'année ? (= actuel filter, je pense, garder le datum actuel...)
- "polissage" par Inventaire ?
- pym.js


LOW
X - Breadcrumb sur mobile (pas d'overlap)
- transition pour bar chart
~ - object persistence (bars + pies)
~ - vraies données
- use breadcrumb from bootstrap
0- interaction continue sur mobile pour sunburst (y.c. fixed tooltip -> différencier avec media queries ?)
  => voir aussi http://bl.ocks.org/mbostock/770ae19ca830a4ce87f5 -> listener ailleurs ? laisser tomber ?


√ - générer un breadcrumb plus évolué ? cf. http://bl.ocks.org/kerryrodden/7090426
√ - refactoring : modules ! -> sortir le traitement des data et préparation pour les deux viz
√ - tooltip: dans sunburst une zone fixe plutôt ?? Sous le breadcrumb par ex. ?
√ - highlight sunburst en masquant les autres (baisser opacité)
√ - rendre interaction indépendante du clic -> avoir une fonction "showDetail(dept)"
√ - update showDetail to provide data in argument, not dept name

---------

On updateable sunburst when year changes: 
- ideally, should create sunburst with 'complete' structure (i.e. all depts, all years, with key function
associating data with paths), then update it based on only the current year.

---------


*******************/