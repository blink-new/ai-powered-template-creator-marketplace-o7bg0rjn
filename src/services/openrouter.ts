interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ModelConfig {
  name: string;
  model: string;
  description: string;
  bestFor: string[];
}

// Specialized AI models for different purposes
export const AI_MODELS: Record<string, ModelConfig> = {
  // Content generation and copywriting
  'mistral-small': {
    name: 'Mistral Small',
    model: 'mistralai/mistral-small-3.2-24b-instruct:free',
    description: 'Excellent for copywriting and marketing content',
    bestFor: ['email', 'marketing', 'copywriting', 'social-media']
  },
  
  // Advanced reasoning and complex templates
  'kimi-dev': {
    name: 'Kimi Dev 72B',
    model: 'moonshotai/kimi-dev-72b:free',
    description: 'Advanced reasoning for complex document templates',
    bestFor: ['documents', 'contracts', 'reports', 'technical']
  },
  
  // Code and web development
  'deepcoder': {
    name: 'DeepCoder 14B',
    model: 'agentica-org/deepcoder-14b-preview:free',
    description: 'Specialized for web templates and code generation',
    bestFor: ['web', 'html', 'css', 'landing-pages']
  },
  
  // Visual and design recommendations
  'kimi-vl': {
    name: 'Kimi VL',
    model: 'moonshotai/kimi-vl-a3b-thinking:free',
    description: 'Visual understanding for design templates',
    bestFor: ['design', 'visual', 'layout', 'graphics']
  },
  
  // General purpose and presentations
  'qwen3': {
    name: 'Qwen3 235B',
    model: 'qwen/qwen3-235b-a22b:free',
    description: 'Excellent for presentations and structured content',
    bestFor: ['presentations', 'slides', 'structured', 'business']
  },
  
  // Advanced reasoning
  'deepseek-r1': {
    name: 'DeepSeek R1 Chimera',
    model: 'tngtech/deepseek-r1t2-chimera:free',
    description: 'Advanced reasoning for complex workflows',
    bestFor: ['workflow', 'logic', 'complex-reasoning']
  },
  
  // High-performance general model
  'llama-nemotron': {
    name: 'Llama Nemotron Ultra',
    model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    description: 'High-performance model for premium templates',
    bestFor: ['premium', 'high-quality', 'professional']
  },
  
  // Creative and versatile
  'gemma-3n': {
    name: 'Gemma 3N',
    model: 'google/gemma-3n-e4b-it:free',
    description: 'Creative content generation',
    bestFor: ['creative', 'storytelling', 'content']
  },
  
  // Microsoft specialized model
  'mai-ds': {
    name: 'MAI DS R1',
    model: 'microsoft/mai-ds-r1:free',
    description: 'Microsoft specialized model for business templates',
    bestFor: ['business', 'enterprise', 'professional']
  },
  
  // Advanced reasoning
  'qwq-32b': {
    name: 'QwQ 32B',
    model: 'arliai/qwq-32b-arliai-rpr-v1:free',
    description: 'Advanced reasoning and problem solving',
    bestFor: ['problem-solving', 'analysis', 'reasoning']
  }
};

