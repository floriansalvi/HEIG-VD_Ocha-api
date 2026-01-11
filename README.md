# API OCHA 🍵
API REST pour la gestion de matcha shops Ocha, incluant la gestion des utilisateurs, produits, magasins et commandes.

## Description 📗
l'API Ocha constitue le back-end qui sert l'application Vue.js Ocha, chaîne de matcha shops fictive et imaginée par Malory Bossel. Elle permet la gestion des utilisateurs, des magasins, des produits et des commandes. Elle offre des fonctionnalités aux utilisateurs non-enregistrés, aux utilisateurs enregistrés et aux administrateurs.

## Fonctionnalités générales 🏡

### Authentification 🔑
- Enregistrement des utilisateurs par adresse email, nom d'utilisateur, mot de passe et téléphone optionnel
- Connexion des utilisateurs par adresse email et mot de passe
- Authentification par JSON Web Token (JWT) d'une durée de validité de 7 jours
- Rôles `user` et `admin` définissant les actions autorisées
- Hachage des mots de passe avec l'algorithme de hachage bcrypt

## Gestion des ressources 🧩
- **Gestion des comptes utilisateurs** : Création et récupération des profils
- **Gestion des produits** : Création, mise à jour, suppression et récupération des produits
- **Gestion des magasins** : Création, mise à jour, suppression et récupération des magasins
- **Gestion des commandes** : Création de commandes par les utilisateurs, mise à jour du statut

### Statistiques 📈
- Récupération des statistiques de commandes par les administrateurs. Construit par pipeline d'agrégation
    - Nombre totale de commandes par l'utilisateur
    - Identifiant de l'utilisateur
    - Nom d'utilisateur de l'utilisateur
    - Somme totale dépensée par l'utilisateur

### Gestion des images 📸
- Chargement des images de produits sur l'application web sur Cloudinary
- Enregistrement des URLs dans la base de données
- Gestion par une route et un controller dédiés

### Temps réel 🔄
- Gestion du temps réel avec le protocole Websocket et la bibliothèque ws
- Broadcast lors de la création de nouveaux produits
    - type: `new_product`
    - product: `object`

## Stack technique ⚙️
- **Back-end** : Node.js et Express.js
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : JSON Web Tokens (JWT)
- **Hashage des mots de passe** : bcrypt
- **Temps réel** : WebSockets (WS) pour notifier les utilisateurs lors de la création de nouveaux produits
- **Test** : Jest et Supertest
- **Documentation** : OpenAPI (Swagger) et apiDocs

## Installation 🛫

### Prérequis du projet
- **Node.js 18.x ou supérieur** : Utilisation de modules ES
- **MongoDB** : Instance locale ou distante (MongoDB Atlas)
- **Compte Cloudinary** : Pour la gestion des images
- **Images Cloudinary** : Images publiées pour les produits issus des seeders
- **Variables d'environnement** : Fichier `.env` requis pour la configuration
- **Postman** : Conseillé pour tester les différentes routes et le temps réel

### Repository GIT
```bash
git clone https://github.com/floriansalvi/HEIG-VD_Ocha-api.git
cd HEIG-VD_Ocha-api
```
### Installation des dépendances
```bash
npm install
```
### Variables d'environnement (.env)
```env
# Serveur
PORT=5001

# Base de données noSQL
MONGO_URI=mongodb+srv://<username>:<password>@<host>/<database>?<options>

# Hachage
JWT_SECRET=<clé_secrète>

# Cloudinary
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```
### Démarage

**Mode développement**
```bash
npm run dev
```

**Mode production**
```bash
npm run start
```

**Initialisation des données**
```bash
npm run seed:all
```

**Tests automatisés**
```bash
npm run test
```

### Accèder à l'API

**Accès à l'API**
[http://localhost:5001](http://localhost:5001)

**Accès à la documentation de l'API**
[http://localhost:5001/api/v1/api-docs](http://localhost:5001/api/v1/api-docs)
