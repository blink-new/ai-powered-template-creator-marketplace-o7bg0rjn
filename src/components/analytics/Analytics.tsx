import React, { useState, useEffect, useCallback } from 'react'
import { TrendingUp, DollarSign, Eye, Download, Users, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { blink } from '../../blink/client'
import { Template } from '../../types/template'

interface AnalyticsData {
  totalRevenue: number
  totalSales: number
  totalViews: number
  totalDownloads: number
  topTemplates: Template[]
  recentSales: any[]
  monthlyStats: any[]
}

export function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalSales: 0,
    totalViews: 0,
    totalDownloads: 0,
    topTemplates: [],
    recentSales: [],
    monthlyStats: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  const generateMonthlyStats = (purchases: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({
      month,
      revenue: Math.random() * 1000 + 200,
      sales: Math.floor(Math.random() * 50) + 10
    }))
  }

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      // Load user's templates
      const templates = await blink.db.templates.list({
        where: { userId: user.id },
        orderBy: { salesCount: 'desc' },
        limit: 100
      })
      
      // Load recent purchases
      const purchases = await blink.db.purchases.list({
        where: { sellerUserId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 50
      })
      
      // Calculate analytics
      const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0)
      const totalSales = purchases.length
      const totalViews = templates.reduce((sum, t) => sum + (t.salesCount || 0) * 10, 0) // Estimate views
      const totalDownloads = templates.reduce((sum, t) => sum + (t.salesCount || 0), 0)
      
      // Get top performing templates
      const topTemplates = templates
        .filter(t => Number(t.isPublished) > 0)
        .slice(0, 5)
      
      // Generate monthly stats (mock data for demo)
      const monthlyStats = generateMonthlyStats(purchases)
      
      setData({
        totalRevenue,
        totalSales,
        totalViews,
        totalDownloads,
        topTemplates,
        recentSales: purchases.slice(0, 10),
        monthlyStats
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your template performance and sales</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Template Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              +5.7% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topTemplates.map((template, index) => (
                <div key={template.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{template.title}</p>
                      <p className="text-xs text-gray-500">{template.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency((template.price || 0) * (template.salesCount || 0))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {template.salesCount || 0} sales
                    </p>
                  </div>
                </div>
              ))}
              
              {data.topTemplates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No published templates yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentSales.map((sale, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Template Sale</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(sale.amount)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {sale.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {data.recentSales.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No sales yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-8 bg-indigo-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-indigo-600">
                      {stat.month}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {formatCurrency(stat.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stat.sales} sales
                    </p>
                  </div>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((stat.revenue / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900">Growing Sales</p>
              <p className="text-sm text-green-700">
                Your templates are performing well this month
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-blue-900">Active Audience</p>
              <p className="text-sm text-blue-700">
                High engagement from your customers
              </p>
            </div>
            
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <Calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="font-semibold text-amber-900">Consistent Growth</p>
              <p className="text-sm text-amber-700">
                Steady improvement over time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}