# Rootkit 3D

Jeu de tir à la première personne rétro, en application web, dans la lignée des FPS en grille des
années 1990. Vous infiltrez un centre de données gardé par des drones et des robots sentinelles,
volez ses puces de données et atteignez le terminal de sortie de chaque niveau. Le jeu se joue au
clavier et à la souris, sur ordinateur.

## Le jeu

- **3 niveaux** à enchaîner : le Quai de chargement, la Salle des serveurs puis le Noyau. Santé,
  munitions, armes et score passent d'un niveau à l'autre ; la carte d'accès, non.
- **Objectif** : trouver le terminal de sortie (écran vert à flèche) et l'activer. Neutraliser la
  sécurité et voler les puces de données n'est pas obligatoire, mais fait monter le score et le
  bilan de fin de niveau.
- **Portes** : elles s'ouvrent avec E ou Espace et se referment seules après quelques secondes,
  jamais sur quelqu'un. Les portes à bande rouge sont verrouillées et demandent la **carte
  d'accès**, cachée ailleurs dans le niveau. Les ennemis ouvrent les portes non verrouillées.
- **Ennemis** :
  - le **drone** (25 PV, 100 points), lent à viser ;
  - la **sentinelle** (60 PV, 400 points), plus résistante et qui tire plus vite.

  Ils repèrent le joueur à vue, entendent les coups de feu à travers les murs, le poursuivent de
  pièce en pièce, visent un court instant avant de tirer et ratent plus souvent de loin. Chaque
  ennemi abattu laisse des munitions.
- **Armes** : le **pistolet** de départ, puis le **fusil d'assaut**, à tir rapide, à ramasser
  dans le premier niveau. Elles partagent les mêmes munitions.
- **Objets** : kit de soin (+25 santé), munitions (+8), fusil (+6 munitions), carte d'accès et
  puce de données (+500 points). Un objet inutile, comme un kit de soin à pleine santé, reste au
  sol.
- **Mort** : le niveau recommence avec l'équipement que vous aviez en y entrant.
- **Bilan** à la fin de chaque niveau : part de la sécurité neutralisée, part des données volées,
  temps et score.
- **Graphismes et sons générés par le code** : textures, sprites et armes en pixel art,
  bruitages synthétisés, sans aucun fichier image ou audio.
- **Jouable hors ligne et installable** : après une première visite, l'application se lance sans
  connexion et s'installe comme application de bureau. Une nouvelle version déployée est proposée
  depuis l'écran d'accueil, jamais en pleine partie.

### Commandes

| Touche | Action |
| --- | --- |
| Z Q S D (AZERTY) ou W A S D (QWERTY) | Se déplacer |
| Souris, ou flèches gauche et droite | Tourner |
| Clic gauche ou Ctrl | Tirer |
| E ou Espace | Ouvrir une porte, activer le terminal |
| Maj | Courir |
| 1 / 2 | Pistolet / fusil |
| Échap ou P | Pause |

Les touches de déplacement suivent leur position physique sur le clavier : ZQSD sur un clavier
AZERTY et WASD sur un clavier QWERTY sont les mêmes touches. La souris est capturée pendant la
partie ; Échap la libère et met le jeu en pause.

## Stack technique

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup lang="ts">`) et [Vite](https://vite.dev/)
- TypeScript strict
- [TresJS](https://tresjs.org/) (Three.js pour Vue) pour le rendu WebGL
- [Tailwind CSS](https://tailwindcss.com/) pour l'interface
- [Vitest](https://vitest.dev/) pour les tests
- [pnpm](https://pnpm.io/) comme gestionnaire de paquets

Le code est découpé en couches :

- `src/engine/` : le moteur de jeu, en TypeScript pur, sans dépendance à Vue ni à Three.js (une
  règle ESLint y veille). Il gère les déplacements et collisions, les portes, l'IA des ennemis,
  les tirs et les objets, et avance d'un pas à chaque image. Avec une graine fixe, il est
  déterministe, ce qui le rend testable de bout en bout.
- `src/scene/` : le rendu 3D avec TresJS (murs regroupés par texture, portes coulissantes,
  sprites, brouillard, rendu en basse résolution aux pixels nets) et le pixel art généré.
- `src/game/` : la session de jeu qui relie le moteur à Vue, les entrées clavier et souris, les
  sons, la campagne et l'état de l'interface.
- `src/ui/` : les écrans, la barre d'état, l'arme en vue subjective et les fenêtres de briefing,
  de pause, de mort et de bilan.
- `src/pwa/` : le manifeste et la mise à jour de l'application installée.

## Créer un niveau

Un niveau est un plan en texte dans `src/engine/levels/`, une chaîne par rangée et un caractère par
case, enregistré dans `src/engine/levels/index.ts`. L'est est à droite, le sud en bas.

| Caractère | Case |
| --- | --- |
| `#` `%` `=` | Mur d'acier, de béton, baie de serveurs |
| `X` | Terminal de sortie (un mur) |
| `.` | Sol |
| `D` / `L` | Porte / porte verrouillée, entre deux murs qui se font face |
| `>` `v` `<` `^` | Départ du joueur, tourné vers l'est, le sud, l'ouest ou le nord |
| `d` / `S` | Drone / sentinelle |
| `+` `a` `R` `k` `$` | Kit de soin, munitions, fusil, carte d'accès, puce de données |

Le plan est vérifié au chargement : rangées de même longueur, bordure entièrement murée, un seul
départ, portes encadrées par deux murs. Les tests vérifient en plus que chaque niveau est
jouable : sortie atteignable, carte d'accès trouvable avant les portes verrouillées, ennemis et
objets accessibles.

## Démarrage

```bash
pnpm install       # installer les dépendances
pnpm dev           # lancer l'application en développement
pnpm test          # lancer les tests
pnpm lint          # analyser le code
pnpm type-check    # vérifier les types
pnpm build         # construire la version de production
pnpm preview       # servir la version construite (service worker et mode hors ligne actifs)
pnpm generate-pwa-assets  # régénérer les icônes PNG de public/ depuis public/icon.svg
```
