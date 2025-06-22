
# Configuration Supabase Local

Ce projet est maintenant configuré pour fonctionner avec Supabase en local via Docker.

## Prérequis

- Docker Desktop installé et en cours d'exécution
- Supabase CLI installé (version 2.26.9+)

## Démarrage rapide

### 1. Première installation
```bash
# Rendre les scripts exécutables
chmod +x scripts/start-local.sh
chmod +x scripts/stop-local.sh

# Démarrer Supabase en local
./scripts/start-local.sh
```

### 2. Démarrage quotidien
```bash
# Démarrer Supabase
supabase start

# Démarrer votre application React
npm run dev
```

## URLs importantes

- **Application React** : http://localhost:5173
- **Supabase Studio** : http://127.0.0.1:54323
- **API Supabase** : http://127.0.0.1:54321
- **Base de données** : postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Emails (Inbucket)** : http://127.0.0.1:54324

## Commandes utiles

```bash
# Démarrer Supabase
supabase start

# Arrêter Supabase
supabase stop

# Voir le statut
supabase status

# Voir les logs
supabase logs

# Réinitialiser la base de données (supprime toutes les données)
supabase db reset

# Appliquer les migrations
supabase db push

# Créer une nouvelle migration
supabase migration new nom_de_la_migration
```

## Données de test

Le fichier `supabase/seed.sql` contient des données de test qui sont automatiquement chargées au démarrage.

## Basculer entre local et production

L'application détecte automatiquement si elle fonctionne en local ou en production :
- **Local** : utilise http://127.0.0.1:54321
- **Production** : utilise votre instance Supabase cloud

## Résolution des problèmes

### Docker n'est pas en cours d'exécution
```bash
# Démarrer Docker Desktop
```

### Port déjà utilisé
```bash
# Vérifier les ports utilisés
supabase status

# Arrêter et redémarrer
supabase stop
supabase start
```

### Base de données corrompue
```bash
# Réinitialiser complètement
supabase stop
supabase db reset
supabase start
```
