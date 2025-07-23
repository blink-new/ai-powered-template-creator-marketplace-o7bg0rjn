import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Share, Download, DollarSign } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { blink } from '../../blink/client'
import { Template } from '../../types/template'

interface MyTemplatesProps {
  onCreateNew: () => void
  onEditTemplate: (template: Template) => void
}

export function MyTemplates({ onCreateNew, onEditTemplate }: MyTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [publishForm, setPublishForm] = useState({
    title: '',
    description: '',
    price: 0,
    isPublished: false
  })

  const loadMyTemplates = async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      const result = await blink.db.templates.list({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        limit: 100
      })
      
      setTemplates(result)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMyTemplates()
  }, [])

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      await blink.db.templates.delete(templateId)
      setTemplates(prev => prev.filter(t => t.id !== templateId))
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handlePublishTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setPublishForm({
      title: template.title,
      description: template.description || '',
      price: template.price || 0,
      isPublished: Number(template.isPublished) > 0
    })
    setPublishDialogOpen(true)
  }

  const handleSavePublishSettings = async () => {
    if (!selectedTemplate) return
    
    try {
      await blink.db.templates.update(selectedTemplate.id, {
        title: publishForm.title,
        description: publishForm.description,
        price: publishForm.price,
        isPublished: publishForm.isPublished,
        updatedAt: new Date().toISOString()
      })
      
      // Update local state
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, ...publishForm, updatedAt: new Date().toISOString() }
          : t
      ))
      
      setPublishDialogOpen(false)
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Failed to update template:', error)
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
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
          <h1 className="text-3xl font-bold text-gray-900">My Templates</h1>
          <p className="text-gray-600">Manage your created templates and marketplace listings</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
              <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Edit className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => Number(t.isPublished) > 0).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Share className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.reduce((sum, t) => sum + (t.salesCount || 0), 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${templates.reduce((sum, t) => sum + ((t.price || 0) * (t.salesCount || 0)), 0).toFixed(2)}
                </p>
              </div>
              <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
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
                
                <div className="absolute top-2 right-2 flex gap-1">
                  {Number(template.isPublished) > 0 && (
                    <Badge variant="default" className="text-xs">
                      Published
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDate(template.updatedAt)}
                  </span>
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
                  {formatPrice(template.price || 0)}
                </span>
                <span className="text-xs text-gray-500">
                  {template.salesCount || 0} sales
                </span>
              </div>
              
              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onEditTemplate(template)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handlePublishTemplate(template)}
                >
                  <Share className="h-3 w-3 mr-1" />
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Edit className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">Create your first template to get started</p>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      )}

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={publishForm.title}
                onChange={(e) => setPublishForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Template title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={publishForm.description}
                onChange={(e) => setPublishForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your template..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={publishForm.price}
                onChange={(e) => setPublishForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={publishForm.isPublished}
                onCheckedChange={(checked) => setPublishForm(prev => ({ ...prev, isPublished: checked }))}
              />
              <Label htmlFor="published">Publish to marketplace</Label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setPublishDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSavePublishSettings} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}