import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cpu, Zap, Brain, Code, Eye, Sparkles, ChevronRight } from 'lucide-react'
import { AI_MODELS } from '@/services/openrouter'

interface ModelShowcaseProps {
  onSelectModel?: (modelKey: string) => void
  selectedCategory?: string
}

const modelIcons = {
  'mistral-small': Sparkles,
  'kimi-dev': Brain,
  'deepcoder': Code,
  'kimi-vl': Eye,
  'qwen3': Cpu,
  'deepseek-r1': Brain,
  'llama-nemotron': Zap,
  'gemma-3n': Sparkles,
  'mai-ds': Cpu,
  'qwq-32b': Brain
}

const categoryColors = {
  documents: 'bg-blue-50 text-blue-700 border-blue-200',
  designs: 'bg-purple-50 text-purple-700 border-purple-200',
  web: 'bg-green-50 text-green-700 border-green-200',
  presentations: 'bg-orange-50 text-orange-700 border-orange-200',
  email: 'bg-pink-50 text-pink-700 border-pink-200',
  marketing: 'bg-red-50 text-red-700 border-red-200',
  copywriting: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  technical: 'bg-gray-50 text-gray-700 border-gray-200'
}

export function ModelShowcase({ onSelectModel, selectedCategory }: ModelShowcaseProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  const handleModelSelect = (modelKey: string) => {
    setSelectedModel(modelKey)
    onSelectModel?.(modelKey)
  }

  const getFilteredModels = (category?: string) => {
    if (!category) return Object.entries(AI_MODELS)
    
    return Object.entries(AI_MODELS).filter(([, model]) =>
      model.bestFor.some(use => 
        use.includes(category.toLowerCase()) || 
        category.toLowerCase().includes(use)
      )
    )
  }

  const filteredModels = getFilteredModels(selectedCategory)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Advanced AI Models
        </h2>
        <p className="text-gray-600">
          Specialized AI models optimized for different template types and use cases
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Models</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="designs">Designs</TabsTrigger>
          <TabsTrigger value="web">Web</TabsTrigger>
          <TabsTrigger value="presentations">Presentations</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(AI_MODELS).map(([key, model]) => {
              const IconComponent = modelIcons[key as keyof typeof modelIcons] || Cpu
              const isSelected = selectedModel === key
              
              return (
                <Card 
                  key={key} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                  }`}
                  onClick={() => handleModelSelect(key)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="bg-indigo-600">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {model.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Best for:</p>
                        <div className="flex flex-wrap gap-1">
                          {model.bestFor.map((use) => (
                            <Badge 
                              key={use} 
                              variant="outline" 
                              className={`text-xs ${
                                categoryColors[use as keyof typeof categoryColors] || 
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {onSelectModel && (
                        <Button 
                          variant={isSelected ? "default" : "outline"} 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleModelSelect(key)
                          }}
                        >
                          {isSelected ? 'Selected' : 'Select Model'}
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {['documents', 'designs', 'web', 'presentations', 'email'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredModels(category).map(([key, model]) => {
                const IconComponent = modelIcons[key as keyof typeof modelIcons] || Cpu
                const isSelected = selectedModel === key
                
                return (
                  <Card 
                    key={key} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                    }`}
                    onClick={() => handleModelSelect(key)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-5 w-5 text-indigo-600" />
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Optimized for {category}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {model.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Capabilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {model.bestFor.map((use) => (
                              <Badge 
                                key={use} 
                                variant="outline" 
                                className={`text-xs ${
                                  categoryColors[use as keyof typeof categoryColors] || 
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {use}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {onSelectModel && (
                          <Button 
                            variant={isSelected ? "default" : "outline"} 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleModelSelect(key)
                            }}
                          >
                            {isSelected ? 'Selected' : 'Use This Model'}
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            {getFilteredModels(category).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No specialized models found for {category}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Our general-purpose models can still handle {category} templates effectively
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {selectedModel && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {(() => {
                  const IconComponent = modelIcons[selectedModel as keyof typeof modelIcons] || Cpu
                  return <IconComponent className="h-6 w-6 text-indigo-600" />
                })()}
              </div>
              <div>
                <h3 className="font-medium text-indigo-900">
                  {AI_MODELS[selectedModel]?.name} Selected
                </h3>
                <p className="text-sm text-indigo-700">
                  This model will be used for your template generation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}