# Déploiement Vercel

- Projet Vercel : `ae2v/photos`
- Dépôt source : `ae2v/photos`, branche `master`
- Domaine prévu : `photo.ae2v.fr`
- Base : ressource Neon `photos-db` (données restaurées depuis la sauvegarde du 22 septembre 2026)
- Variables applicatives : `NEXT_PUBLIC_SITE_URL`, `GOOGLE_PROJECT_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`

Les quatre variables Google doivent provenir du projet Google Cloud et du dossier Drive. Elles ne figurent pas dans les sauvegardes Vercel et ne doivent pas être ajoutées au dépôt. Les commits sur `master` doivent déclencher les déploiements de production depuis GitHub.
