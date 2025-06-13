import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase (usando projeto público de demonstração)
const supabaseUrl = 'https://xyzcompany.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjkxNzU0NCwiZXhwIjoxOTYyNDkzNTQ0fQ.LqfqN1AQNlTBi4YVx6YtRd4d-geJ5Q7mAhWv4PNNtRk'

// Para demonstração, vamos usar dados locais simulando Supabase
class MockSupabaseService {
  constructor() {
    this.clients = []
    this.balancetes = {}
    this.initDemoData()
  }

  initDemoData() {
    // Dados de demonstração
    const demoClient = {
      id: 'demo-client-1',
      nome: 'Condomínio Quali Residencial Bonfim Paulista',
      empresa: 'Empresa Administradora Demo',
      periodo: 'Janeiro a Dezembro 2024',
      created_at: new Date().toISOString()
    }

    const demoBalancete = {
      client_id: 'demo-client-1',
      receitas: {
        'Janeiro': 15000,
        'Fevereiro': 16000,
        'Março': 15500,
        'Abril': 16500,
        'Maio': 17000,
        'Junho': 16800,
        'Julho': 17200,
        'Agosto': 16900,
        'Setembro': 17500,
        'Outubro': 18000,
        'Novembro': 17800,
        'Dezembro': 18200
      },
      despesas: {
        'Janeiro': 12000,
        'Fevereiro': 13000,
        'Março': 12500,
        'Abril': 13500,
        'Maio': 14000,
        'Junho': 13800,
        'Julho': 14200,
        'Agosto': 13900,
        'Setembro': 14500,
        'Outubro': 15000,
        'Novembro': 14800,
        'Dezembro': 15200
      },
      saldos: {
        'Janeiro': 3000,
        'Fevereiro': 3000,
        'Março': 3000,
        'Abril': 3000,
        'Maio': 3000,
        'Junho': 3000,
        'Julho': 3000,
        'Agosto': 3000,
        'Setembro': 3000,
        'Outubro': 3000,
        'Novembro': 3000,
        'Dezembro': 3000
      },
      categorias: {
        receitas: {
          'Taxa de Condomínio': 120000,
          'Multas e Juros': 15000,
          'Outras Receitas': 5000
        },
        despesas: {
          'Manutenção': 80000,
          'Limpeza': 30000,
          'Segurança': 25000,
          'Administração': 15000,
          'Outras Despesas': 10000
        }
      }
    }

    this.clients.push(demoClient)
    this.balancetes[demoClient.id] = demoBalancete
  }

  // Simular métodos do Supabase
  async getClients() {
    return {
      data: this.clients,
      error: null
    }
  }

  async getBalancete(clientId) {
    return {
      data: this.balancetes[clientId] || null,
      error: this.balancetes[clientId] ? null : { message: 'Cliente não encontrado' }
    }
  }

  async uploadBalancete(file, clientData) {
    // Simular processamento de arquivo
    const newClientId = `client-${Date.now()}`
    
    const newClient = {
      id: newClientId,
      nome: clientData.nome || `Cliente ${this.clients.length + 1}`,
      empresa: clientData.empresa || 'Empresa Administradora',
      periodo: clientData.periodo || 'Janeiro a Dezembro 2024',
      created_at: new Date().toISOString()
    }

    // Dados simulados baseados no arquivo
    const newBalancete = {
      client_id: newClientId,
      receitas: {
        'Janeiro': Math.floor(Math.random() * 10000) + 10000,
        'Fevereiro': Math.floor(Math.random() * 10000) + 10000,
        'Março': Math.floor(Math.random() * 10000) + 10000,
        'Abril': Math.floor(Math.random() * 10000) + 10000,
        'Maio': Math.floor(Math.random() * 10000) + 10000,
        'Junho': Math.floor(Math.random() * 10000) + 10000,
        'Julho': Math.floor(Math.random() * 10000) + 10000,
        'Agosto': Math.floor(Math.random() * 10000) + 10000,
        'Setembro': Math.floor(Math.random() * 10000) + 10000,
        'Outubro': Math.floor(Math.random() * 10000) + 10000,
        'Novembro': Math.floor(Math.random() * 10000) + 10000,
        'Dezembro': Math.floor(Math.random() * 10000) + 10000
      },
      despesas: {},
      saldos: {},
      categorias: {
        receitas: {
          'Taxa de Condomínio': Math.floor(Math.random() * 50000) + 100000,
          'Multas e Juros': Math.floor(Math.random() * 10000) + 5000,
          'Outras Receitas': Math.floor(Math.random() * 5000) + 2000
        },
        despesas: {
          'Manutenção': Math.floor(Math.random() * 30000) + 50000,
          'Limpeza': Math.floor(Math.random() * 15000) + 20000,
          'Segurança': Math.floor(Math.random() * 15000) + 15000,
          'Administração': Math.floor(Math.random() * 10000) + 10000,
          'Outras Despesas': Math.floor(Math.random() * 8000) + 5000
        }
      }
    }

    // Calcular despesas e saldos baseados nas receitas
    Object.keys(newBalancete.receitas).forEach(mes => {
      const receita = newBalancete.receitas[mes]
      const despesa = Math.floor(receita * 0.7) + Math.floor(Math.random() * 1000)
      const saldo = receita - despesa
      
      newBalancete.despesas[mes] = despesa
      newBalancete.saldos[mes] = saldo
    })

    this.clients.push(newClient)
    this.balancetes[newClientId] = newBalancete

    return {
      data: { client: newClient, balancete: newBalancete },
      error: null
    }
  }

  async compareClients(clientIds) {
    const comparison = {}
    
    for (const clientId of clientIds) {
      if (this.balancetes[clientId]) {
        comparison[clientId] = {
          client: this.clients.find(c => c.id === clientId),
          balancete: this.balancetes[clientId]
        }
      }
    }

    return {
      data: comparison,
      error: null
    }
  }
}

// Instância do serviço
const supabaseService = new MockSupabaseService()

export default supabaseService

