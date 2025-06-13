import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, ArrowUpDown, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

const ComparisonView = ({ clients }) => {
  const [selectedClients, setSelectedClients] = useState([])
  const [comparisonData, setComparisonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comparisonType, setComparisonType] = useState('receitas')

  // Carregar dados de comparação
  const loadComparisonData = async () => {
    if (selectedClients.length < 2) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/balancete/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_ids: selectedClients
        })
      })

      const data = await response.json()
      setComparisonData(data)
    } catch (error) {
      console.error('Erro ao carregar dados de comparação:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedClients.length >= 2) {
      loadComparisonData()
    }
  }, [selectedClients])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Preparar dados para gráfico de comparação
  const prepareComparisonChartData = () => {
    if (!comparisonData || !comparisonData.comparison) return []

    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const monthNames = {
      jan: 'Jan', fev: 'Fev', mar: 'Mar', abr: 'Abr',
      mai: 'Mai', jun: 'Jun', jul: 'Jul', ago: 'Ago',
      set: 'Set', out: 'Out', nov: 'Nov', dez: 'Dez'
    }

    return months.map(month => {
      const data = { month: monthNames[month] }
      
      comparisonData.comparison.forEach((clientData, index) => {
        const clientName = clientData.cliente.split(' ')[0] // Primeiro nome para simplificar
        const value = clientData[comparisonType]?.total_mensal?.[month] || 0
        data[`cliente_${index}`] = value
        data[`cliente_${index}_name`] = clientName
      })

      return data
    }).filter(item => {
      // Filtrar meses que têm pelo menos um valor
      return Object.keys(item).some(key => 
        key.startsWith('cliente_') && !key.endsWith('_name') && item[key] > 0
      )
    })
  }

  const handleClientSelection = (clientId, position) => {
    const newSelection = [...selectedClients]
    newSelection[position] = clientId
    setSelectedClients(newSelection.filter(Boolean))
  }

  const chartData = prepareComparisonChartData()
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="space-y-6">
      {/* Seleção de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowUpDown className="h-5 w-5 mr-2" />
            Comparação entre Clientes
          </CardTitle>
          <CardDescription>
            Selecione até 4 clientes para comparar seus dados financeiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(position => (
              <div key={position}>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Cliente {position + 1}
                </label>
                <Select 
                  value={selectedClients[position] || ''} 
                  onValueChange={(value) => handleClientSelection(value, position)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients
                      .filter(client => !selectedClients.includes(client.id) || selectedClients[position] === client.id)
                      .map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nome}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {selectedClients.length >= 2 && (
            <div className="mt-4 flex items-center space-x-4">
              <Select value={comparisonType} onValueChange={setComparisonType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receitas">Receitas</SelectItem>
                  <SelectItem value="despesas">Despesas</SelectItem>
                  <SelectItem value="saldos">Saldos</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={loadComparisonData} disabled={loading}>
                {loading ? 'Carregando...' : 'Atualizar Comparação'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados da Comparação */}
      {selectedClients.length < 2 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Selecione pelo menos 2 clientes
            </h3>
            <p className="text-gray-600">
              Para começar a comparação, selecione pelo menos dois clientes acima
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados de comparação...</p>
          </CardContent>
        </Card>
      ) : comparisonData ? (
        <div className="space-y-6">
          {/* Cards de Resumo da Comparação */}
          {comparisonData.summary && comparisonData.summary.diferencas && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(comparisonData.summary.diferencas).map(([category, monthlyDiff]) => {
                const totalDiff = Object.values(monthlyDiff).reduce((sum, month) => sum + month.diferenca, 0)
                const avgPercentual = Object.values(monthlyDiff).reduce((sum, month) => sum + month.percentual, 0) / Object.keys(monthlyDiff).length

                return (
                  <Card key={category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg capitalize">{category}</CardTitle>
                      <CardDescription>
                        {comparisonData.summary.clientes[1]} vs {comparisonData.summary.clientes[0]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-1">
                        {formatCurrency(totalDiff)}
                      </div>
                      <div className="flex items-center">
                        {avgPercentual >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          avgPercentual >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(avgPercentual)}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">
                          em média
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Gráfico de Comparação Temporal */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação Temporal - {comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)}</CardTitle>
              <CardDescription>
                Evolução mensal dos clientes selecionados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  {selectedClients.map((clientId, index) => {
                    const client = clients.find(c => c.id === clientId)
                    return (
                      <Line
                        key={clientId}
                        type="monotone"
                        dataKey={`cliente_${index}`}
                        stroke={colors[index]}
                        strokeWidth={3}
                        name={client?.nome || `Cliente ${index + 1}`}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Barras Comparativo */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação por Mês</CardTitle>
              <CardDescription>
                Valores lado a lado para facilitar comparação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  {selectedClients.map((clientId, index) => {
                    const client = clients.find(c => c.id === clientId)
                    return (
                      <Bar
                        key={clientId}
                        dataKey={`cliente_${index}`}
                        fill={colors[index]}
                        name={client?.nome || `Cliente ${index + 1}`}
                      />
                    )
                  })}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela de Diferenças Detalhadas */}
          {comparisonData.summary && comparisonData.summary.diferencas && (
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada das Diferenças</CardTitle>
                <CardDescription>
                  Comparação mês a mês entre {comparisonData.summary.clientes[0]} e {comparisonData.summary.clientes[1]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium text-gray-700">Mês</th>
                        <th className="text-right p-3 font-medium text-gray-700">{comparisonData.summary.clientes[0]}</th>
                        <th className="text-right p-3 font-medium text-gray-700">{comparisonData.summary.clientes[1]}</th>
                        <th className="text-right p-3 font-medium text-gray-700">Diferença</th>
                        <th className="text-right p-3 font-medium text-gray-700">Variação %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(comparisonData.summary.diferencas[comparisonType] || {}).map(([month, data]) => (
                        <tr key={month} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900 capitalize">{month}</td>
                          <td className="p-3 text-right text-gray-700">{formatCurrency(data.valor1)}</td>
                          <td className="p-3 text-right text-gray-700">{formatCurrency(data.valor2)}</td>
                          <td className={`p-3 text-right font-medium ${
                            data.diferenca >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(data.diferenca)}
                          </td>
                          <td className={`p-3 text-right font-medium ${
                            data.percentual >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(data.percentual)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600">Erro ao carregar dados de comparação</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ComparisonView

