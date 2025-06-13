import { useState, useEffect } from 'react'
import { Upload, BarChart3, TrendingUp, Users, FileSpreadsheet, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import UploadArea from './components/UploadArea.jsx'
import DashboardCards from './components/DashboardCards.jsx'
import ChartContainer from './components/ChartContainer.jsx'
import DataTable from './components/DataTable.jsx'
import ComparisonView from './components/ComparisonView.jsx'
// Importar serviço ativo (configurado pelo script configure.sh)
import supabaseService from './services/supabase-active.js'
import './App.css'

function App() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('')
  const [clientData, setClientData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking')

  // Verificar conexão e carregar clientes
  useEffect(() => {
    checkConnection()
    loadClients()
  }, [])

  const checkConnection = async () => {
    try {
      if (supabaseService.testConnection) {
        const { connected } = await supabaseService.testConnection()
        setConnectionStatus(connected ? 'connected' : 'disconnected')
      } else {
        setConnectionStatus('demo')
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error)
      setConnectionStatus('demo')
    }
  }

  const loadClients = async () => {
    try {
      const { data, error } = await supabaseService.getClients()
      if (error) {
        console.error('Erro ao carregar clientes:', error)
        return
      }
      setClients(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  // Carregar dados do cliente selecionado
  const loadClientData = async (clientId) => {
    if (!clientId) return

    setLoading(true)
    try {
      const { data, error } = await supabaseService.getBalancete(clientId)
      if (error) {
        console.error('Erro ao carregar dados do cliente:', error)
        return
      }
      setClientData(data)
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  // Manipular seleção de cliente
  const handleClientSelect = (clientId) => {
    setSelectedClient(clientId)
    loadClientData(clientId)
  }

  // Manipular upload de arquivo
  const handleFileUpload = async (file) => {
    setLoading(true)
    setUploadSuccess(false)
    
    try {
      // Extrair informações do nome do arquivo
      const fileName = file.name.replace(/\.[^/.]+$/, "")
      const clientData = {
        nome: fileName.includes('Quali') ? 'Condomínio Quali Residencial Bonfim Paulista' : `Cliente ${fileName}`,
        empresa: 'Empresa Administradora',
        periodo: 'Janeiro a Dezembro 2024'
      }

      const { data, error } = await supabaseService.uploadBalancete(file, clientData)
      
      if (error) {
        console.error('Erro no upload:', error)
        alert('Erro ao processar arquivo: ' + (error.message || 'Erro desconhecido'))
        return
      }

      // Atualizar lista de clientes
      await loadClients()
      
      // Selecionar o cliente recém-criado
      if (data?.client) {
        setSelectedClient(data.client.id)
        setClientData(data.balancete)
        setUploadSuccess(true)
        
        // Remover mensagem de sucesso após 3 segundos
        setTimeout(() => setUploadSuccess(false), 3000)
      }

    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao processar arquivo: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Dashboard de Balancetes Financeiros
              </h1>
              
              {/* Indicador de status */}
              <div className="ml-4 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'demo' ? 'bg-yellow-500' :
                  connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-xs text-gray-500">
                  {connectionStatus === 'connected' ? 'Supabase' :
                   connectionStatus === 'demo' ? 'Demo' :
                   connectionStatus === 'disconnected' ? 'Desconectado' : 'Verificando...'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <UploadArea onFileUpload={handleFileUpload} loading={loading} />
              
              {clients.length > 0 && (
                <Select value={selectedClient} onValueChange={handleClientSelect}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ Arquivo processado com sucesso! Dados carregados no dashboard.
          </div>
        )}

        {clients.length === 0 ? (
          // Estado inicial - sem clientes
          <div className="text-center py-12">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Bem-vindo ao Dashboard de Balancetes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Faça upload de uma planilha de balancete para<br />
              começar a visualizar e comparar dados financeiros.
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-500">
                <Upload className="h-4 w-4 mr-2 text-blue-500" />
                Nenhum cliente encontrado
                <br />
                <span className="text-xs text-blue-600">Faça upload da primeira planilha para começar</span>
              </div>
            </div>
            
            {/* Informação sobre o modo */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md max-w-md mx-auto">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'demo' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-sm font-medium text-blue-900">
                  {connectionStatus === 'connected' ? 'Modo Supabase' :
                   connectionStatus === 'demo' ? 'Modo Demonstração' : 'Verificando conexão...'}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                {connectionStatus === 'connected' ? 'Conectado ao banco de dados real' :
                 connectionStatus === 'demo' ? 'Usando dados simulados localmente' : 'Aguarde...'}
              </p>
            </div>
          </div>
        ) : !selectedClient ? (
          // Estado com clientes mas nenhum selecionado
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Dashboard de Balancetes Financeiros</h3>
            <p className="mt-1 text-sm text-gray-500">
              Selecione um cliente para visualizar dados individuais ou use a comparação para analisar múltiplos clientes
            </p>
            
            {/* Cards de resumo */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">
                    <Users className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{clients.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Clientes Cadastrados
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">
                    <TrendingUp className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">Análises</div>
                  <p className="text-xs text-muted-foreground">
                    Visualizações interativas e<br />comparações mensais
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600">
                    <ArrowUpDown className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">Comparações</div>
                  <p className="text-xs text-muted-foreground">
                    Compare dados entre diferentes<br />clientes e períodos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs para diferentes visualizações */}
            <div className="mt-8">
              <Tabs defaultValue="comparison" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comparison">Comparação entre Clientes</TabsTrigger>
                  <TabsTrigger value="clients">Lista de Clientes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="comparison" className="space-y-4">
                  <ComparisonView clients={clients} />
                </TabsContent>
                
                <TabsContent value="clients" className="space-y-4">
                  <div className="grid gap-4">
                    {clients.map((client) => (
                      <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleClientSelect(client.id)}>
                        <CardHeader>
                          <CardTitle className="text-lg">{client.nome}</CardTitle>
                          <CardDescription>
                            {client.empresa} • {client.periodo}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          // Estado com cliente selecionado
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-500">Carregando dados...</p>
              </div>
            ) : clientData ? (
              <>
                {/* Informações do cliente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {clients.find(c => c.id === selectedClient)?.nome}
                    </CardTitle>
                    <CardDescription>
                      {clients.find(c => c.id === selectedClient)?.empresa} • 
                      {clients.find(c => c.id === selectedClient)?.periodo}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Cards de resumo */}
                <DashboardCards data={clientData} />

                {/* Tabs para diferentes visualizações */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="receitas">Receitas</TabsTrigger>
                    <TabsTrigger value="despesas">Despesas</TabsTrigger>
                    <TabsTrigger value="saldos">Saldos</TabsTrigger>
                    <TabsTrigger value="comparison">Comparação</TabsTrigger>
                    <TabsTrigger value="details">Dados Detalhados</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <ChartContainer data={clientData} type="overview" />
                  </TabsContent>
                  
                  <TabsContent value="receitas" className="space-y-4">
                    <ChartContainer data={clientData} type="receitas" />
                  </TabsContent>
                  
                  <TabsContent value="despesas" className="space-y-4">
                    <ChartContainer data={clientData} type="despesas" />
                  </TabsContent>
                  
                  <TabsContent value="saldos" className="space-y-4">
                    <ChartContainer data={clientData} type="saldos" />
                  </TabsContent>
                  
                  <TabsContent value="comparison" className="space-y-4">
                    <ComparisonView 
                      clients={clients} 
                      selectedClient={selectedClient}
                      clientData={clientData}
                    />
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <DataTable data={clientData} />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">Erro ao carregar dados do cliente</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App

