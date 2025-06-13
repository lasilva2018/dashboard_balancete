import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'

const DashboardCards = ({ data }) => {
  if (!data) return null

  // Calcular totais anuais
  const calculateYearlyTotal = (categoryData) => {
    if (!categoryData || !categoryData.total_mensal) return 0
    
    return Object.values(categoryData.total_mensal).reduce((sum, value) => sum + value, 0)
  }

  // Calcular média mensal
  const calculateMonthlyAverage = (categoryData) => {
    if (!categoryData || !categoryData.total_mensal) return 0
    
    const values = Object.values(categoryData.total_mensal)
    const nonZeroValues = values.filter(v => v > 0)
    
    return nonZeroValues.length > 0 
      ? nonZeroValues.reduce((sum, value) => sum + value, 0) / nonZeroValues.length
      : 0
  }

  // Calcular variação do último mês
  const calculateLastMonthVariation = (categoryData) => {
    if (!categoryData || !categoryData.total_mensal) return 0
    
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const values = months.map(month => categoryData.total_mensal[month] || 0)
    
    // Encontrar os dois últimos meses com dados
    let lastValue = 0
    let previousValue = 0
    
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i] > 0) {
        if (lastValue === 0) {
          lastValue = values[i]
        } else {
          previousValue = values[i]
          break
        }
      }
    }
    
    if (previousValue === 0) return 0
    
    return ((lastValue - previousValue) / previousValue) * 100
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const receitasTotal = calculateYearlyTotal(data.receitas)
  const despesasTotal = calculateYearlyTotal(data.despesas)
  const saldoTotal = receitasTotal - despesasTotal
  
  const receitasMedia = calculateMonthlyAverage(data.receitas)
  const despesasMedia = calculateMonthlyAverage(data.despesas)
  
  const receitasVariacao = calculateLastMonthVariation(data.receitas)
  const despesasVariacao = calculateLastMonthVariation(data.despesas)

  const cards = [
    {
      title: 'Receitas Totais',
      value: formatCurrency(receitasTotal),
      subtitle: `Média mensal: ${formatCurrency(receitasMedia)}`,
      variation: receitasVariacao,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Despesas Totais',
      value: formatCurrency(despesasTotal),
      subtitle: `Média mensal: ${formatCurrency(despesasMedia)}`,
      variation: despesasVariacao,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Saldo Líquido',
      value: formatCurrency(saldoTotal),
      subtitle: saldoTotal >= 0 ? 'Resultado positivo' : 'Resultado negativo',
      variation: null,
      icon: DollarSign,
      color: saldoTotal >= 0 ? 'text-blue-600' : 'text-orange-600',
      bgColor: saldoTotal >= 0 ? 'bg-blue-50' : 'bg-orange-50',
      borderColor: saldoTotal >= 0 ? 'border-blue-200' : 'border-orange-200'
    },
    {
      title: 'Categorias',
      value: (data.receitas?.categorias?.length || 0) + (data.despesas?.categorias?.length || 0),
      subtitle: `${data.receitas?.categorias?.length || 0} receitas, ${data.despesas?.categorias?.length || 0} despesas`,
      variation: null,
      icon: PieChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        
        return (
          <Card key={index} className={`${card.borderColor} ${card.bgColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {typeof card.value === 'number' ? card.value : card.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  {card.subtitle}
                </p>
                {card.variation !== null && (
                  <span className={`text-xs font-medium ${
                    card.variation >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(card.variation)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default DashboardCards

