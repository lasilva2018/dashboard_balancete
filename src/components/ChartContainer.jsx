import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'

const ChartContainer = ({ data, type }) => {
  if (!data) return null

  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const monthNames = {
    jan: 'Janeiro', fev: 'Fevereiro', mar: 'Março', abr: 'Abril',
    mai: 'Maio', jun: 'Junho', jul: 'Julho', ago: 'Agosto',
    set: 'Setembro', out: 'Outubro', nov: 'Novembro', dez: 'Dezembro'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const colors = {
    receitas: '#10b981',
    despesas: '#ef4444',
    saldos: '#3b82f6',
    primary: '#6366f1',
    secondary: '#8b5cf6'
  }

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

  // Preparar dados para gráfico de linha temporal
  const prepareTimelineData = () => {
    const timelineData = months.map(month => ({
      month: monthNames[month],
      monthKey: month,
      receitas: data.receitas?.total_mensal?.[month] || 0,
      despesas: data.despesas?.total_mensal?.[month] || 0,
      saldos: (data.receitas?.total_mensal?.[month] || 0) - (data.despesas?.total_mensal?.[month] || 0)
    }))

    return timelineData.filter(item => item.receitas > 0 || item.despesas > 0)
  }

  // Preparar dados para gráfico de categorias
  const prepareCategoryData = (categoryType) => {
    const categoryData = data[categoryType]
    if (!categoryData || !categoryData.categorias) return []

    return categoryData.categorias
      .map(cat => ({
        name: cat.nome.length > 30 ? cat.nome.substring(0, 30) + '...' : cat.nome,
        fullName: cat.nome,
        total: Object.values(cat.valores).reduce((sum, val) => sum + val, 0)
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10) // Top 10 categorias
  }

  // Preparar dados para gráfico de pizza
  const preparePieData = (categoryType) => {
    const categoryData = prepareCategoryData(categoryType)
    return categoryData.slice(0, 8) // Top 8 para melhor visualização
  }

  const timelineData = prepareTimelineData()

  if (type === 'overview') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Linha - Evolução Temporal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>
              Comparação entre receitas, despesas e saldo ao longo do ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke={colors.receitas} 
                  strokeWidth={3}
                  name="Receitas"
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke={colors.despesas} 
                  strokeWidth={3}
                  name="Despesas"
                />
                <Line 
                  type="monotone" 
                  dataKey="saldos" 
                  stroke={colors.saldos} 
                  strokeWidth={3}
                  name="Saldo"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Receitas vs Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>Comparação mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="receitas" fill={colors.receitas} name="Receitas" />
                <Bar dataKey="despesas" fill={colors.despesas} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição de Receitas */}
        <Card>
          <CardHeader>
            <CardTitle>Principais Receitas</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={preparePieData('receitas')}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {preparePieData('receitas').map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (type === 'receitas' || type === 'despesas' || type === 'saldos') {
    const categoryData = prepareCategoryData(type)
    const pieData = preparePieData(type)

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Top Categorias */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Principais {type === 'receitas' ? 'Receitas' : type === 'despesas' ? 'Despesas' : 'Saldos'}
            </CardTitle>
            <CardDescription>
              Top 10 categorias por valor total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => categoryData.find(item => item.name === label)?.fullName || label}
                />
                <Bar dataKey="total" fill={colors[type] || colors.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição</CardTitle>
            <CardDescription>Proporção entre categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => pieData.find(item => item.name === label)?.fullName || label}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução Temporal da Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Total por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line 
                  type="monotone" 
                  dataKey={type} 
                  stroke={colors[type] || colors.primary} 
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default ChartContainer

