# 🚀 Dashboard de Balancetes - Versão Supabase

Dashboard interativo para visualização e comparação de balancetes financeiros com backend Supabase.

## ✨ **CARACTERÍSTICAS**

- 📊 **Visualizações interativas** - Gráficos e tabelas dinâmicas
- 📤 **Upload de planilhas** - Suporte a Excel (.xlsx, .xls) e CSV
- 🔄 **Comparação entre clientes** - Análise comparativa avançada
- 🌐 **Backend Supabase** - Banco de dados real e confiável
- 📱 **Interface responsiva** - Funciona em desktop e mobile
- 🎯 **Modo Demo** - Teste sem configurar banco de dados

---

## 🚀 **INÍCIO RÁPIDO**

### 1. **Modo Demo (Teste Imediato)**
```bash
# Configurar modo demo
./configure.sh
# Escolha opção 1

# Executar
pnpm run dev
```

### 2. **Modo Supabase (Produção)**
```bash
# 1. Configure o Supabase (veja CONFIGURACAO_SUPABASE.md)
# 2. Edite o arquivo .env com suas credenciais
# 3. Configure o projeto
./configure.sh
# Escolha opção 2

# 4. Executar
pnpm run dev
```

---

## 📁 **ESTRUTURA DO PROJETO**

```
dashboard-supabase/
├── src/
│   ├── components/          # Componentes React
│   ├── services/
│   │   ├── supabase.js      # Serviço demo (dados locais)
│   │   ├── supabase-real.js # Serviço Supabase real
│   │   └── supabase-active.js # Serviço ativo (configurado)
│   └── App.jsx              # Componente principal
├── configure.sh             # Script de configuração
├── .env.example            # Exemplo de variáveis de ambiente
└── CONFIGURACAO_SUPABASE.md # Guia completo do Supabase
```

---

## ⚙️ **CONFIGURAÇÃO**

### **Opção 1: Modo Demo**
- ✅ **Sem configuração** necessária
- ✅ **Dados simulados** localmente
- ✅ **Ideal para testes** e demonstrações
- ❌ **Dados não persistem** entre sessões

### **Opção 2: Modo Supabase**
- ✅ **Banco de dados real** e persistente
- ✅ **Upload funcional** de planilhas
- ✅ **Múltiplos usuários** simultâneos
- ✅ **Pronto para produção**
- ⚙️ **Requer configuração** do Supabase

---

## 🔧 **COMANDOS DISPONÍVEIS**

```bash
# Configurar modo de operação
./configure.sh

# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm run dev

# Fazer build para produção
pnpm run build

# Visualizar build local
pnpm run preview
```

---

## 📊 **FUNCIONALIDADES**

### **Upload e Processamento**
- 📤 **Drag & Drop** de arquivos Excel/CSV
- 🔄 **Processamento automático** de dados
- 📋 **Validação** de formato e estrutura
- 💾 **Armazenamento** no Supabase

### **Visualizações**
- 📈 **Gráficos temporais** (receitas, despesas, saldos)
- 🥧 **Gráficos de pizza** por categoria
- 📊 **Cards de resumo** com indicadores
- 📋 **Tabelas detalhadas** com filtros

### **Comparações**
- 🔍 **Até 4 clientes** simultaneamente
- 📊 **Gráficos comparativos** lado a lado
- 📈 **Análise de tendências** mensais
- 🎯 **Indicadores visuais** de performance

---

## 🌐 **DEPLOY**

### **Preparar para Deploy**
```bash
# 1. Configurar modo Supabase
./configure.sh

# 2. Fazer build
pnpm run build

# 3. Testar build
pnpm run preview
```

### **Opções de Deploy**
- **Vercel** - Recomendado para React
- **Netlify** - Alternativa popular
- **Supabase Hosting** - Integração nativa
- **Servidor próprio** - Máximo controle

---

## 🔒 **SEGURANÇA**

### **Variáveis de Ambiente**
- ✅ **Nunca commite** o arquivo `.env`
- ✅ **Use apenas** a chave `anon` pública
- ✅ **Configure RLS** no Supabase
- ✅ **Valide dados** no frontend

### **Supabase Security**
- ✅ **Row Level Security** habilitado
- ✅ **Políticas de acesso** configuradas
- ✅ **Backup automático** ativo
- ✅ **Monitoramento** de uso

---

## 🆘 **SUPORTE**

### **Problemas Comuns**

#### ❌ **"Erro de conexão com Supabase"**
- Verifique as credenciais no `.env`
- Confirme se o projeto Supabase está ativo
- Execute `./configure.sh` novamente

#### ❌ **"Upload não funciona"**
- Verifique se está no modo Supabase
- Confirme se as tabelas foram criadas
- Veja logs no console do navegador

#### ❌ **"Dados não aparecem"**
- Verifique se o cliente foi selecionado
- Confirme se há dados na tabela `balancetes`
- Teste com dados de demonstração

### **Logs e Debug**
```bash
# Ver logs do desenvolvimento
pnpm run dev

# Verificar build
pnpm run build

# Testar conexão (no console do navegador)
supabaseService.testConnection()
```

---

## 📚 **DOCUMENTAÇÃO**

- 📖 **[CONFIGURACAO_SUPABASE.md](./CONFIGURACAO_SUPABASE.md)** - Guia completo do Supabase
- 🔧 **[configure.sh](./configure.sh)** - Script de configuração
- 📝 **[.env.example](./.env.example)** - Exemplo de variáveis

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Configure o Supabase** seguindo o guia
2. **Teste no modo demo** primeiro
3. **Configure suas credenciais** no `.env`
4. **Ative o modo Supabase** com `./configure.sh`
5. **Faça deploy** da aplicação
6. **Compartilhe** com seus clientes

---

**🚀 Pronto para transformar seus balancetes em dashboards profissionais!**

