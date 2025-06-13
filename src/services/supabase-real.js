import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
// SUBSTITUA ESTAS VARIÁVEIS PELAS SUAS CREDENCIAIS
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://SEU-PROJECT-ID.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'SUA-CHAVE-ANON-AQUI'

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

class SupabaseService {
  constructor() {
    this.supabase = supabase
  }

  // Buscar todos os clientes
  async getClients() {
    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        return { data: [], error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Erro na requisição:', error)
      return { data: [], error }
    }
  }

  // Buscar dados de balancete de um cliente específico
  async getBalancete(clientId) {
    try {
      const { data, error } = await this.supabase
        .from('balancetes')
        .select('*')
        .eq('client_id', clientId)
        .single()

      if (error) {
        console.error('Erro ao buscar balancete:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Erro na requisição:', error)
      return { data: null, error }
    }
  }

  // Fazer upload de um novo balancete
  async uploadBalancete(file, clientData) {
    try {
      // 1. Primeiro, criar ou atualizar o cliente
      const { data: clientResult, error: clientError } = await this.supabase
        .from('clients')
        .upsert({
          nome: clientData.nome,
          empresa: clientData.empresa,
          periodo: clientData.periodo
        })
        .select()
        .single()

      if (clientError) {
        console.error('Erro ao criar cliente:', clientError)
        return { data: null, error: clientError }
      }

      // 2. Processar dados do arquivo (simulado)
      const processedData = this.processExcelFile(file, clientData)

      // 3. Inserir ou atualizar balancete
      const { data: balanceteResult, error: balanceteError } = await this.supabase
        .from('balancetes')
        .upsert({
          client_id: clientResult.id,
          receitas: processedData.receitas,
          despesas: processedData.despesas,
          saldos: processedData.saldos,
          categorias: processedData.categorias,
          arquivo_nome: file.name
        })
        .select()
        .single()

      if (balanceteError) {
        console.error('Erro ao salvar balancete:', balanceteError)
        return { data: null, error: balanceteError }
      }

      return {
        data: {
          client: clientResult,
          balancete: balanceteResult
        },
        error: null
      }

    } catch (error) {
      console.error('Erro no upload:', error)
      return { data: null, error }
    }
  }

  // Comparar múltiplos clientes
  async compareClients(clientIds) {
    try {
      const comparison = {}

      for (const clientId of clientIds) {
        // Buscar dados do cliente
        const { data: client, error: clientError } = await this.supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single()

        if (clientError) {
          console.error(`Erro ao buscar cliente ${clientId}:`, clientError)
          continue
        }

        // Buscar dados do balancete
        const { data: balancete, error: balanceteError } = await this.supabase
          .from('balancetes')
          .select('*')
          .eq('client_id', clientId)
          .single()

        if (balanceteError) {
          console.error(`Erro ao buscar balancete ${clientId}:`, balanceteError)
          continue
        }

        comparison[clientId] = {
          client,
          balancete
        }
      }

      return { data: comparison, error: null }

    } catch (error) {
      console.error('Erro na comparação:', error)
      return { data: {}, error }
    }
  }

  // Processar arquivo Excel (simulado)
  processExcelFile(file, clientData) {
    // Em uma implementação real, aqui você usaria uma biblioteca como xlsx
    // para ler e processar o arquivo Excel
    
    // Por enquanto, vamos gerar dados simulados baseados no nome do arquivo
    const isQualiBonfim = file.name.toLowerCase().includes('quali') || 
                         file.name.toLowerCase().includes('bonfim')

    if (isQualiBonfim) {
      return {
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
    }

    // Dados simulados para outros clientes
    const baseReceita = Math.floor(Math.random() * 5000) + 10000
    const receitas = {}
    const despesas = {}
    const saldos = {}

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    meses.forEach(mes => {
      const receita = baseReceita + Math.floor(Math.random() * 2000)
      const despesa = Math.floor(receita * 0.7) + Math.floor(Math.random() * 1000)
      
      receitas[mes] = receita
      despesas[mes] = despesa
      saldos[mes] = receita - despesa
    })

    return {
      receitas,
      despesas,
      saldos,
      categorias: {
        receitas: {
          'Taxa de Condomínio': Math.floor(Math.random() * 50000) + 80000,
          'Multas e Juros': Math.floor(Math.random() * 10000) + 5000,
          'Outras Receitas': Math.floor(Math.random() * 5000) + 2000
        },
        despesas: {
          'Manutenção': Math.floor(Math.random() * 20000) + 40000,
          'Limpeza': Math.floor(Math.random() * 10000) + 15000,
          'Segurança': Math.floor(Math.random() * 15000) + 10000,
          'Administração': Math.floor(Math.random() * 8000) + 8000,
          'Outras Despesas': Math.floor(Math.random() * 5000) + 3000
        }
      }
    }
  }

  // Deletar cliente e seus balancetes
  async deleteClient(clientId) {
    try {
      const { error } = await this.supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) {
        console.error('Erro ao deletar cliente:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Erro na requisição:', error)
      return { error }
    }
  }

  // Testar conexão com Supabase
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select('count')
        .limit(1)

      if (error) {
        console.error('Erro na conexão:', error)
        return { connected: false, error }
      }

      return { connected: true, error: null }
    } catch (error) {
      console.error('Erro na conexão:', error)
      return { connected: false, error }
    }
  }
}

// Instância do serviço
const supabaseService = new SupabaseService()

export default supabaseService

