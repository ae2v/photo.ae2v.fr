# Configurer Google Drive pour photo.ae2v.fr

Ce guide prépare un accès **strictement en lecture seule** au dossier Google Drive `Photos`. L’application utilise un compte de service : aucune connexion Google n’est demandée aux visiteurs et aucune délégation à l’ensemble du domaine n’est nécessaire.

## 1. Créer ou choisir le projet Google Cloud

1. Ouvrez [Google Cloud Console](https://console.cloud.google.com/).
2. Cliquez sur le sélecteur de projet, en haut de la page, puis sur **Nouveau projet**.
3. Nommez-le par exemple `photo-ae2v`, choisissez l’organisation AE2V si elle est proposée, puis cliquez sur **Créer**.
4. Une fois la création terminée, sélectionnez ce projet dans le bandeau supérieur.
5. Ouvrez **IAM et administration → Paramètres** et copiez l’**ID du projet**. Conservez-le pour `GOOGLE_PROJECT_ID`.

## 2. Activer l’API Google Drive

1. Dans le menu ☰, ouvrez **API et services → Bibliothèque**.
2. Recherchez `Google Drive API`.
3. Ouvrez le résultat **Google Drive API** puis cliquez sur **Activer**.

Le projet n’a pas besoin d’un écran de consentement OAuth : le serveur utilisera son propre compte de service.

## 3. Créer le compte de service

1. Ouvrez **IAM et administration → Comptes de service**.
2. Cliquez sur **Créer un compte de service**.
3. Nom : `photo-ae2v-reader`. L’identifiant proposé peut être conservé.
4. Cliquez sur **Créer et continuer**.
5. Ne lui attribuez aucun rôle Google Cloud : l’accès au dossier Drive sera accordé directement dans Drive.
6. Cliquez sur **OK**.
7. Dans la liste, ouvrez le compte créé et copiez son adresse e-mail, de la forme `photo-ae2v-reader@photo-ae2v.iam.gserviceaccount.com`. Conservez-la pour `GOOGLE_CLIENT_EMAIL`.

N’activez pas la délégation à l’échelle du domaine. Elle donnerait plus d’accès que nécessaire.

## 4. Créer une clé privée

1. Dans la fiche du compte de service, ouvrez l’onglet **Clés**.
2. Cliquez sur **Ajouter une clé → Créer une clé**.
3. Choisissez **JSON**, puis **Créer**.
4. Un fichier JSON est téléchargé. Gardez-le dans un emplacement privé et ne l’ajoutez jamais au dépôt Git.
5. Dans ce JSON, relevez `project_id`, `client_email` et `private_key`.

La clé téléchargée ne pourra pas être téléchargée une seconde fois. Si elle est perdue ou exposée, supprimez-la dans cette même page et créez-en une nouvelle.

## 5. Autoriser uniquement le dossier Photos

1. Ouvrez Google Drive avec le compte qui gère les photos.
2. Repérez le dossier racine `Photos`.
3. Cliquez droit sur le dossier, puis **Partager**.
4. Dans **Ajouter des personnes et des groupes**, collez l’adresse `GOOGLE_CLIENT_EMAIL` du compte de service.
5. Choisissez le rôle **Lecteur**, décochez l’envoi de notification si Drive le propose, puis cliquez sur **Partager**.

Le compte de service peut maintenant lire ce dossier et ses sous-dossiers, mais pas les modifier. L’application demande en plus le scope API `https://www.googleapis.com/auth/drive.readonly`.

## 6. Rendre un événement public

Chaque sous-dossier de `Photos` représente un événement. Pour le publier :

1. Cliquez droit sur le sous-dossier puis **Partager**.
2. Sous **Accès général**, choisissez **Tous les utilisateurs disposant du lien**.
3. Laissez le rôle **Lecteur**, puis cliquez sur **OK**.

Les sous-dossiers restés en accès limité ne seront pas affichés par le site.

## 7. Copier l’ID du dossier Photos

Ouvrez le dossier `Photos`. Son URL ressemble à :

```text
https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOp
```

Copiez uniquement la partie après `/folders/`, ici `1AbCdEfGhIjKlMnOp`. C’est la valeur de `GOOGLE_DRIVE_FOLDER_ID`.

## 8. Préparer le fichier .env.local

À la racine du projet, copiez `.env.example` vers `.env.local`, puis complétez :

```env
GOOGLE_PROJECT_ID=photo-ae2v
GOOGLE_CLIENT_EMAIL=photo-ae2v-reader@photo-ae2v.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1AbCdEfGhIjKlMnOp
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Copiez `private_key` depuis le JSON en conservant les `\n` littéraux et les guillemets. `.env.local` est ignoré par Git.

## 9. Tester l’accès

Après installation des dépendances et configuration de la base :

```bash
npm run db:migrate
npm run test:drive
```

Le test doit afficher les noms des sous-dossiers lisibles et indiquer lesquels sont publics. Une erreur `403` indique généralement que l’API Drive n’est pas activée ou que le dossier n’a pas été partagé avec le compte de service. Une liste vide indique souvent un mauvais `GOOGLE_DRIVE_FOLDER_ID`.

## 10. Configurer Vercel

Dans Vercel, ouvrez **Project Settings → Environment Variables** et ajoutez les six variables ci-dessus. Utilisez l’URL publique pour `NEXT_PUBLIC_SITE_URL`, par exemple `https://photo.ae2v.fr`. Pour `GOOGLE_PRIVATE_KEY`, collez la clé sur plusieurs lignes ou gardez les `\n` : l’application accepte les deux formats.

Ajoutez les secrets aux environnements **Production**, **Preview** et **Development** seulement si nécessaire. Ne copiez jamais le fichier JSON complet dans GitHub.

Après ajout ou modification d’une variable, redéployez le projet. Le cache Vercel est revalidé toutes les 10 minutes ; il n’est pas fondé sur la mémoire d’une fonction serverless.
