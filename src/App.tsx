import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { HeroSection } from '@/components/dashboard/HeroSection'
import { EnhancedTemplateCategories } from '@/components/dashboard/EnhancedTemplateCategories'
import { EnhancedTemplateCreator } from '@/components/creator/EnhancedTemplateCreator'
import { EnhancedTemplateEditor } from '@/components/editor/EnhancedTemplateEditor'
import { Marketplace } from '@/components/marketplace/Marketplace'
import { MyTemplates } from '@/components/dashboard/MyTemplates'
import { Analytics } from '@/components/analytics/Analytics'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { ModelShowcase } from '@/components/ai/ModelShowcase'
import { TemplateCategory, UserInput, Template } from '@/types/template'
import { blink } from '@/blink/client'

type AppState = 'dashboard' | 'creator' | 'editor' | 'marketplace' | 'my-templates' | 'analytics' | 'ai-models'

function App() {
  const [currentState, setCurrentState] = useState<AppState>('dashboard')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null)
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [userInput, setUserInput] = useState<UserInput>({})
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedTemplateForPurchase, setSelectedTemplateForPurchase] = useState<Template | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleGetStarted = () => {
    setCurrentState('dashboard')
    // Scroll to categories section
    setTimeout(() => {
      const element = document.getElementById('categories')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handleSelectCategory = (category: TemplateCategory) => {
    setSelectedCategory(category)
    setCurrentState('creator')
  }

  const handleTemplateGenerated = (content: string, input: UserInput) => {
    setGeneratedContent(content)
    setUserInput(input)
    setCurrentState('editor')
  }

  const handleBackToDashboard = () => {
    setCurrentState('dashboard')
    setSelectedCategory(null)
    setCurrentTemplate(null)
  }

  const handleBackToCreator = () => {
    setCurrentState('creator')
  }

  const handleNavigate = (view: AppState) => {
    setCurrentState(view)
    setSelectedCategory(null)
    setCurrentTemplate(null)
  }

  const handleCreateNew = () => {
    setCurrentState('dashboard')
  }

  const handleEditTemplate = (template: Template) => {
    setCurrentTemplate(template)
    // Convert template to the format expected by TemplateEditor
    setGeneratedContent(template.content)
    setUserInput({
      name: template.title,
      company: '',
      industry: template.category,
      tone: 'professional',
      audience: 'general'
    })
    setCurrentState('editor')
  }

  const handlePurchaseTemplate = (template: Template) => {
    setSelectedTemplateForPurchase(template)
    setPaymentModalOpen(true)
  }

  const handlePreviewTemplate = (template: Template) => {
    setCurrentTemplate(template)
    setGeneratedContent(template.content)
    setUserInput({
      name: template.title,
      company: '',
      industry: template.category,
      tone: 'professional',
      audience: 'general'
    })
    setCurrentState('editor')
  }

  const handlePaymentSuccess = () => {
    console.log('Payment successful!')
    // Optionally refresh the current view or show success message
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentView={currentState} onNavigate={handleNavigate} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentView={currentState} onNavigate={handleNavigate} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to TemplateAI</h2>
            <p className="text-gray-600">Please sign in to start creating templates</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentState} onNavigate={handleNavigate} />
      
      {currentState === 'dashboard' && (
        <main>
          <HeroSection onGetStarted={handleGetStarted} />
          
          <section id="categories" className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Choose Your Template Category
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Select from our professional template categories and let AI create 
                  exactly what you need in minutes
                </p>
              </div>
              
              <EnhancedTemplateCategories onSelectCategory={handleSelectCategory} />
            </div>
          </section>
        </main>
      )}
      
      {currentState === 'creator' && selectedCategory && (
        <EnhancedTemplateCreator
          category={selectedCategory}
          onBack={handleBackToDashboard}
          onTemplateGenerated={handleTemplateGenerated}
        />
      )}
      
      {currentState === 'editor' && (
        <EnhancedTemplateEditor
          content={generatedContent}
          userInput={userInput}
          onBack={handleBackToCreator}
        />
      )}

      {currentState === 'marketplace' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Marketplace 
            onPurchaseTemplate={handlePurchaseTemplate}
            onPreviewTemplate={handlePreviewTemplate}
          />
        </div>
      )}

      {currentState === 'my-templates' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MyTemplates 
            onCreateNew={handleCreateNew}
            onEditTemplate={handleEditTemplate}
          />
        </div>
      )}

      {currentState === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Analytics />
        </div>
      )}

      {currentState === 'ai-models' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ModelShowcase />
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        template={selectedTemplateForPurchase}
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false)
          setSelectedTemplateForPurchase(null)
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default App