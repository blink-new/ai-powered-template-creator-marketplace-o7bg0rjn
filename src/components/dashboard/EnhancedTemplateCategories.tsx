import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Palette, Globe, Presentation, Mail, Video, Calendar, ShoppingCart, Users, BookOpen } from 'lucide-react'
import { TemplateCategory } from '@/types/template'

interface TemplateCategoriesProps {
  onSelectCategory: (category: TemplateCategory) => void
}

const categories = [
  {
    id: 'documents' as TemplateCategory,
    title: 'Document Templates',
    description: 'Professional documents, contracts, and business forms',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'hover:border-blue-200',
    examples: ['Resume', 'Contract', 'Invoice', 'Report', 'Proposal', 'Legal Doc'],
    popular: true,
    count: '50+ templates'
  },
  {
    id: 'designs' as TemplateCategory,
    title: 'Design Templates',
    description: 'Eye-catching graphics, social media posts, and marketing materials',
    icon: Palette,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'hover:border-purple-200',
    examples: ['Social Post', 'Flyer', 'Banner', 'Logo', 'Infographic', 'Poster'],
    popular: true,
    count: '75+ templates'
  },
  {
    id: 'web' as TemplateCategory,
    title: 'Web Templates',
    description: 'Modern websites, landing pages, and web applications',
    icon: Globe,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'hover:border-green-200',
    examples: ['Landing Page', 'Portfolio', 'SaaS Site', 'E-commerce', 'Blog', 'Agency'],
    popular: false,
    count: '40+ templates'
  },
  {
    id: 'presentations' as TemplateCategory,
    title: 'Presentation Templates',
    description: 'Compelling pitch decks, slides, and business presentations',
    icon: Presentation,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'hover:border-orange-200',
    examples: ['Pitch Deck', 'Training', 'Sales Deck', 'Report', 'Webinar', 'Conference'],
    popular: true,
    count: '35+ templates'
  },
  {
    id: 'email' as TemplateCategory,
    title: 'Email & Marketing',
    description: 'High-converting emails, newsletters, and marketing campaigns',
    icon: Mail,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'hover:border-red-200',
    examples: ['Newsletter', 'Promotion', 'Welcome', 'Social Campaign', 'Product Launch', 'Follow-up'],
    popular: true,
    count: '60+ templates'
  },
  {
    id: 'video' as TemplateCategory,
    title: 'Video Scripts',
    description: 'YouTube scripts, video ads, and social media video content',
    icon: Video,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'hover:border-pink-200',
    examples: ['YouTube Script', 'Video Ad', 'Tutorial', 'Explainer', 'Social Video', 'Testimonial'],
    popular: false,
    count: '25+ templates',
    new: true
  },
  {
    id: 'events' as TemplateCategory,
    title: 'Event Templates',
    description: 'Event planning, invitations, and promotional materials',
    icon: Calendar,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'hover:border-indigo-200',
    examples: ['Invitation', 'Event Page', 'Program', 'Ticket', 'Announcement', 'Schedule'],
    popular: false,
    count: '30+ templates',
    new: true
  },
  {
    id: 'ecommerce' as TemplateCategory,
    title: 'E-commerce',
    description: 'Product descriptions, store pages, and sales materials',
    icon: ShoppingCart,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'hover:border-emerald-200',
    examples: ['Product Page', 'Store Layout', 'Sales Copy', 'Category Page', 'Checkout', 'Reviews'],
    popular: false,
    count: '20+ templates',
    new: true
  },
  {
    id: 'social' as TemplateCategory,
    title: 'Social Media',
    description: 'Social media content, captions, and engagement posts',
    icon: Users,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'hover:border-cyan-200',
    examples: ['Instagram Post', 'Twitter Thread', 'LinkedIn Post', 'TikTok Script', 'Stories', 'Captions'],
    popular: true,
    count: '45+ templates'
  },
  {
    id: 'educational' as TemplateCategory,
    title: 'Educational',
    description: 'Course content, lesson plans, and educational materials',
    icon: BookOpen,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'hover:border-amber-200',
    examples: ['Course Outline', 'Lesson Plan', 'Quiz', 'Worksheet', 'Study Guide', 'Certificate'],
    popular: false,
    count: '15+ templates',
    new: true
  }
]

export function EnhancedTemplateCategories({ onSelectCategory }: TemplateCategoriesProps) {
  return (
    <div className="space-y-8">
      {/* Popular Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Popular Categories</h3>
            <p className="text-gray-600">Most used template categories by our community</p>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            🔥 Trending
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.filter(cat => cat.popular).map((category) => {
            const Icon = category.icon
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 ${category.borderColor} group relative overflow-hidden`}
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors duration-300">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <div className="flex flex-wrap gap-1">
                    {category.examples.slice(0, 4).map((example) => (
                      <span 
                        key={example}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors duration-300"
                      >
                        {example}
                      </span>
                    ))}
                    {category.examples.length > 4 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                        +{category.examples.length - 4} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* New Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">New Categories</h3>
            <p className="text-gray-600">Recently added template categories with AI-powered generation</p>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
            ✨ New
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.filter(cat => cat.new).map((category) => {
            const Icon = category.icon
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 ${category.borderColor} group relative`}
                onClick={() => onSelectCategory(category.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${category.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      NEW
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{category.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-600">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1">
                    {category.examples.slice(0, 3).map((example) => (
                      <span 
                        key={example}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* All Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">All Categories</h3>
            <p className="text-gray-600">Complete collection of template categories</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.filter(cat => !cat.popular && !cat.new).map((category) => {
            const Icon = category.icon
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border ${category.borderColor}`}
                onClick={() => onSelectCategory(category.id)}
              >
                <CardHeader className="pb-2">
                  <div className={`w-8 h-8 rounded-lg ${category.bgColor} flex items-center justify-center mb-2`}>
                    <Icon className={`h-4 w-4 ${category.color}`} />
                  </div>
                  <CardTitle className="text-sm">{category.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                  <span className="text-xs text-gray-500">{category.count}</span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">300+</div>
            <div className="text-sm text-gray-600">Total Templates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">10</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">50K+</div>
            <div className="text-sm text-gray-600">Generated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">4.9★</div>
            <div className="text-sm text-gray-600">User Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}