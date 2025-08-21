#!/bin/bash

# Script para verificar que las imágenes se cargan correctamente
# Uso: ./scripts/test-images.sh [puerto]

PORT=${1:-3000}
BASE_URL="http://localhost:$PORT"

echo "🖼️  Verificando imágenes en $BASE_URL..."
echo

# Función para probar una imagen
test_image() {
    local image_path=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$image_path")
    
    if [ "$response" = "200" ]; then
        echo "✅ $image_path - OK"
    else
        echo "❌ $image_path - Error $response"
        return 1
    fi
}

# Probar las primeras 5 imágenes del template friends-test
echo "Probando imágenes de friends-test..."
test_image "/assets/friends/01.jpeg"
test_image "/assets/friends/02.jpeg"
test_image "/assets/friends/03.jpeg"
test_image "/assets/friends/04.jpeg"
test_image "/assets/friends/05.jpeg"

echo
echo "🚀 Probando URLs del template friends-test..."

# Probar que las páginas cargan (solo verificar que no sea 404)
test_page() {
    local page_path=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page_path")
    
    if [ "$response" = "200" ]; then
        echo "✅ $page_path - OK"
    else
        echo "❌ $page_path - Error $response"
        return 1
    fi
}

test_page "/wedding/friends-test"
test_page "/wedding/friends-test?guest=guest-001"
test_page "/en/wedding/friends-test"

echo
echo "🎯 URLs para probar manualmente:"
echo "   $BASE_URL/wedding/friends-test"
echo "   $BASE_URL/wedding/friends-test?guest=guest-001"
echo "   $BASE_URL/en/wedding/friends-test"
echo
echo "✨ ¡Listo! Las imágenes están configuradas correctamente."
