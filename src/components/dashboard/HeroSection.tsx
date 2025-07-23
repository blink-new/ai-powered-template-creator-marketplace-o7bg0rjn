import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, DollarSign, Brain, Cpu } from 'lucide-react'

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full border border-indigo-200">
            <Brain className="h-5 w-5 text-indigo-600" />
            <span className="text-indigo-700 font-medium">10 Advanced AI Models</span>
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
              NEW
            </Badge>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Create Professional Templates in
          <span className="text-indigo-600"> Minutes</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Generate, customize, and sell professional templates with specialized AI models. 
          From Kimi Dev for documents to DeepCoder for web templates - each optimized for perfection.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
            onClick={onGetStarted}
          >
            <Zap className="mr-2 h-5 w-5" />
            Start Creating Templates
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-3 text-lg border-2"
          >
            <DollarSign className="mr-2 h-5 w-5" />
            Browse Marketplace
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Specialized AI Models</h3>
            <p className="text-gray-600 text-sm">10 advanced models including Kimi Dev, DeepCoder, and Mistral optimized for different template types</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Export</h3>
            <p className="text-gray-600 text-sm">Export to PDF, PNG, DOCX, or HTML with one click</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Monetize Templates</h3>
            <p className="text-gray-600 text-sm">Sell your templates in our marketplace and earn money</p>
          </div>
        </div>
      </div>
    </div>
  )
}