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
1. Build: `npm run build`
2. Sync: `npm run cap:sync`
3. Ouvrir dans Xcode/Android Studio: `npm run ios` / `npm run android`

## Licence

MIT
