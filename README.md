# Pyrite 💧

**La plateforme vidéo, au calme.** Une plateforme de partage vidéo type YouTube,
privée et sur invitation, construite avec **Spring Boot** (API REST) et **React** (Vite).

Un compte **administrateur** par défaut est créé au premier démarrage. Lui seul peut :

- **créer les comptes** des autres membres (aucune inscription publique) ;
- **mettre en ligne des vidéos**.

Les membres invités peuvent regarder les vidéos, les aimer et commenter.

---

## Stack

| Côté | Technos |
|------|---------|
| Backend | Spring Boot 3.5, Spring Security + JWT (jjwt), Spring Data JPA, MariaDB 10.11, Java 17 |
| Frontend | React 19, React Router 7, Vite |

Le stockage des fichiers vidéo/miniatures se fait sur disque (`backend/media/`),
servi en streaming avec support des requêtes **HTTP Range** (lecture + seek).

---

## Démarrage

### 0. Base de données MariaDB 10.11

Créez la base et l'utilisateur (une seule fois) :

```sql
CREATE DATABASE IF NOT EXISTS pyrite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'pyrite'@'localhost' IDENTIFIED BY 'pyrite';
GRANT ALL PRIVILEGES ON pyrite.* TO 'pyrite'@'localhost';
FLUSH PRIVILEGES;
```

Les identifiants/URL se configurent dans
[`application.properties`](backend/src/main/resources/application.properties)
(`spring.datasource.*`). Les tables sont créées automatiquement au démarrage
(`ddl-auto=update`).

### 1. Backend (port **8090**)

```bash
cd backend
./mvnw spring-boot:run
```

Au premier lancement, le compte admin est créé et affiché dans les logs :

```
 Pyrite — compte administrateur créé
   identifiant : dioptase
   e-mail      : admin@pyrite.tv
   mot de passe: pyrite-admin
```

> Modifiez ces valeurs (et le secret JWT) dans
> [`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties)
> avant toute mise en production.

### 2. Frontend (port **5173**)

```bash
cd frontend
npm install   # une seule fois
npm run dev
```

Ouvrez **http://localhost:5173** et connectez-vous avec `dioptase` / `pyrite-admin`.
Vite proxifie automatiquement `/api/*` vers le backend (port 8090).

---

## Fonctionnalités

- 🔐 **Connexion JWT** (identifiant **ou** e-mail), accès réservé aux membres invités.
- 👑 **Espace admin** : création/suppression de membres, mise en ligne de vidéos.
- 📤 **Upload** (admin uniquement) avec miniature, catégorie, mots-clés, détection
  automatique de la durée, barre de progression et option « à la une ».
- 🏠 **Fil d'accueil** avec chips de catégories et recherche.
- ▶️ **Page de lecture** : player HTML5, like, commentaires, vidéos suggérées.
- 📺 **Page chaîne** : bannière, vidéo à la une, onglets, grille des vidéos.
- 🌗 **Thème clair / sombre** et design « eaux calmes » fidèle aux maquettes.

---

## API (résumé)

| Méthode | Route | Accès |
|--------|-------|-------|
| `POST` | `/api/auth/login` | public |
| `GET`  | `/api/auth/me` | connecté |
| `GET`  | `/api/videos` | public (fil + vidéo à la une) |
| `GET`  | `/api/videos/{id}` | public |
| `POST` | `/api/videos` | **admin** (multipart) |
| `PATCH`/`DELETE` | `/api/videos/{id}` | **admin** |
| `POST` | `/api/videos/{id}/view` · `/like` | public / connecté |
| `GET`/`POST`/`DELETE` | `/api/videos/{id}/comments` | connecté |
| `GET`/`POST`/`PATCH`/`DELETE` | `/api/users` | **admin** |
| `GET`  | `/api/users/{id}` | connecté (profil public) |
| `GET`  | `/api/media/{fichier}` | public (streaming Range) |

---

## Build de production

```bash
cd frontend && npm run build      # génère frontend/dist/
cd backend  && ./mvnw package     # génère backend/target/pyrite-*.jar
```

Les médias sont stockés sur disque (`backend/media/`, ignoré par git) **ou sur
Amazon S3** selon `pyrite.storage.type`. Les données applicatives sont persistées
dans MariaDB (base `pyrite`).

### Stockage des vidéos sur Amazon S3 (optionnel)

Par défaut (`pyrite.storage.type=local`) les vidéos sont sur le disque local. Pour
les héberger sur S3 et les **lire directement depuis S3 via URLs présignées**
(le flux ne transite plus par le serveur — idéal au-delà de quelques dizaines de
spectateurs simultanés), passez en mode `s3` :

```properties
pyrite.storage.type=s3
```

et fournissez la configuration du bucket (idéalement via variables d'environnement) :

| Propriété | Variable d'env | Exemple |
|-----------|----------------|---------|
| `pyrite.s3.bucket` | `PYRITE_S3_BUCKET` | `pyrite-media-prod` |
| `pyrite.s3.region` | `PYRITE_S3_REGION` | `eu-west-3` |
| `pyrite.s3.access-key` | `PYRITE_S3_ACCESS_KEY` | *(ou laisser vide)* |
| `pyrite.s3.secret-key` | `PYRITE_S3_SECRET_KEY` | *(ou laisser vide)* |
| `pyrite.s3.presign-minutes` | `PYRITE_S3_PRESIGN_MINUTES` | `360` (durée de validité des liens) |

Si `access-key`/`secret-key` sont vides, la **chaîne de credentials AWS par défaut**
est utilisée (variables d'env, `~/.aws/credentials`, ou rôle IAM en production).

Le bucket peut rester **privé** : l'application génère une URL présignée à chaque
lecture. Bucket conseillé en privé + (optionnel) **CloudFront** devant pour le cache/CDN.
S3 gère nativement les requêtes HTTP Range, donc le *seek* dans la vidéo fonctionne.
