import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Star, ShoppingCart, Eye, Heart } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { blink } from '../../blink/client'
import { Template } from '../../types/template'

interface MarketplaceProps {
  onPurchaseTemplate: (template: Template) => void
  onPreviewTemplate: (template: Template) => void
}

export function Marketplace({ onPurchaseTemplate, onPreviewTemplate }: MarketplaceProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('popular')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'documents', label: 'Documents' },
    { value: 'designs', label: 'Designs' },
    { value: 'web', label: 'Web Templates' },
    { value: 'presentations', label: 'Presentations' },
    { value: 'email', label: 'Email Templates' }
  ]

  const loadMarketplaceTemplates = useCallback(async () => {
    try {
      setLoading(true)
      
      const query: any = {
        where: { isPublished: "1" },
        orderBy: { createdAt: 'desc' },
        limit: 50
      }

      if (selectedCategory !== 'all') {
        query.where.category = selectedCategory
      }

      if (sortBy === 'popular') {
        query.orderBy = { salesCount: 'desc' }
      } else if (sortBy === 'rating') {
        query.orderBy = { rating: 'desc' }
      } else if (sortBy === 'price-low') {
        query.orderBy = { price: 'asc' }
      } else if (sortBy === 'price-high') {
        query.orderBy = { price: 'desc' }
      }

      const result = await blink.db.templates.list(query)
      setTemplates(result)
    } catch (error) {
      console.error('Failed to load marketplace templates:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, sortBy])

  useEffect(() => {
    loadMarketplaceTemplates()
  }, [loadMarketplaceTemplates])

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFavorite = async (templateId: string) => {
    try {
      const user = await blink.auth.me()
      const isFavorite = favorites.has(templateId)
      
      if (isFavorite) {
        // Remove from favorites
        await blink.db.userTemplates.delete(`${user.id}_${templateId}`)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(templateId)
          return newSet
        })
      } else {
        // Add to favorites
        await blink.db.userTemplates.create({
          id: `${user.id}_${templateId}`,
          userId: user.id,
          templateId,
          isFavorite: true
        })
        setFavorites(prev => new Set(prev).add(templateId))
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Marketplace</h1>
        <p className="text-gray-600">Discover and purchase professional templates created by our community</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                {template.previewImageUrl ? (
                  <img 
                    src={template.previewImageUrl} 
                    alt={template.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-indigo-400 text-4xl font-bold">
                    {template.title.charAt(0).toUpperCase()}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toggleFavorite(template.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${favorites.has(template.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">
                      {template.rating > 0 ? template.rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>
                
                <CardTitle className="text-sm font-semibold line-clamp-2">
                  {template.title}
                </CardTitle>
                
                {template.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {template.description}
                  </p>
                )}
              </div>
            </CardHeader>

            <CardFooter className="p-4 pt-0 space-y-3">
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-indigo-600">
                  {formatPrice(template.price)}
                </span>
                <span className="text-xs text-gray-500">
                  {template.salesCount} sales
                </span>
              </div>
              
              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onPreviewTemplate(template)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onPurchaseTemplate(template)}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {template.price === 0 ? 'Get Free' : 'Buy'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}