# Miya Sushi

Application web complete pour un restaurant de sushi, construite avec Laravel 11, React 18 et Vite.

Le projet reprend un frontend premium de restaurant japonais et le transforme en application complete avec :

- backend Laravel reel
- base de donnees relationnelle
- authentification client et admin
- gestion des commandes
- tableau de bord administrateur
- CRUD produits et categories
- tests fonctionnels
- configuration prete pour un deploiement

## Sommaire

- [Apercu](#apercu)
- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Pre-requis](#pre-requis)
- [Installation depuis zero](#installation-depuis-zero)
- [Configuration de la base de donnees](#configuration-de-la-base-de-donnees)
- [Lancer le projet en local](#lancer-le-projet-en-local)
- [Comptes de demonstration](#comptes-de-demonstration)
- [Commandes utiles](#commandes-utiles)
- [Tests](#tests)
- [Routes API principales](#routes-api-principales)
- [Deploiement](#deploiement)
- [Checklist avant mise en production](#checklist-avant-mise-en-production)
- [Depannage](#depannage)

## Apercu

Le site "Miya Sushi" permet :

- d'afficher une page d'accueil premium
- de consulter la carte par categories
- de creer un compte client
- de se connecter et commander
- de choisir livraison ou retrait sur place
- de suivre ses commandes
- de gerer les commandes, produits et categories depuis un espace admin

Le projet utilise une SPA React servie par Laravel, avec authentification Sanctum en mode cookie/session.

## Fonctionnalites

### Cote visiteur

- page d'accueil avec hero section
- navigation vers le menu
- consultation des produits par categories
- affichage des produits "Nouveau"

### Cote client

- inscription
- connexion / deconnexion
- panier frontend
- ajout, retrait et modification des quantites
- choix du mode :
  - livraison
  - takeaway
- adresse obligatoire en cas de livraison
- ajout de commentaires
- creation de commande en base
- consultation de "Mes Commandes"
- suivi des statuts de commande

### Cote administrateur

- connexion admin
- tableau de bord avec statistiques
- consultation de toutes les commandes
- acceptation ou refus des commandes
- gestion complete des produits
- gestion complete des categories
- activation / desactivation d'un produit

## Stack technique

- PHP 8.2+
- Laravel 11
- React 18
- Vite 6
- Laravel Sanctum
- MySQL par defaut
- SQLite possible pour certains tests ou usages locaux

## Architecture du projet

### Backend Laravel

- `app/Enums`
  - roles utilisateur
  - statuts de commande
  - types de livraison
- `app/Http/Controllers/Api`
  - endpoints publics
  - endpoints clients
  - endpoints admin
- `app/Http/Requests`
  - validation centralisee
- `app/Http/Resources`
  - reponses JSON structurees
- `app/Policies`
  - autorisations sur les commandes
- `app/Services/OrderService.php`
  - logique metier de creation de commande
- `database/migrations`
  - structure SQL complete
- `database/seeders`
  - donnees de demo

### Frontend React

- `resources/js/app.jsx`
  - point d'entree Vite
- `resources/js/MiyaSushiApp.jsx`
  - composant principal de l'application
- `resources/js/components`
  - composants UI du site
- `resources/js/lib/api.js`
  - appels API Axios
- `resources/css/app.css`
  - styles principaux
- `resources/views/app.blade.php`
  - shell Blade qui charge la SPA

### Utilitaires

- `start-built.bat`
  - lancement rapide Windows en mode build
- `start-dev.bat`
  - lancement rapide Windows en mode developpement
- `LOCAL-LAUNCH.md`
  - aide rapide pour l'execution locale
- `scripts/record-demo.mjs`
  - script optionnel pour enregistrer une video de demonstration

## Pre-requis

Avant de lancer le projet, il faut disposer de :

- PHP 8.2 ou plus recent
- Composer
- Node.js 20+ et npm
- MySQL 8+ ou MariaDB

Option Windows / XAMPP :

- PHP peut etre lance avec `C:\xampp\php\php.exe`
- MySQL peut etre fourni par XAMPP

## Installation depuis zero

### 1. Cloner le projet

```bash
git clone <url-du-depot>
cd Application_web_suchi_store
```

### 2. Installer les dependances backend

```bash
composer install
```

### 3. Installer les dependances frontend

```bash
npm install
```

### 4. Creer le fichier d'environnement

Sous Linux / macOS :

```bash
cp .env.example .env
```

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

### 5. Generer la cle d'application

```bash
php artisan key:generate
```

### 6. Configurer la base de donnees

Modifier `.env` avec vos informations MySQL.

Exemple :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=miya_sushi
DB_USERNAME=root
DB_PASSWORD=
```

### 7. Creer les tables et les donnees de demo

```bash
php artisan migrate --seed
```

### 8. Creer le lien symbolique du stockage public

```bash
php artisan storage:link
```

### 9. Construire les assets frontend

```bash
npm run build
```

### 10. Lancer le serveur Laravel

```bash
php artisan serve
```

Puis ouvrir :

- `http://127.0.0.1:8000`

## Configuration de la base de donnees

### Option recommandee : MySQL

Le projet est pense en priorite pour MySQL.

Exemple `.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=miya_sushi
DB_USERNAME=root
DB_PASSWORD=
```

### Option alternative : SQLite

Pour un usage local simple :

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

Puis creer le fichier SQLite si besoin :

```bash
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
```

## Lancer le projet en local

### Methode classique

Terminal 1 :

```bash
php artisan serve
```

Terminal 2 pour le mode dev frontend :

```bash
npm run dev
```

Puis ouvrir :

- `http://127.0.0.1:8000`

### Mode build stable

Si vous voulez tester la version build :

```bash
npm run build
php artisan serve
```

### Lancement rapide Windows

Version build :

```bat
start-built.bat
```

Version dev :

```bat
start-dev.bat
```

## Comptes de demonstration

### Administrateur

- email : `admin@gmail.com`
- mot de passe : `123`

### Client

- email : `client@gmail.com`
- mot de passe : `12345678`

Important :

- changez immediatement le mot de passe admin en production

## Commandes utiles

Reinitialiser totalement la base :

```bash
php artisan migrate:fresh --seed
```

Nettoyer les caches Laravel :

```bash
php artisan optimize:clear
```

Recreer le lien storage :

```bash
php artisan storage:link
```

Compiler le frontend :

```bash
npm run build
```

Mode developpement frontend :

```bash
npm run dev
```

## Tests

La suite de tests couvre les flux critiques suivants :

1. inscription client
2. connexion client
3. connexion admin
4. listing public des produits
5. creation d'une commande
6. protection contre les faux prix frontend
7. interdiction d'acces a la commande d'un autre client
8. listing admin de toutes les commandes
9. acceptation admin d'une commande
10. refus admin d'une commande
11. refus d'acces admin pour un utilisateur non admin

Lancer les tests :

```bash
php artisan test
```

## Routes API principales

### Public

- `GET /api/products`
- `GET /api/products?category=menu`
- `GET /api/products?category=specialty`
- `GET /api/products?category=new`
- `GET /api/categories`
- `POST /api/register`
- `POST /api/login`

### Authentifie

- `POST /api/logout`
- `GET /api/me`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/{order}`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/orders`
- `GET /api/admin/orders/{order}`
- `PATCH /api/admin/orders/{order}/accept`
- `PATCH /api/admin/orders/{order}/reject`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/products/{product}`
- `PUT /api/admin/products/{product}`
- `DELETE /api/admin/products/{product}`
- `PATCH /api/admin/products/{product}/toggle-availability`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{category}`
- `DELETE /api/admin/categories/{category}`

## Deploiement

Le projet est pret pour un deploiement sur :

- VPS Ubuntu + Nginx
- VPS Ubuntu + Apache
- hebergement mutualise compatible Laravel
- environnement avec MySQL et execution de commandes Composer / Artisan

### Fichier d'environnement de production

Un modele existe deja :

- `.env.production.example`

Procedure recommandee :

```bash
cp .env.production.example .env
php artisan key:generate
```

### Variables importantes en production

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://votre-domaine.com`
- `DB_CONNECTION=mysql`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SESSION_DOMAIN`
- `SANCTUM_STATEFUL_DOMAINS`
- `CORS_ALLOWED_ORIGINS`

### Commandes de deploiement

Depuis un serveur propre :

```bash
composer install --no-dev --optimize-autoloader
npm install
npm run build
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Configuration serveur

Verifier que :

- le document root pointe vers `public/`
- `storage/` est inscriptible
- `bootstrap/cache/` est inscriptible
- HTTPS est actif
- MySQL est disponible

### Si vous utilisez des cookies de session et Sanctum

Verifier la coherence de :

- `APP_URL`
- `SESSION_DOMAIN`
- `SESSION_SECURE_COOKIE`
- `SANCTUM_STATEFUL_DOMAINS`
- `CORS_ALLOWED_ORIGINS`

### Deployment checklist

1. creer la base MySQL
2. renseigner `.env`
3. lancer `composer install --no-dev --optimize-autoloader`
4. lancer `npm install`
5. lancer `npm run build`
6. lancer `php artisan migrate --force`
7. lancer `php artisan db:seed --force`
8. lancer `php artisan storage:link`
9. lancer `php artisan config:cache`
10. lancer `php artisan route:cache`
11. lancer `php artisan view:cache`
12. verifier le document root `public/`
13. changer le mot de passe admin par defaut

## Checklist avant mise en production

Avant d'envoyer le projet chez un client ou en production, verifier :

- le mot de passe admin a ete change
- les comptes de demo sont supprimes ou modifies si necessaire
- `APP_DEBUG=false`
- les identifiants MySQL de production sont corrects
- le stockage public fonctionne
- la connexion / inscription fonctionnent sur le vrai domaine
- la creation de commande fonctionne
- l'admin peut accepter et refuser une commande
- les assets frontend sont bien construits

## Depannage

### `CSRF token mismatch`

Verifier :

- que le domaine local utilise est bien celui configure
- que les cookies du navigateur sont propres
- que Sanctum et la session utilisent les bons domaines

### `Unauthenticated`

Verifier :

- que l'utilisateur est bien connecte
- que le cookie de session est present
- que l'URL du front et de l'API est coherente

### `Database file does not exist`

Si vous utilisez SQLite :

```bash
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
```

### `Class ... not found`

```bash
composer dump-autoload
```

### Les images uploades ne s'affichent pas

```bash
php artisan storage:link
```

### Le front Vite ne charge pas

```bash
npm install
npm run dev
```

## Resume

Vous avez ici une application complete de restaurant sushi avec :

- frontend React integre dans Laravel
- backend Laravel structure
- authentification client / admin
- gestion de commandes
- panneau admin
- tests
- base de donnees
- documentation de lancement et de deploiement

Le projet peut etre lance localement, teste rapidement, puis deploye sur un hebergement standard Laravel/MySQL.
