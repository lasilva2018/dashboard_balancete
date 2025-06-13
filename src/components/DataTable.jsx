import { useState } from 'react'
import { Search, Download, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

const DataTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  if (!data) return null

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const monthNames = {
    jan: 'Jan', fev: 'Fev', mar: 'Mar', abr: 'Abr',
    mai: 'Mai', jun: 'Jun', jul: 'Jul', ago: 'Ago',
    set: 'Set', out: 'Out', nov: 'Nov', dez: 'Dez'
  }

  // Preparar dados para tabela
  const prepareTableData = (categoryType) => {
    const categoryData = data[categoryType]
    if (!categoryData || !categoryData.categorias) return []

    return categoryData.categorias
      .map(cat => {
        const total = Object.values(cat.valores).reduce((sum, val) => sum + val, 0)
        return {
          categoria: cat.nome,
          total,
          valores: cat.valores,
          ...cat.valores // Espalhar valores mensais
        }
      })
      .filter(item => {
        if (filterType === 'positive') return item.total > 0
        if (filterType === 'zero') return item.total === 0
        return true
      })
      .filter(item => 
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.total - a.total)
  }

  // Exportar dados para CSV
  const exportToCSV = (categoryType) => {
    const tableData = prepareTableData(categoryType)
    
    const headers = ['Categoria', 'Total', ...months.map(m => monthNames[m])]
    const csvContent = [
      headers.join(','),
      ...tableData.map(row => [
        `"${row.categoria}"`,
        row.total.toFixed(2),
        ...months.map(month => (row.valores[month] || 0).toFixed(2))
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${categoryType}_${data.cliente.replace(/\s+/g, '_')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const TableComponent = ({ categoryType, title }) => {
    const tableData = prepareTableData(categoryType)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                {tableData.length} categorias encontradas
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(categoryType)}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar CSV</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por valor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="positive">Apenas com valores</SelectItem>
                <SelectItem value="zero">Apenas zeradas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700 sticky left-0 bg-gray-50 min-w-[200px]">
                    Categoria
                  </th>
                  <th className="text-right p-3 font-medium text-gray-700 min-w-[120px]">
                    Total
                  </th>
                  {months.map(month => (
                    <th key={month} className="text-right p-3 font-medium text-gray-700 min-w-[100px]">
                      {monthNames[month]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 sticky left-0 bg-white font-medium text-gray-900 border-r">
                      <div className="max-w-[200px] truncate" title={row.categoria}>
                        {row.categoria}
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold text-gray-900">
                      {formatCurrency(row.total)}
                    </td>
                    {months.map(month => {
                      const value = row.valores[month] || 0
                      return (
                        <td key={month} className="p-3 text-right text-gray-700">
                          {value > 0 ? formatCurrency(value) : '-'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tableData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma categoria encontrada com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="receitas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="saldos">Saldos</TabsTrigger>
        </TabsList>

        <TabsContent value="receitas">
          <TableComponent 
            categoryType="receitas" 
            title="Dados Detalhados - Receitas" 
          />
        </TabsContent>

        <TabsContent value="despesas">
          <TableComponent 
            categoryType="despesas" 
            title="Dados Detalhados - Despesas" 
          />
        </TabsContent>

        <TabsContent value="saldos">
          <TableComponent 
            categoryType="saldos" 
            title="Dados Detalhados - Saldos" 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DataTable

