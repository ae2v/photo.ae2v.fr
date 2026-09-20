# photo.ae2v.fr

Petit annuaire d’albums photo AE2V. L’application lit les sous-dossiers publics d’un dossier Google Drive, attribue à chacun un code court permanent et redirige ce code vers Drive.

## Architecture

- Next.js 16 / App Router, déployé sur Vercel ;
- Google Drive API avec compte de service en lecture seule ;
- PostgreSQL serverless (Neon ou Vercel Postgres) pour `drive_folder_id → short_code` ;
- cache de données Next.js/Vercel revalidé toutes les 600 secondes ;
- aucun stockage local, processus persistant ou cache mémoire requis.

## Installation

Commencez par [le tutoriel Google Cloud](docs/CONFIGURATION_GOOGLE.md).

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run test:drive
npm run dev
```

## Déploiement Vercel

Ajoutez les variables de `.env.example` dans les paramètres Vercel, reliez une base PostgreSQL serverless, exécutez la migration puis redéployez. Le domaine `photo.ae2v.fr` pourra ensuite être ajouté dans **Settings → Domains**.

Les identifiants Google et `DATABASE_URL` restent côté serveur. Tous les fichiers `.env*` sont ignorés par Git à l’exception du modèle vide `.env.example`.
