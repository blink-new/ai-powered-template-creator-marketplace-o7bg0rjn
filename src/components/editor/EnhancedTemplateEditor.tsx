import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download, Eye, Edit3, Save, Share2, Palette, Type, Image, RefreshCw, Copy, Check } from 'lucide-react'
import { UserInput } from '@/types/template'
import { blink } from '@/blink/client'

interface TemplateEditorProps {
  content: string
  userInput: UserInput
  onBack: () => void
}

interface TemplateStyle {
  fontFamily: string
  fontSize: string
  color: string
  backgroundColor: string
  padding: string
  borderRadius: string
}

export function EnhancedTemplateEditor({ content, userInput, onBack }: TemplateEditorProps) {
  const [editedContent, setEditedContent] = useState(content)
  const [activeTab, setActiveTab] = useState('edit')
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>({
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px'
  })
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(userInput).map(([key, value]) => [key, value.toString()]))
  )
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'docx' | 'html'>('html')

  // Replace variables in content with actual values for preview
  const getPreviewContent = () => {
    let previewContent = editedContent
    Object.entries(variableValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      previewContent = previewContent.replace(regex, value)
    })
    return previewContent
  }

  const getStyledPreviewContent = () => {
    const content = getPreviewContent()
    
    // Convert markdown-like syntax to HTML
    const htmlContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\n/g, '<br>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    return htmlContent
  }

  const handleExport = async (format: 'pdf' | 'png' | 'docx' | 'html') => {
    const finalContent = getPreviewContent()
    
    if (format === 'html') {
      const styledContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Template</title>
    <style>
        body {
            font-family: ${templateStyle.fontFamily};
            font-size: ${templateStyle.fontSize};
            color: ${templateStyle.color};
            background-color: ${templateStyle.backgroundColor};
            padding: ${templateStyle.padding};
            border-radius: ${templateStyle.borderRadius};
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
        }
        h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
        p { margin-bottom: 1em; }
        a { color: #3b82f6; text-decoration: none; }
        a:hover { text-decoration: underline; }
        strong { font-weight: 600; }
        em { font-style: italic; }
    </style>
</head>
<body>
    ${getStyledPreviewContent()}
</body>
</html>`
      
      const blob = new Blob([styledContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      // For other formats, export as text for now
      const blob = new Blob([finalContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template.${format === 'docx' ? 'txt' : format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const generateVariation = async () => {
    setIsGeneratingVariation(true)
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Create a variation of this template with the same structure but different wording and style. Keep all {{variables}} intact. Original template: ${editedContent}`,
        model: 'gpt-4o-mini',
        maxTokens: 1500
      })
      setEditedContent(text)
    } catch (error) {
      console.error('Error generating variation:', error)
    } finally {
      setIsGeneratingVariation(false)
    }
  }

  const saveTemplate = async () => {
    setIsSaving(true)
    try {
      // Save to database
      await blink.db.userTemplates.create({
        title: variableValues.name || variableValues.title || 'Untitled Template',
        content: editedContent,
        category: userInput.industry || 'general',
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      console.log('Template saved successfully!')
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const publishToMarketplace = async () => {
    setIsPublishing(true)
    try {
      // Save and publish to marketplace
      await blink.db.templates.create({
        title: variableValues.name || variableValues.title || 'Untitled Template',
        description: `Professional template generated with AI`,
        content: editedContent,
        category: userInput.industry || 'general',
        price: 0, // Free template
        authorId: 'current-user',
        authorName: 'Template Creator',
        rating: 5.0,
        salesCount: 0,
        tags: ['ai-generated', 'professional'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      console.log('Template published to marketplace!')
    } catch (error) {
      console.error('Error publishing template:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getPreviewContent())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const extractVariables = (content: string) => {
    const matches = content.match(/{{(\w+)}}/g)
    return matches ? [...new Set(matches)] : []
  }

  const variables = extractVariables(editedContent)

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [variable]: value }))
  }

  const handleStyleChange = (property: keyof TemplateStyle, value: string) => {
    setTemplateStyle(prev => ({ ...prev, [property]: value }))
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Creator
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Template Editor</h1>
            <p className="text-gray-600">Edit, style, and preview your template with advanced features</p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={saveTemplate}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Template
            </Button>
            <Button 
              variant="outline"
              onClick={publishToMarketplace}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Publish to Marketplace
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Variables & Style Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Edit3 className="mr-2 h-4 w-4" />
                Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {variables.length > 0 ? (
                variables.map((variable) => {
                  const cleanVar = variable.replace(/[{}]/g, '')
                  return (
                    <div key={variable} className="space-y-1">
                      <Label className="text-xs font-medium">{cleanVar}</Label>
                      <Input
                        value={variableValues[cleanVar] || ''}
                        onChange={(e) => handleVariableChange(cleanVar, e.target.value)}
                        placeholder={`Enter ${cleanVar}`}
                        className="text-xs"
                      />
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">No variables found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                Styling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Font Family</Label>
                <Select value={templateStyle.fontFamily} onValueChange={(value) => handleStyleChange('fontFamily', value)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                    <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                    <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                    <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Font Size</Label>
                <Select value={templateStyle.fontSize} onValueChange={(value) => handleStyleChange('fontSize', value)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14px">14px</SelectItem>
                    <SelectItem value="16px">16px</SelectItem>
                    <SelectItem value="18px">18px</SelectItem>
                    <SelectItem value="20px">20px</SelectItem>
                    <SelectItem value="24px">24px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Text Color</Label>
                <Input
                  type="color"
                  value={templateStyle.color}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Background</Label>
                <Input
                  type="color"
                  value={templateStyle.backgroundColor}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="h-8"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="edit" className="flex items-center">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    Live Preview
                  </TabsTrigger>
                  <TabsTrigger value="styled" className="flex items-center">
                    <Type className="mr-2 h-4 w-4" />
                    Styled Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateVariation}
                  disabled={isGeneratingVariation}
                >
                  {isGeneratingVariation ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Generate Variation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab}>
              <TabsContent value="edit" className="mt-0">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                  placeholder="Edit your template content here..."
                />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Use **bold**, *italic*, # headings, and [links](url) for formatting. Variables like {{name}} will be replaced in preview.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0">
                <div className="border rounded-lg p-6 min-h-[600px] bg-white">
                  <div 
                    className="prose max-w-none"
                    style={{
                      fontFamily: templateStyle.fontFamily,
                      fontSize: templateStyle.fontSize,
                      color: templateStyle.color,
                      lineHeight: '1.6'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: getPreviewContent().replace(/\n/g, '<br>') 
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="styled" className="mt-0">
                <div 
                  className="border rounded-lg min-h-[600px]"
                  style={{
                    fontFamily: templateStyle.fontFamily,
                    fontSize: templateStyle.fontSize,
                    color: templateStyle.color,
                    backgroundColor: templateStyle.backgroundColor,
                    padding: templateStyle.padding,
                    borderRadius: templateStyle.borderRadius
                  }}
                >
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: getStyledPreviewContent()
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Export Options
            </span>
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Format:</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleExport('pdf')}
              className="flex flex-col items-center p-6 h-auto"
            >
              <div className="text-2xl mb-2">📄</div>
              <span>Export as PDF</span>
              <span className="text-xs text-gray-500 mt-1">Professional documents</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExport('png')}
              className="flex flex-col items-center p-6 h-auto"
            >
              <div className="text-2xl mb-2">🖼️</div>
              <span>Export as PNG</span>
              <span className="text-xs text-gray-500 mt-1">Social media posts</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExport('docx')}
              className="flex flex-col items-center p-6 h-auto"
            >
              <div className="text-2xl mb-2">📝</div>
              <span>Export as DOCX</span>
              <span className="text-xs text-gray-500 mt-1">Word documents</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExport('html')}
              className="flex flex-col items-center p-6 h-auto"
            >
              <div className="text-2xl mb-2">🌐</div>
              <span>Export as HTML</span>
              <span className="text-xs text-gray-500 mt-1">Web pages</span>
            </Button>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h4 className="font-medium text-indigo-900 mb-2">✨ Enhanced Features</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Live variable editing</li>
                <li>• Custom styling options</li>
                <li>• AI-powered variations</li>
                <li>• Multiple preview modes</li>
              </ul>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">🚀 Pro Features</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Watermark-free exports</li>
                <li>• Advanced formatting</li>
                <li>• Batch processing</li>
                <li>• Premium templates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}