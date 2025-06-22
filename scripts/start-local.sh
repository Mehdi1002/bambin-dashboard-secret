
#!/bin/bash

# Script pour démarrer Supabase en local
echo "🚀 Démarrage de Supabase en local..."

# Vérifier si Supabase est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker d'abord."
    exit 1
fi

# Démarrer Supabase
echo "📦 Démarrage des services Supabase avec Docker..."
supabase start

echo "✅ Supabase est maintenant disponible en local !"
echo ""
echo "🔗 URLs importantes :"
echo "   - API: http://127.0.0.1:54321"
echo "   - Studio: http://127.0.0.1:54323"
echo "   - Base de données: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo "   - Inbucket (emails): http://127.0.0.1:54324"
echo ""
echo "📋 Pour arrêter Supabase : supabase stop"
echo "📋 Pour voir les logs : supabase logs"
echo "📋 Pour réinitialiser : supabase db reset"
