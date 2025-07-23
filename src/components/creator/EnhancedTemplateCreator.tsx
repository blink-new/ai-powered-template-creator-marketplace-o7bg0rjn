import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Sparkles, Wand2, Cpu, Zap, Search, Image, Lightbulb, RefreshCw, Eye, Download } from 'lucide-react'
import { TemplateCategory, UserInput } from '@/types/template'
import { blink } from '@/blink/client'
import { getOpenRouterService, AI_MODELS } from '@/services/openrouter'

interface TemplateCreatorProps {
  category: TemplateCategory
  onBack: () => void
  onTemplateGenerated: (content: string, userInput: UserInput) => void
}

interface AISuggestion {
  id: string
  title: string
  description: string
  fields: Record<string, string>
  prompt?: string
}

interface GeneratedImage {
  url: string
  prompt: string
  alt: string
}

const categoryFields = {
  documents: [
    { key: 'name', label: 'Full Name', type: 'text', required: true },
    { key: 'company', label: 'Company', type: 'text', required: false },
    { key: 'position', label: 'Position/Title', type: 'text', required: false },
    { key: 'industry', label: 'Industry', type: 'text', required: false },
    { key: 'tone', label: 'Tone', type: 'select', required: true, options: ['Professional', 'Friendly', 'Formal', 'Creative'] },
    { key: 'experience', label: 'Years of Experience', type: 'number', required: false },
    { key: 'skills', label: 'Key Skills', type: 'textarea', required: false }
  ],
  designs: [
    { key: 'title', label: 'Design Title', type: 'text', required: true },
    { key: 'company', label: 'Company/Brand', type: 'text', required: false },
    { key: 'description', label: 'Description', type: 'textarea', required: false },
    { key: 'style', label: 'Style', type: 'select', required: true, options: ['Modern', 'Minimalist', 'Bold', 'Elegant', 'Playful', 'Corporate', 'Creative'] },
    { key: 'colors', label: 'Color Preference', type: 'text', required: false },
    { key: 'target_audience', label: 'Target Audience', type: 'text', required: false },
    { key: 'call_to_action', label: 'Call to Action', type: 'text', required: false }
  ],
  web: [
    { key: 'siteName', label: 'Website Name', type: 'text', required: true },
    { key: 'company', label: 'Company', type: 'text', required: false },
    { key: 'description', label: 'Website Description', type: 'textarea', required: true },
    { key: 'industry', label: 'Industry', type: 'text', required: false },
    { key: 'style', label: 'Style', type: 'select', required: true, options: ['Corporate', 'Creative', 'E-commerce', 'Portfolio', 'Blog', 'SaaS', 'Agency'] },
    { key: 'features', label: 'Key Features', type: 'textarea', required: false },
    { key: 'target_audience', label: 'Target Audience', type: 'text', required: false }
  ],
  presentations: [
    { key: 'title', label: 'Presentation Title', type: 'text', required: true },
    { key: 'company', label: 'Company', type: 'text', required: false },
    { key: 'audience', label: 'Target Audience', type: 'text', required: true },
    { key: 'purpose', label: 'Purpose', type: 'select', required: true, options: ['Pitch', 'Training', 'Report', 'Marketing', 'Educational', 'Sales', 'Product Launch'] },
    { key: 'duration', label: 'Duration (minutes)', type: 'number', required: false },
    { key: 'key_points', label: 'Key Points', type: 'textarea', required: false },
    { key: 'tone', label: 'Tone', type: 'select', required: false, options: ['Professional', 'Casual', 'Persuasive', 'Educational', 'Inspiring'] }
  ],
  email: [
    { key: 'subject', label: 'Email Subject', type: 'text', required: true },
    { key: 'company', label: 'Company', type: 'text', required: false },
    { key: 'audience', label: 'Target Audience', type: 'text', required: true },
    { key: 'purpose', label: 'Email Purpose', type: 'select', required: true, options: ['Newsletter', 'Promotion', 'Welcome', 'Follow-up', 'Announcement', 'Social Media Campaign', 'Product Launch'] },
    { key: 'tone', label: 'Tone', type: 'select', required: true, options: ['Professional', 'Friendly', 'Casual', 'Urgent', 'Exciting'] },
    { key: 'call_to_action', label: 'Call to Action', type: 'text', required: false },
    { key: 'pain_points', label: 'Pain Points to Address', type: 'textarea', required: false }
  ],
  video: [
    { key: 'title', label: 'Video Title', type: 'text', required: true },
    { key: 'platform', label: 'Platform', type: 'select', required: true, options: ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'LinkedIn', 'Twitter'] },
    { key: 'duration', label: 'Duration (minutes)', type: 'number', required: true },
    { key: 'audience', label: 'Target Audience', type: 'text', required: true },
    { key: 'purpose', label: 'Video Purpose', type: 'select', required: true, options: ['Tutorial', 'Product Demo', 'Entertainment', 'Educational', 'Marketing', 'Testimonial'] },
    { key: 'tone', label: 'Tone', type: 'select', required: true, options: ['Casual', 'Professional', 'Energetic', 'Informative', 'Funny'] },
    { key: 'key_points', label: 'Key Points', type: 'textarea', required: false }
  ],
  events: [
    { key: 'event_name', label: 'Event Name', type: 'text', required: true },
    { key: 'event_type', label: 'Event Type', type: 'select', required: true, options: ['Conference', 'Workshop', 'Webinar', 'Networking', 'Product Launch', 'Training', 'Social'] },
    { key: 'date', label: 'Event Date', type: 'text', required: true },
    { key: 'location', label: 'Location/Platform', type: 'text', required: true },
    { key: 'audience', label: 'Target Audience', type: 'text', required: true },
    { key: 'description', label: 'Event Description', type: 'textarea', required: false },
    { key: 'organizer', label: 'Organizer', type: 'text', required: false }
  ],
  ecommerce: [
    { key: 'product_name', label: 'Product Name', type: 'text', required: true },
    { key: 'category', label: 'Product Category', type: 'text', required: true },
    { key: 'price', label: 'Price', type: 'text', required: false },
    { key: 'target_audience', label: 'Target Audience', type: 'text', required: true },
    { key: 'key_features', label: 'Key Features', type: 'textarea', required: true },
    { key: 'benefits', label: 'Main Benefits', type: 'textarea', required: false },
    { key: 'brand_tone', label: 'Brand Tone', type: 'select', required: true, options: ['Professional', 'Friendly', 'Luxury', 'Casual', 'Technical'] }
  ],
  social: [
    { key: 'platform', label: 'Social Platform', type: 'select', required: true, options: ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok', 'Pinterest', 'YouTube'] },
    { key: 'content_type', label: 'Content Type', type: 'select', required: true, options: ['Post', 'Story', 'Reel', 'Thread', 'Carousel', 'Video', 'Live'] },
    { key: 'topic', label: 'Topic/Theme', type: 'text', required: true },
    { key: 'audience', label: 'Target Audience', type: 'text', required: true },
    { key: 'goal', label: 'Goal', type: 'select', required: true, options: ['Engagement', 'Brand Awareness', 'Sales', 'Education', 'Entertainment', 'Community Building'] },
    { key: 'tone', label: 'Tone', type: 'select', required: true, options: ['Casual', 'Professional', 'Funny', 'Inspiring', 'Educational'] },
    { key: 'hashtags', label: 'Key Hashtags', type: 'text', required: false }
  ],
  educational: [
    { key: 'course_title', label: 'Course/Lesson Title', type: 'text', required: true },
    { key: 'subject', label: 'Subject Area', type: 'text', required: true },
    { key: 'level', label: 'Level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] },
    { key: 'duration', label: 'Duration', type: 'text', required: false },
    { key: 'learning_objectives', label: 'Learning Objectives', type: 'textarea', required: true },
    { key: 'target_audience', label: 'Target Audience', type: 'text', required: true },
    { key: 'teaching_method', label: 'Teaching Method', type: 'select', required: false, options: ['Lecture', 'Interactive', 'Hands-on', 'Discussion', 'Project-based'] }
  ]
}

// AI Suggestions for each category
const aiSuggestions: Record<TemplateCategory, AISuggestion[]> = {
  documents: [
    {
      id: 'tech-resume',
      title: 'Tech Professional Resume',
      description: 'Modern resume for software developers and tech professionals',
      fields: {
        name: 'Alex Johnson',
        company: 'TechCorp',
        position: 'Senior Software Engineer',
        industry: 'Technology',
        tone: 'Professional',
        experience: '5',
        skills: 'JavaScript, React, Node.js, Python, AWS, Docker'
      }
    },
    {
      id: 'marketing-resume',
      title: 'Marketing Manager Resume',
      description: 'Creative resume for marketing and brand professionals',
      fields: {
        name: 'Sarah Chen',
        company: 'BrandStudio',
        position: 'Marketing Manager',
        industry: 'Marketing',
        tone: 'Creative',
        experience: '7',
        skills: 'Digital Marketing, SEO, Content Strategy, Analytics, Social Media'
      }
    },
    {
      id: 'business-contract',
      title: 'Service Agreement Contract',
      description: 'Professional service agreement template',
      fields: {
        name: 'Professional Services LLC',
        company: 'Client Company',
        position: 'Service Provider',
        industry: 'Consulting',
        tone: 'Formal'
      }
    }
  ],
  designs: [
    {
      id: 'social-media-post',
      title: 'Instagram Post Design',
      description: 'Eye-catching social media post for engagement',
      fields: {
        title: 'Summer Sale Announcement',
        company: 'Fashion Brand',
        description: 'Promote 50% off summer collection with vibrant visuals',
        style: 'Bold',
        colors: 'Bright orange and pink gradient',
        target_audience: 'Young adults 18-35',
        call_to_action: 'Shop Now - 50% Off!'
      }
    },
    {
      id: 'business-flyer',
      title: 'Corporate Event Flyer',
      description: 'Professional flyer for business events',
      fields: {
        title: 'Annual Business Conference 2024',
        company: 'Business Network Inc',
        description: 'Join industry leaders for networking and insights',
        style: 'Corporate',
        colors: 'Navy blue and gold',
        target_audience: 'Business professionals',
        call_to_action: 'Register Today'
      }
    },
    {
      id: 'product-banner',
      title: 'Product Launch Banner',
      description: 'Exciting banner for new product announcements',
      fields: {
        title: 'Revolutionary AI Assistant',
        company: 'TechStart',
        description: 'The future of productivity is here',
        style: 'Modern',
        colors: 'Electric blue and white',
        target_audience: 'Tech enthusiasts',
        call_to_action: 'Get Early Access'
      }
    }
  ],
  web: [
    {
      id: 'saas-landing',
      title: 'SaaS Landing Page',
      description: 'High-converting landing page for SaaS products',
      fields: {
        siteName: 'ProductivityPro',
        company: 'StartupCo',
        description: 'Streamline your workflow with our all-in-one productivity suite',
        industry: 'Software',
        style: 'SaaS',
        features: 'Task management, Team collaboration, Time tracking, Analytics dashboard',
        target_audience: 'Small to medium businesses'
      }
    },
    {
      id: 'portfolio-site',
      title: 'Creative Portfolio',
      description: 'Stunning portfolio for creative professionals',
      fields: {
        siteName: 'Creative Studio',
        company: 'Freelance Designer',
        description: 'Award-winning design solutions for modern brands',
        industry: 'Design',
        style: 'Creative',
        features: 'Project showcase, Client testimonials, Contact form, Blog',
        target_audience: 'Potential clients and collaborators'
      }
    },
    {
      id: 'ecommerce-store',
      title: 'E-commerce Store',
      description: 'Modern online store with great UX',
      fields: {
        siteName: 'StyleHub',
        company: 'Fashion Retailer',
        description: 'Discover the latest trends in sustainable fashion',
        industry: 'Fashion',
        style: 'E-commerce',
        features: 'Product catalog, Shopping cart, User accounts, Reviews',
        target_audience: 'Fashion-conscious consumers'
      }
    }
  ],
  presentations: [
    {
      id: 'startup-pitch',
      title: 'Startup Pitch Deck',
      description: 'Compelling pitch deck for investors',
      fields: {
        title: 'EcoTech Solutions - Series A Pitch',
        company: 'EcoTech',
        audience: 'Venture capitalists and angel investors',
        purpose: 'Pitch',
        duration: '15',
        key_points: 'Problem statement, Market opportunity, Solution overview, Business model, Traction, Team, Funding ask',
        tone: 'Persuasive'
      }
    },
    {
      id: 'product-launch',
      title: 'Product Launch Presentation',
      description: 'Exciting presentation for new product reveals',
      fields: {
        title: 'Introducing AI Assistant 2.0',
        company: 'TechCorp',
        audience: 'Customers and media',
        purpose: 'Product Launch',
        duration: '30',
        key_points: 'Product features, Benefits, Pricing, Availability, Demo',
        tone: 'Inspiring'
      }
    },
    {
      id: 'training-module',
      title: 'Employee Training Module',
      description: 'Comprehensive training presentation',
      fields: {
        title: 'Digital Marketing Fundamentals',
        company: 'Marketing Agency',
        audience: 'New employees',
        purpose: 'Training',
        duration: '60',
        key_points: 'SEO basics, Social media strategy, Content marketing, Analytics',
        tone: 'Educational'
      }
    }
  ],
  email: [
    {
      id: 'social-campaign',
      title: 'Social Media Campaign Email',
      description: 'Email promoting social media engagement',
      fields: {
        subject: 'Join Our #SummerVibes Challenge!',
        company: 'Lifestyle Brand',
        audience: 'Social media followers and customers',
        purpose: 'Social Media Campaign',
        tone: 'Exciting',
        call_to_action: 'Share Your Summer Moment',
        pain_points: 'Lack of engagement, Need for user-generated content'
      }
    },
    {
      id: 'product-promo',
      title: 'Product Promotion Email',
      description: 'Compelling email for product promotions',
      fields: {
        subject: 'Exclusive 48-Hour Flash Sale Inside!',
        company: 'E-commerce Store',
        audience: 'Email subscribers',
        purpose: 'Promotion',
        tone: 'Urgent',
        call_to_action: 'Shop Now - Limited Time',
        pain_points: 'High prices, Fear of missing out'
      }
    },
    {
      id: 'welcome-series',
      title: 'Welcome Email Series',
      description: 'Warm welcome email for new subscribers',
      fields: {
        subject: 'Welcome to the Family! Here\'s What\'s Next...',
        company: 'SaaS Platform',
        audience: 'New users',
        purpose: 'Welcome',
        tone: 'Friendly',
        call_to_action: 'Complete Your Setup',
        pain_points: 'Onboarding confusion, Feature discovery'
      }
    }
  ]
}

export function EnhancedTemplateCreator({ category, onBack, onTemplateGenerated }: TemplateCreatorProps) {
  const [userInput, setUserInput] = useState<UserInput>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [useAdvancedAI, setUseAdvancedAI] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [socialMediaInsights, setSocialMediaInsights] = useState<string[]>([])
  const [isSearchingInsights, setIsSearchingInsights] = useState(false)
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  const fields = categoryFields[category]
  const openRouterService = getOpenRouterService()
  const recommendedModel = openRouterService.selectBestModel(category)
  const suggestions = aiSuggestions[category]

  const generateTemplateImages = useCallback(async () => {
    if (!userInput.title || !userInput.style) return

    setIsGeneratingImages(true)
    try {
      const imagePrompts = [
        `${userInput.style} design for "${userInput.title}" with ${userInput.colors || 'professional colors'}`,
        `Modern ${userInput.style} layout for ${userInput.title} targeting ${userInput.target_audience || 'general audience'}`,
        `Creative ${userInput.style} visual for "${userInput.title}" with clean typography`
      ]

      const imagePromises = imagePrompts.map(async (prompt) => {
        try {
          const { data } = await blink.ai.generateImage({
            prompt,
            size: '1024x1024',
            quality: 'high',
            n: 1
          })
          
          return {
            url: data[0].url,
            prompt,
            alt: `Generated image for ${userInput.title}`
          }
        } catch (error) {
          console.error('Error generating image:', error)
          return null
        }
      })

      const results = await Promise.all(imagePromises)
      const validImages = results.filter(img => img !== null) as GeneratedImage[]
      setGeneratedImages(validImages)
    } catch (error) {
      console.error('Error generating template images:', error)
    } finally {
      setIsGeneratingImages(false)
    }
  }, [userInput.title, userInput.style, userInput.colors, userInput.target_audience])

  useEffect(() => {
    // Auto-generate images for design templates
    if (category === 'designs' && userInput.title && userInput.style) {
      generateTemplateImages()
    }
  }, [userInput.title, userInput.style, category, generateTemplateImages])

  const handleInputChange = (key: string, value: string | number) => {
    setUserInput(prev => ({ ...prev, [key]: value }))
  }

  const applySuggestion = (suggestion: AISuggestion) => {
    setUserInput(suggestion.fields)
  }

  const enhancePrompt = async (currentPrompt: string) => {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Enhance this template creation prompt to be more detailed and specific. Original prompt: "${currentPrompt}". Make it more comprehensive and include specific formatting instructions.`,
        model: 'gpt-4o-mini',
        maxTokens: 500
      })
      return text
    } catch (error) {
      console.error('Error enhancing prompt:', error)
      return currentPrompt
    }
  }

  const searchSocialMediaInsights = async () => {
    if (category !== 'email' || !userInput.audience) return

    setIsSearchingInsights(true)
    try {
      // Use web search to find social media pain points
      const searchResults = await blink.data.search(`${userInput.audience} social media pain points problems challenges`, {
        type: 'news',
        limit: 10
      })

      const insights: string[] = []
      
      if (searchResults.news_results) {
        searchResults.news_results.forEach(result => {
          if (result.snippet) {
            insights.push(result.snippet)
          }
        })
      }

      if (searchResults.organic_results) {
        searchResults.organic_results.slice(0, 5).forEach(result => {
          if (result.snippet) {
            insights.push(result.snippet)
          }
        })
      }

      // Extract key pain points using AI
      if (insights.length > 0) {
        const { text } = await blink.ai.generateText({
          prompt: `Analyze these search results about ${userInput.audience} and extract 5 key pain points or challenges they face on social media: ${insights.join(' ')}. Return as a simple list.`,
          model: 'gpt-4o-mini',
          maxTokens: 300
        })
        
        const painPoints = text.split('\n').filter(point => point.trim().length > 0).slice(0, 5)
        setSocialMediaInsights(painPoints)
        
        // Auto-fill pain points field
        setUserInput(prev => ({ 
          ...prev, 
          pain_points: painPoints.join('\n') 
        }))
      }
    } catch (error) {
      console.error('Error searching social media insights:', error)
    } finally {
      setIsSearchingInsights(false)
    }
  }

  const createPrompt = (category: TemplateCategory, input: UserInput): string => {
    const basePrompts = {
      documents: `Create a professional ${input.position || 'document'} template for ${input.name || 'the user'}. Company: ${input.company || 'N/A'}. Industry: ${input.industry || 'General'}. Tone: ${input.tone || 'Professional'}. Experience: ${input.experience || 'N/A'} years. Skills: ${input.skills || 'N/A'}. Include placeholder variables like {{name}}, {{company}}, {{position}}, {{skills}} for easy customization. Make it ATS-friendly and modern.`,
      designs: `Create a ${input.style || 'modern'} design template for "${input.title || 'Design'}". Company/Brand: ${input.company || 'N/A'}. Description: ${input.description || 'N/A'}. Colors: ${input.colors || 'Professional colors'}. Target Audience: ${input.target_audience || 'General'}. Call to Action: ${input.call_to_action || 'Learn More'}. Provide HTML/CSS structure with placeholder variables and responsive design.`,
      web: `Create a ${input.style || 'modern'} website template for "${input.siteName || 'Website'}". Company: ${input.company || 'N/A'}. Description: ${input.description || 'N/A'}. Industry: ${input.industry || 'General'}. Features: ${input.features || 'Standard features'}. Target Audience: ${input.target_audience || 'General'}. Include HTML structure with placeholder variables, responsive design, and modern UI components.`,
      presentations: `Create a ${input.purpose || 'professional'} presentation template titled "${input.title || 'Presentation'}". Company: ${input.company || 'N/A'}. Audience: ${input.audience || 'General'}. Duration: ${input.duration || 'N/A'} minutes. Key Points: ${input.key_points || 'Standard content'}. Tone: ${input.tone || 'Professional'}. Include slide structure with placeholder variables and speaker notes.`,
      email: `Create a ${input.purpose || 'professional'} email template with subject "${input.subject || 'Email'}". Company: ${input.company || 'N/A'}. Audience: ${input.audience || 'General'}. Tone: ${input.tone || 'Professional'}. Call to Action: ${input.call_to_action || 'Learn More'}. Pain Points: ${input.pain_points || 'General challenges'}. Include HTML email structure with placeholder variables and mobile-responsive design.`
    }
    
    return basePrompts[category]
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      let generatedContent: string
      const prompt = createPrompt(category, userInput)
      const enhancedPrompt = await enhancePrompt(prompt)

      if (useAdvancedAI) {
        // Use OpenRouter with specialized models
        const modelToUse = selectedModel || recommendedModel.name.toLowerCase().replace(/\s+/g, '-')
        
        // Use specialized generation methods based on category
        switch (category) {
          case 'documents':
            generatedContent = await openRouterService.generateDocumentTemplate(
              userInput.position as string || 'document',
              userInput
            )
            break
          case 'designs':
            generatedContent = await openRouterService.generateDesignTemplate(
              userInput.title as string || 'design',
              userInput
            )
            break
          case 'web':
            generatedContent = await openRouterService.generateWebTemplate(
              userInput.style as string || 'website',
              userInput
            )
            break
          case 'presentations':
            generatedContent = await openRouterService.generatePresentationTemplate(
              userInput.purpose as string || 'presentation',
              userInput
            )
            break
          case 'email':
            generatedContent = await openRouterService.generateEmailTemplate(
              userInput.purpose as string || 'email',
              userInput
            )
            break
          default:
            generatedContent = await openRouterService.generateContent(
              enhancedPrompt,
              category
            )
        }
      } else {
        // Fallback to Blink AI
        const { text } = await blink.ai.generateText({
          prompt: enhancedPrompt,
          model: 'gpt-4o-mini',
          maxTokens: 2000
        })
        
        generatedContent = text
      }
      
      setGeneratedTemplate(generatedContent)
      setShowPreview(true)
    } catch (error) {
      console.error('Error generating template:', error)
      
      // Fallback to Blink AI if OpenRouter fails
      if (useAdvancedAI) {
        try {
          const prompt = createPrompt(category, userInput)
          const { text } = await blink.ai.generateText({
            prompt,
            model: 'gpt-4o-mini',
            maxTokens: 2000
          })
          setGeneratedTemplate(text)
          setShowPreview(true)
        } catch (fallbackError) {
          console.error('Fallback generation also failed:', fallbackError)
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseTemplate = () => {
    onTemplateGenerated(generatedTemplate, userInput)
  }

  const isFormValid = fields.filter(field => field.required).every(field => 
    userInput[field.key] && userInput[field.key].toString().trim() !== ''
  )

  if (showPreview) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setShowPreview(false)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Template Preview
          </h1>
          <p className="text-gray-600">
            Review your generated template and make any final adjustments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-indigo-600" />
                    Generated Template
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                    <Button size="sm" onClick={handleUseTemplate}>
                      <Download className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg border max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {generatedTemplate}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Category</Label>
                  <p className="text-sm">{category.charAt(0).toUpperCase() + category.slice(1)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">AI Model</Label>
                  <p className="text-sm">{useAdvancedAI ? (selectedModel ? AI_MODELS[selectedModel]?.name : recommendedModel.name) : 'Blink AI'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Generated</Label>
                  <p className="text-sm">{new Date().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {generatedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Image className="mr-2 h-4 w-4" />
                    Generated Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {generatedImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={img.url} 
                          alt={img.alt}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <div className="absolute bottom-2 left-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            AI Generated
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create {category.charAt(0).toUpperCase() + category.slice(1)} Template
        </h1>
        <p className="text-gray-600">
          Use AI suggestions, web search insights, and automatic image generation for the perfect template
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Template</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="images">Image Generator</TabsTrigger>
          <TabsTrigger value="insights">Social Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wand2 className="mr-2 h-5 w-5 text-indigo-600" />
                  Template Details
                </CardTitle>
                <CardDescription>
                  Provide information to customize your template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {field.type === 'text' && (
                      <Input
                        id={field.key}
                        value={userInput[field.key] as string || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                    
                    {field.type === 'textarea' && (
                      <Textarea
                        id={field.key}
                        value={userInput[field.key] as string || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        rows={3}
                      />
                    )}
                    
                    {field.type === 'number' && (
                      <Input
                        id={field.key}
                        type="number"
                        value={userInput[field.key] as number || ''}
                        onChange={(e) => handleInputChange(field.key, parseInt(e.target.value) || 0)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                    
                    {field.type === 'select' && field.options && (
                      <Select
                        value={userInput[field.key] as string || ''}
                        onValueChange={(value) => handleInputChange(field.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="mr-2 h-5 w-5 text-indigo-600" />
                  AI Model Selection
                </CardTitle>
                <CardDescription>
                  Choose your AI generation method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="advanced-ai"
                      checked={useAdvancedAI}
                      onChange={() => setUseAdvancedAI(true)}
                      className="text-indigo-600"
                    />
                    <Label htmlFor="advanced-ai" className="flex items-center">
                      <Zap className="mr-1 h-4 w-4 text-amber-500" />
                      Advanced AI Models
                      <Badge variant="secondary" className="ml-2">Recommended</Badge>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="standard-ai"
                      checked={!useAdvancedAI}
                      onChange={() => setUseAdvancedAI(false)}
                      className="text-indigo-600"
                    />
                    <Label htmlFor="standard-ai">Standard AI (Blink)</Label>
                  </div>
                </div>

                {useAdvancedAI && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border">
                      <h4 className="font-medium text-indigo-900 mb-2 flex items-center">
                        <Sparkles className="mr-1 h-4 w-4" />
                        Recommended Model
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-indigo-800">{recommendedModel.name}</span>
                          <Badge variant="outline" className="text-xs">Best for {category}</Badge>
                        </div>
                        <p className="text-sm text-indigo-700">{recommendedModel.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {recommendedModel.bestFor.map((use) => (
                            <Badge key={use} variant="secondary" className="text-xs">
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Alternative Models (Optional)</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Use recommended model" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(AI_MODELS).map(([key, model]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex flex-col">
                                <span>{model.name}</span>
                                <span className="text-xs text-gray-500">{model.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-indigo-600" />
                  AI Generation
                </CardTitle>
                <CardDescription>
                  Generate your template with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h4 className="font-medium text-indigo-900 mb-2">Enhanced Features</h4>
                    <ul className="text-sm text-indigo-700 space-y-1">
                      <li>• AI-powered prompt enhancement</li>
                      <li>• {useAdvancedAI ? 'Specialized model' : 'Standard AI'} generates content</li>
                      <li>• Automatic image generation (designs)</li>
                      <li>• Social media insights (email campaigns)</li>
                      <li>• Live preview with export options</li>
                    </ul>
                  </div>
                  
                  {useAdvancedAI && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200">
                      <div className="flex items-center text-amber-800 text-sm">
                        <Zap className="mr-1 h-4 w-4" />
                        Using {selectedModel ? AI_MODELS[selectedModel]?.name : recommendedModel.name} for enhanced results
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleGenerate}
                    disabled={!isFormValid || isGenerating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating Template...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Template
                      </>
                    )}
                  </Button>
                  
                  {!isFormValid && (
                    <p className="text-sm text-gray-500 text-center">
                      Please fill in all required fields to continue
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                AI Suggestions for {category.charAt(0).toUpperCase() + category.slice(1)}
              </CardTitle>
              <CardDescription>
                Click any suggestion to auto-fill all fields with professional examples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-indigo-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <CardDescription className="text-sm">{suggestion.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        {Object.entries(suggestion.fields).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium text-gray-600">{key}:</span>
                            <span className="ml-2 text-gray-800">{value.toString().slice(0, 30)}...</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        onClick={() => applySuggestion(suggestion)}
                        className="w-full"
                        variant="outline"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Use This Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="mr-2 h-5 w-5 text-purple-600" />
                AI Image Generator
              </CardTitle>
              <CardDescription>
                Generate custom images for your templates automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-Generate Images</h3>
                    <p className="text-sm text-gray-600">Images are automatically generated based on your template details</p>
                  </div>
                  <Button 
                    onClick={generateTemplateImages}
                    disabled={isGeneratingImages || !userInput.title}
                    variant="outline"
                  >
                    {isGeneratingImages ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate Images
                      </>
                    )}
                  </Button>
                </div>

                {generatedImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedImages.map((img, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <img 
                            src={img.url} 
                            alt={img.alt}
                            className="w-full h-48 object-cover rounded-lg border mb-3"
                          />
                          <div className="space-y-2">
                            <Badge variant="secondary" className="text-xs">
                              AI Generated
                            </Badge>
                            <p className="text-sm text-gray-600">{img.prompt.slice(0, 80)}...</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Generated Yet</h3>
                    <p className="text-gray-600 mb-4">Fill in your template details and click "Generate Images" to create custom visuals</p>
                    {!userInput.title && (
                      <p className="text-sm text-amber-600">Please add a title first to generate images</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5 text-green-600" />
                Social Media Insights
              </CardTitle>
              <CardDescription>
                Search for real-time pain points and trends to enhance your email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Search Social Media Pain Points</h3>
                    <p className="text-sm text-gray-600">Find current challenges your audience faces on social platforms</p>
                  </div>
                  <Button 
                    onClick={searchSocialMediaInsights}
                    disabled={isSearchingInsights || !userInput.audience || category !== 'email'}
                    variant="outline"
                  >
                    {isSearchingInsights ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search Insights
                      </>
                    )}
                  </Button>
                </div>

                {category !== 'email' && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-amber-800 text-sm">
                      Social media insights are currently available for email templates only.
                    </p>
                  </div>
                )}

                {!userInput.audience && category === 'email' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-800 text-sm">
                      Please specify your target audience first to search for relevant insights.
                    </p>
                  </div>
                )}

                {socialMediaInsights.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Discovered Pain Points:</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {socialMediaInsights.map((insight, index) => (
                        <Card key={index} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-700">{insight}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-green-800 text-sm">
                        ✅ These insights have been automatically added to your "Pain Points to Address" field.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Found Yet</h3>
                    <p className="text-gray-600 mb-4">Search for social media pain points to enhance your email campaigns</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}