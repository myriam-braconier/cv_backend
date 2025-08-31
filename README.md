## Concrete Vibes API
- une API REST basée sur les données scrapées du site https://wwww.synthetiseur.net
- Cette version de l'API expose les données des constructeurs de synthetiseurs Kawai, Korg et Roland

### Stack
- Node js et le framework Express en ES6
- - ORM : Sequelize
  - 
### Système de gestion de base de données 
- J'ai choisi un modèle relationnel mySql pour cette première version de l'API
### Scraping
- En Python avec Scrapy, framework de scraping et web crawling

### Déploiement
- Railway
- Hébergement de la base de données : AWS (via MysqlWorkbench)

### janvier 2025

Flux :
Charger l’utilisateur avec son rôle et permissions à la connexion.

Construire un tableau de permissions (ex: ["read", "write"]).

Passer ce tableau dans generateToken pour l’inclure dans le JWT.

Dans le middleware d’authentification, récupérer ces permissions depuis le token et les mettre dans req.user.permissions.

