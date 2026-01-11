# API OCHA 🍵
API REST pour la gestion de matcha shops Ocha, incluant la gestion des utilisateurs, produits, magasins et commandes.

## Sommaire 🛣️
- [Description](#description-)
- [Fonctionnalités générales](#fonctionnalités-générales-)
- [Stack technique](#stack-technique-️)
- [Architecture](#architecture-️)
- [Installation](#installation-)
- [Endpoints](#endpoints-)
- [Sécurité](#sécurité-)
- [Faire une requête](#faire-une-requête-)
- [Filtres et pagination](#filtres-et-pagination-)
- [Problèmes rencontrés](#problèmes-rencontrés-)
- [Utilisation de l'IA](#utilisation-de-lia-)
- [Crédits](#crédits-)

## Description 📗
l'API Ocha constitue le back-end qui sert l'application Vue.js Ocha, chaîne de matcha shops fictive et imaginée par Malory Bossel. Elle permet la gestion des utilisateurs, des magasins, des produits et des commandes. Elle offre des fonctionnalités aux utilisateurs non-enregistrés, aux utilisateurs enregistrés et aux administrateurs.

## Fonctionnalités générales 🏡

### Authentification 🔑
- Enregistrement des utilisateurs par adresse email, nom d'utilisateur, mot de passe et téléphone optionnel
- Connexion des utilisateurs par adresse email et mot de passe
- Authentification par JSON Web Token (JWT) d'une durée de validité de 7 jours
- Rôles `user` et `admin` définissant les actions autorisées
- Hachage des mots de passe avec l'algorithme de hachage bcrypt

### Gestion des ressources 🧩
- **Gestion des comptes utilisateurs** : Création et récupération des profils
- **Gestion des produits** : Création, mise à jour, suppression et récupération des produits
- **Gestion des magasins** : Création, mise à jour, suppression et récupération des magasins
- **Gestion des commandes** : Création de commandes par les utilisateurs, mise à jour du statut

### Statistiques 📈
- Récupération des statistiques de commandes par les administrateurs. Construit par pipeline d'agrégation
    - Nombre total de commandes par l'utilisateur
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

## Architecture 🏗️
```
HEIG-VD_Ocha-api/
├── app.js                              # Point d'entrée
├── bin/
│   └── start.js                        # Serveur et intégration Websocket
├── config/
│   └── cloudinary.js                   # Configuaration de Cloudinary
├── controllers/                        # Contrôleurs
│   └── v1/
│       ├── authController.js
│       ├── orderController.js
│       ├── orderItemController.js
│       ├── orderStatsController.js
│       ├── productController.js
│       └── storeController.js
├── docs
│   └── openapi.yml                     # Documentation
├── middleware/                         # Middlewares
│   ├── adminMiddleware.js              # Vérifie le rôle
│   ├── authMiddleware.js               # Vérifie le Token JWT
│   ├── validateDisplayName.js
│   ├── validateEmail.js
│   ├── validatePassword.js
│   └── validatePhone.js
├── models/                             # Schémas
│   ├── order.js
│   ├── orderItem.js
│   ├── product.js
│   ├── store.js
│   └── user.js
├── routes/                             # Routeurs et définiton des endpoints
│   └── v1/
│       ├── auth.js
│       ├── index.js
│       ├── orders.js
│       ├── orderStats.js
│       ├── products.js
│       ├── stores.js
│       └── users.js
├── seeders/                            # Seeders des magasins et produits
│   ├── seedProducts.js
│   └── seedStores.js
├── tests/                              # Fichiers de test JEST
│   └── helpers/
│   │   ├── auth.helper.js
│   │   ├── cleanup.helper.js
│   │   ├── index.js
│   │   ├── product.helper.js
│   │   └── store.helper.js
│   └── integration/
│   │   ├── order.spec.js
│   │   ├── orderItem.spec.js
│   │   ├── product.spec.js
│   │   └── store.spec.js
│   └── setup/
│   │   └── testDB.js
│   └── unit/
│       └── middlewares.js
│           └── validators.spec.js
├── utils/                              # Fichiers utilitaires
│   ├── errorHandler.js
│   └── generateToken.js
├── jest.config.js
├── package.json
├── README.md
```

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

#### Mode production
```bash
npm run start
```

#### Initialisation des données
```bash
npm run seed:all
```

#### Tests automatisés
```bash
npm run test
```

### Accéder à l'API

- **Accès à l'API** : [http://localhost:5001](http://localhost:5001)
- **Accès à la documentation de l'API** : [http://localhost:5001/api/v1/api-docs](http://localhost:5001/api/v1/api-docs)

## Endpoints 🔀

### Index : `/api/v1`
- `GET /health` : Vérifier que l'API est fonctionnelle

### Authentification : `/api/v1/auth`
- `POST /` : Création d'un compte utilisateur
- `POST /login` : Connexion et récupération du Token JWT

### Users : `/api/v1/users`
- `GET /` : Récupération du profil de l'utilisateur connecté
- `GET /orders` : Récupération de l'historique de commandes de l'utilisateur connecté

### Products : `/api/v1/products`
- `GET /` : Récupération de la liste de produits
- `POST /` : Création d'un produit
- `GET /{productId}` : Récupération d'un produit spécifique
- `PATCH /{productId}` : Modification d'un produit spécifique
- `DELETE /{productId}` : Suppression d'un produit spécifique
- `PUT /{productId}/image` : Ajout/modification de l'image d'un produit spécifique

### Stores : `/api/v1/stores`
- `GET /` : Récupération de la liste de magasins
- `POST /`: Création d'un magasin
- `GET /{storeId}` : Récupération d'un magasin spécifique
- `PATCH /{storeId}` : Modification d'un magasin spécifique
- `DELETE /{storeId}` : Suppression d'un magasin spécifique

### Orders : `/api/v1/orders`
- `POST /` : Création d'une commande
- `GET /{orderId}` : Récupération d'une commande spécifique
- `PATCH /{orderId}` : Modification d'une commande spécifique
- `DELETE /{orderId}` : Suppression d'une commande spécifique
- `GET /{orderId}/items` : Récupération de produits d'une commande spécifique

### Order stats : `/api/v1/order-stats`
- `GET /` : Récupération des statistiques de commandes

## Sécurité 🚔
Certains endpoints sont protégés par des middlewares :
- `authMiddleware.js` : Uniquement accessibles aux utilisateurs connectés
- `adminMiddleware.js` : Uniquement accessibles aux utilisateurs ayant le `admin`

## Faire une requête 🛜

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Body
```
Body: {
    …voir la documentation
}
```
### Codes de status HTTP pouvant être rencontrés 🛜
- **200 OK** : Requête réussie (ressource retournée).
- **201 Created** : Ressource créée avec succès (ressource retournée).
- **204 No Content** : Ressource supprimée avec succès.
- **400 Bad Request** : Requête invalide ou mal formée.
- **401 Unauthorized** : Authentification requise ou invalide.
- **403 Forbidden** : Accès refusé, rôle admin requis.
- **404 Not Found** : Ressource non trouvée.
- **409 Conflict** : Conflit lors de la création ou mise à jour d'une ressource.
- **422 Unprocessable Entity** : Erreur de validation des données.
- **500 Internal Server Error** : Erreur côté serveur.

## Filtres et pagination 🔬
Certains endpoints permettent la récupération de ressources filtrées ou paginées.

### Pagination
Fonctionne avec : `GET …/api/v1/users/orders`, `GET …/api/v1/products` et `GET …/api/v1/products`. Sans précision, `page=1` et `limit=10`.

```
…/api/v1/products?page=1&limit=2
```

### Produits actifs (combinable avec la pagination)
Fonctionne avec : `GET …/api/v1/products`. Sans précision, `active=false`.

```
…/api/v1/products?active=true
```

ou

```
…/api/v1/products?active=true&page=2&limit=3
```

### Magasins géolocalisés
Fonctionne avec : `GET …/api/v1/stores`.`radius=` n'est pas nécessaire mais, sa valeur de base est de 10'000m.

```
…/api/v1/stores?near=6.9319,46.9933&radius=5000
```

## Problèmes rencontrés 🚧

### Tests
- **Description** : Les tests ont été réalisés avant la validation du reste du projet. Lorsque le projet à été terminé, la majorité des tests n'étaient plus valides.
- **Solution** : Nous avons dû recommencer les tests. Nous avons notamment utilisé des outils d'IA pour nous y aider.

### Oublis de d'attributs dans les schémas
- **Description** : Certains attributs définis entre nous ont été oubliés lors de l'implémentation des schémas. Nous nous en sommes rendus compte tardivement.
- **Solution** : Des schémas et certains contrôleurs ont dû être refactorisés, afin de répondre aux attentes de l'application web.

### Mise en place du temps réel
- **Description** : Cet aspect du projet a été homis jusqu'au jour du rendu. Nous avons dû trouver une solution rapide à mettre en place.
- **Solution** : Utilisation de la librairie `ws`. `broadcast` uniquement sur une seule route.

### Gestion des erreurs
- **Description** : La gestion des erreurs n'a pas été la meilleure au sein de ce projet. Certains codes HTTP n'étaient pas justes ou manquants. Les messages ne sont pas renvoyés dans les réponses aux requêtes et aucun logs n'est fait. 
- **Solution** : Un temps considérable a été aloué à l'analyse de chaque route et chaque méthodes des contrôleurs afin de corriger cela. Ensuite, la documentation a dû être adaptée. Pour le prochain projet, il sera impératif de réfléchir à une solution avant le début de l'implémentation.

### Validation
- **Description** : La validation de certaines données transmises a été faite de manière éparse. Certaines valeurs sont validées grâce à des middlewares, d'autres grâce aux contrôleurs, certaines à double. D'autres valeurs ne sont vérifées que par Mongoose, via les schémas mais, cela résulte en erreurs Mongoose (gérées par /utils/errorHandler.js). Certains validators ne sont utilisés que sur certaines ressources. Par ex: validateMail.js est utilisé pour valider les adresses emails des utilisateurs mais, pas des magasins.
- **Solution** : Au final, tout fonctionne mais, c'est un mélange de solutions disparates.

### Routes manquantes
- **Description** : Toutes les routes nécessaires à notre projet ont été implémentées. Cependant, des routes basiques telles que `DELETE …/api/v1/users` ou `PATCH …/api/v1/users` n'ont pas été implémentées. En ce qui concerne le rôle `admin`, seul un échantillon de routes a été implémenté.
- **Solution** : Cela convient à notre projet mais, ce sera un point de vigilance pour les travaux futurs.

### Documentation
- **Description** : Peu de connaissances par rapport à `openapi`. Le fichier a dû être rempli à la main et n'est pas optimisé. Il fait plus de 2300 lignes.
- **Solution** : Beaucoup de temps y a été dédié et des outils d'IA ont été utilisés.

## Utilisation de l'IA 🧠
Afin de mener à bien ce projet, nous avons parfois eu recours à l'utilisation d'outils d'intelligence artificielle (Claude & Copilot). Nous avons les avons utilisés de manière intelligente, en les considérant comme outils d'accompagnement et de debugging et sans les utiliser pour rédiger des fichiers entiers.

### Où nous a-t-elle aidé ?
- **Commentaires** : Sur une base de nos commentaires puis, ajustés et corrigés.
- **Tests** : Certains tests disfonctionnels ont été corrigés par IA.
- **Debugging** : Lorsque nos connaissances et la documentation ne suffisaient pas.
- **Intégration** d'outils récemment découvertes (Cloudinary et ws)

## Crédits 👥
Ce travail a été réalisé durant les cours d'Architecture Orientéee Web et de Développement Mobile lors du cinquième semestre du Bachelor of Science en Ingénierie des Médias à la HEIG-VD.

_Ce README a été entièrement rédigé à la main_ 🌟

### Équipe
- **Cristian Pottier** : Responsable front-end
- **Emma Chautems** : Design et aide fullstack
- **Florian Salvi** : Responsable back-end - [Me contacter](mailto:florian.salvi@hes-so.ch)
- **Malory Bossel** : Design et aide fullstack