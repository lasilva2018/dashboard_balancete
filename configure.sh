#!/bin/bash

echo "🔧 Configurador do Dashboard de Balancetes"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório do projeto dashboard-supabase"
    exit 1
fi

echo "Escolha o modo de operação:"
echo "1) Modo Demo (dados locais simulados)"
echo "2) Modo Supabase (banco de dados real)"
echo ""

read -p "Digite sua escolha (1 ou 2): " choice

case $choice in
    1)
        echo "📝 Configurando modo Demo..."
        
        # Usar serviço demo
        cp src/services/supabase.js src/services/supabase-active.js
        
        echo "✅ Modo Demo configurado!"
        echo "   - Dados simulados localmente"
        echo "   - Não precisa configurar Supabase"
        echo "   - Ideal para testes e demonstrações"
        ;;
        
    2)
        echo "📝 Configurando modo Supabase..."
        
        # Verificar se existe arquivo .env
        if [ ! -f ".env" ]; then
            echo "⚠️  Arquivo .env não encontrado!"
            echo "   Criando arquivo .env a partir do exemplo..."
            cp .env.example .env
            echo ""
            echo "📋 AÇÃO NECESSÁRIA:"
            echo "   1. Edite o arquivo .env com suas credenciais do Supabase"
            echo "   2. Execute este script novamente"
            echo ""
            echo "   Exemplo de como editar:"
            echo "   VITE_SUPABASE_URL=https://seu-project-id.supabase.co"
            echo "   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui"
            exit 1
        fi
        
        # Verificar se as variáveis estão configuradas
        source .env
        if [[ "$VITE_SUPABASE_URL" == *"SEU-PROJECT-ID"* ]] || [[ "$VITE_SUPABASE_ANON_KEY" == *"SUA-CHAVE"* ]]; then
            echo "❌ Credenciais do Supabase não configuradas!"
            echo "   Edite o arquivo .env com suas credenciais reais"
            echo "   Depois execute este script novamente"
            exit 1
        fi
        
        # Usar serviço real do Supabase
        cp src/services/supabase-real.js src/services/supabase-active.js
        
        echo "✅ Modo Supabase configurado!"
        echo "   - Conectado ao banco de dados real"
        echo "   - Upload e dados persistentes"
        echo "   - Pronto para produção"
        ;;
        
    *)
        echo "❌ Opção inválida. Execute o script novamente."
        exit 1
        ;;
esac

echo ""
echo "🚀 Próximos passos:"
echo "   1. Execute: pnpm run build"
echo "   2. Execute: pnpm run preview (para testar)"
echo "   3. Faça deploy da aplicação"
echo ""
echo "✨ Configuração concluída!"