export class OpenRouterService {
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    // API key is handled securely by Blink's proxy
  }

  // Select the best model for a given template category and purpose
  selectBestModel(category: string, purpose: string = 'general'): ModelConfig {
    const categoryLower = category.toLowerCase();
    const purposeLower = purpose.toLowerCase();

    // Find models that match the category or purpose
    const matchingModels = Object.values(AI_MODELS).filter(model =>
      model.bestFor.some(use => 
        use.includes(categoryLower) || 
        use.includes(purposeLower) ||
        categoryLower.includes(use) ||
        purposeLower.includes(use)
      )
    );

    if (matchingModels.length > 0) {
      return matchingModels[0];
    }

    // Default fallbacks based on category
    switch (categoryLower) {
      case 'documents':
        return AI_MODELS['kimi-dev'];
      case 'designs':
        return AI_MODELS['kimi-vl'];
      case 'web':
        return AI_MODELS['deepcoder'];
      case 'presentations':
        return AI_MODELS['qwen3'];
      case 'email':
        return AI_MODELS['mistral-small'];
      default:
        return AI_MODELS['llama-nemotron'];
    }
  }

  async generateContent(
    prompt: string,
    category: string,
    purpose: string = 'general',
    maxTokens: number = 2000
  ): Promise<string> {
    const model = this.selectBestModel(category, purpose);
    
    try {
      // Use Blink's secure API proxy to make the request
      const { blink } = await import('@/blink/client');
      
      const response = await blink.data.fetch({
        url: this.baseUrl,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{OPENROUTER_API_KEY}}',
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Template Creator'
        },
        body: {
          model: model.model,
          messages: [
            {
              role: 'system',
              content: `You are an expert ${category} template creator. ${model.description}. Generate professional, high-quality content that is ready to use. Focus on ${purpose} aspects.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.9
        }
      });

      if (response.status !== 200) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = response.body as OpenRouterResponse;
      return data.choices[0]?.message?.content || 'Failed to generate content';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error('Failed to generate content with OpenRouter API');
    }
  }

  // Generate content with multiple models for comparison
  async generateWithMultipleModels(
    prompt: string,
    category: string,
    modelNames: string[] = []
  ): Promise<Array<{ model: string; content: string }>> {
    const modelsToUse = modelNames.length > 0 
      ? modelNames.map(name => AI_MODELS[name]).filter(Boolean)
      : [this.selectBestModel(category)];

    const results = await Promise.allSettled(
      modelsToUse.map(async (model) => {
        const content = await this.generateContent(prompt, category, 'general', 1500);
        return { model: model.name, content };
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<{ model: string; content: string }> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  // Specialized methods for different template types
  async generateDocumentTemplate(
    type: string,
    userInfo: Record<string, any>
  ): Promise<string> {
    const prompt = `Create a professional ${type} template with the following information:
${Object.entries(userInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}

Generate a complete, professional template with proper formatting, sections, and placeholder variables like {{name}}, {{company}}, etc.`;

    return this.generateContent(prompt, 'documents', 'professional');
  }

  async generateDesignTemplate(
    type: string,
    userInfo: Record<string, any>
  ): Promise<string> {
    const prompt = `Create a ${type} design template with visual layout and styling:
${Object.entries(userInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}

Include HTML structure with inline CSS styling, color schemes, typography, and layout instructions. Use placeholder variables like {{title}}, {{description}}, etc.`;

    return this.generateContent(prompt, 'designs', 'visual');
  }

  async generateWebTemplate(
    type: string,
    userInfo: Record<string, any>
  ): Promise<string> {
    const prompt = `Create a complete ${type} web template with HTML, CSS, and structure:
${Object.entries(userInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}

Generate semantic HTML with modern CSS, responsive design, and interactive elements. Include placeholder variables for dynamic content.`;

    return this.generateContent(prompt, 'web', 'responsive');
  }

  async generatePresentationTemplate(
    type: string,
    userInfo: Record<string, any>
  ): Promise<string> {
    const prompt = `Create a ${type} presentation template with slide structure:
${Object.entries(userInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}

Generate a complete slide deck outline with titles, content, and speaker notes. Include placeholder variables and formatting instructions.`;

    return this.generateContent(prompt, 'presentations', 'structured');
  }

  async generateEmailTemplate(
    type: string,
    userInfo: Record<string, any>
  ): Promise<string> {
    const prompt = `Create a ${type} email template with professional copywriting:
${Object.entries(userInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}

Generate compelling subject line, email body with proper structure, call-to-action, and personalization variables. Focus on engagement and conversion.`;

    return this.generateContent(prompt, 'email', 'marketing');
  }
}

// Export a singleton instance
let openRouterService: OpenRouterService | null = null;

export const getOpenRouterService = (): OpenRouterService => {
  if (!openRouterService) {
    openRouterService = new OpenRouterService();
  }
  return openRouterService;
};