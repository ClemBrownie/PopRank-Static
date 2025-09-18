# PopRank

PopRank est une application de suivi de films inspirée de Letterboxd, construite avec Angular, Ionic et Capacitor.

## Fonctionnalités

- 🔐 Authentification Google (Web + Mobile)
- 🔍 Recherche de films via l'API TMDB
- ⭐ Notation des films (0-5 étoiles)
- 📝 Avis personnalisés
- 👤 Profil utilisateur avec bio éditable
- 📱 Feed global des dernières activités
- 📊 Statistiques personnelles

## Stack Technique

- **Frontend**: Angular 20 + Ionic 8
- **Mobile**: Capacitor (iOS + Android)
- **Backend**: Firebase (Auth + Firestore)
- **API Films**: The Movie Database (TMDB)
- **Déploiement Web**: Vercel

## Installation

1. Cloner le projet
```bash
git clone <repository-url>
cd PopRank
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer l'environnement
```bash
# Copier le fichier d'environnement
cp src/environments/environment.ts.example src/environments/environment.ts

# Remplir les clés API Firebase et TMDB dans environment.ts
```

4. Lancer l'application
```bash
npm start
```

## Configuration

### Firebase
1. Créer un projet Firebase
2. Activer l'authentification Google
3. Créer une base de données Firestore
4. Configurer les règles de sécurité (voir `firestore.rules`)

### TMDB
1. Créer un compte sur [TMDB](https://www.themoviedb.org/)
2. Générer une clé API
3. L'ajouter dans les fichiers d'environnement

## Scripts Disponibles

- `npm start` - Lancer le serveur de développement
- `npm run build` - Build de production
- `npm run cap:sync` - Synchroniser avec Capacitor
- `npm run ios` - Ouvrir dans Xcode
- `npm run android` - Ouvrir dans Android Studio

## Structure du Projet

```
src/
├── app/
│   ├── pages/           # Pages de l'application
│   │   ├── auth/        # Connexion
│   │   ├── feed/        # Feed global
│   │   ├── search/      # Recherche de films
│   │   ├── movie/       # Détail d'un film
│   │   └── profile/     # Profil utilisateur
│   ├── services/        # Services Angular
│   │   ├── auth.service.ts
│   │   ├── tmdb.service.ts
│   │   └── entries.service.ts
│   ├── models/          # Modèles TypeScript
│   └── guards/          # Guards de navigation
├── environments/        # Configuration des environnements
└── assets/             # Ressources statiques
```

## Déploiement

### Web (Vercel)
1. Build de production: `npm run build`
2. Déployer le dossier `www/` sur Vercel

### Mobile

#### Compilation Android (AAB)
1. **Préparation du projet**
   ```bash
   # Synchroniser les changements avec Capacitor
   npm run cap:sync
   
   # Compiler l'application web
   npm run build
   ```

2. **Configuration de la version**
   - Modifier `android/app/build.gradle` :
   ```gradle
   android {
       defaultConfig {
           versionCode 3        // Incrémenter à chaque release
           versionName "1.1.1"  // Version visible par l'utilisateur
       }
   }
   ```

3. **Compilation Android**
   ```bash
   # Aller dans le dossier Android
   cd android
   
   # Nettoyer et compiler (APK + AAB)
   ./gradlew clean assembleRelease bundleRelease
   ```

4. **Fichiers générés**
   - **AAB** : `android/app/build/outputs/bundle/release/app-release.aab`
   - **APK** : `android/app/build/outputs/apk/release/app-release.apk`

5. **Vérification**
   ```bash
   # Vérifier la version
   cat android/app/build/outputs/apk/release/output-metadata.json | grep -E "(versionCode|versionName)"
   
   # Vérifier la taille
   ls -lh android/app/build/outputs/bundle/release/app-release.aab
   ```

6. **Upload sur Google Play Console**
   - Aller sur [Google Play Console](https://play.google.com/console)
   - Sélectionner votre app PopRank
   - **Production** → **Créer une nouvelle version**
   - Uploader le fichier `app-release.aab`
   - Remplir les notes de version (exemple ci-dessous)
   - Publier

#### Notes de version (exemple)
```
Version 1.1.1 - Corrections et améliorations

🔧 Corrections
- Résolution des conflits de dépendances
- Amélioration de la stabilité générale
- Correction des problèmes de compilation

✨ Améliorations
- Ajout de l'indicateur de version dans le profil
- Optimisation des performances
- Interface utilisateur améliorée

📱 Nouveautés
- Meilleure gestion des erreurs
- Expérience utilisateur plus fluide
```

#### Bonnes pratiques
- **versionCode** : Toujours incrémenter (1, 2, 3, ...)
- **versionName** : Format sémantique (1.0.0, 1.1.0, 1.1.1)
- **Test** : Toujours tester l'APK avant de publier l'AAB
- **Notes** : Décrire clairement les changements pour les utilisateurs

#### Compilation iOS
1. Build: `npm run build`
2. Sync: `npm run cap:sync`
3. Ouvrir dans Xcode: `npm run ios`
4. Compiler et uploader via Xcode

#### Test local
1. Build: `npm run build`
2. Sync: `npm run cap:sync`
3. Ouvrir dans Android Studio: `npm run android`
4. Lancer sur émulateur ou appareil connecté

## Licence

MIT
