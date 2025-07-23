export interface Template {
  id: string
  userId: string
  title: string
  description?: string
  category: TemplateCategory
  templateType: string
  content: string
  variables: string | TemplateVariable[]
  isPublished: boolean | string
  price: number
  salesCount: number
  rating: number
  previewImageUrl?: string
  thumbnail?: string
  isPublic?: boolean
  downloads?: number
  createdAt: string
  updatedAt: string
}

export interface TemplateVariable {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date'
  required: boolean
  defaultValue?: string
  options?: string[]
}

export type TemplateCategory = 'documents' | 'designs' | 'web' | 'presentations' | 'email' | 'video' | 'events' | 'ecommerce' | 'social' | 'educational'

export interface UserInput {
  [key: string]: string | number | Date
}

export interface TemplateExport {
  format: 'pdf' | 'png' | 'docx' | 'html'
  content: string
  filename: string
}