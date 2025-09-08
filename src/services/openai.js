import OpenAI from 'openai'
import { config } from '../config/api'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

// AI Service for lead scoring and content generation
export const aiService = {
  // Generate lead score using AI analysis
  async generateLeadScore(leadData) {
    try {
      if (!config.features.aiFeatures) {
        throw new Error('AI features are disabled')
      }

      const prompt = `
        Analyze this lead and provide a score from 0-100 based on their likelihood to convert:
        
        Lead Information:
        - Name: ${leadData.name || 'Unknown'}
        - Email: ${leadData.email || 'Unknown'}
        - Company: ${leadData.company || 'Unknown'}
        - Title: ${leadData.title || 'Unknown'}
        - Last Activity: ${leadData.lastActivity || 'None'}
        - Source: ${leadData.source || 'Unknown'}
        
        Consider factors like:
        - Email domain (business vs personal)
        - Job title seniority
        - Company size indicators
        - Recent engagement
        
        Respond with only a JSON object containing:
        {
          "score": number (0-100),
          "reasoning": "brief explanation",
          "segment": "Hot|Warm|Cold|Nurture"
        }
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales lead analyst. Provide accurate, data-driven lead scoring.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content)
      return { data: result, error: null }
    } catch (error) {
      console.error('AI Lead Scoring Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Generate personalized email content
  async generateEmailContent(leadData, sequenceStep, context = {}) {
    try {
      if (!config.features.aiFeatures) {
        throw new Error('AI features are disabled')
      }

      const prompt = `
        Generate a personalized email for this lead:
        
        Lead Information:
        - Name: ${leadData.name || 'there'}
        - Company: ${leadData.company || 'their company'}
        - Title: ${leadData.title || 'their role'}
        - Industry: ${leadData.industry || 'their industry'}
        
        Email Context:
        - Sequence Step: ${sequenceStep.order || 1}
        - Email Type: ${sequenceStep.type || 'outreach'}
        - Goal: ${context.goal || 'introduce our service'}
        - Tone: ${context.tone || 'professional and friendly'}
        
        Requirements:
        - Keep it under 150 words
        - Include a clear call-to-action
        - Make it personal but not overly familiar
        - Focus on value proposition
        
        Respond with only a JSON object containing:
        {
          "subject": "email subject line",
          "body": "email body content",
          "cta": "call to action text"
        }
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email copywriter specializing in B2B sales outreach. Write compelling, personalized emails that drive responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })

      const result = JSON.parse(response.choices[0].message.content)
      return { data: result, error: null }
    } catch (error) {
      console.error('AI Email Generation Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Analyze email performance and suggest improvements
  async analyzeEmailPerformance(emailData, metrics) {
    try {
      if (!config.features.aiFeatures) {
        throw new Error('AI features are disabled')
      }

      const prompt = `
        Analyze this email's performance and suggest improvements:
        
        Email Content:
        - Subject: ${emailData.subject}
        - Body: ${emailData.body.substring(0, 500)}...
        
        Performance Metrics:
        - Open Rate: ${metrics.openRate}%
        - Click Rate: ${metrics.clickRate}%
        - Reply Rate: ${metrics.replyRate}%
        - Sent Count: ${metrics.sentCount}
        
        Provide actionable suggestions to improve performance.
        
        Respond with only a JSON object containing:
        {
          "overallScore": number (0-100),
          "suggestions": [
            {
              "category": "subject|content|timing|targeting",
              "issue": "description of issue",
              "suggestion": "specific improvement recommendation"
            }
          ],
          "predictedImprovement": "estimated performance improvement"
        }
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing analyst. Provide data-driven insights and actionable recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content)
      return { data: result, error: null }
    } catch (error) {
      console.error('AI Email Analysis Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Generate lead insights and recommendations
  async generateLeadInsights(leadData, activityHistory = []) {
    try {
      if (!config.features.aiFeatures) {
        throw new Error('AI features are disabled')
      }

      const prompt = `
        Analyze this lead and their activity history to provide insights:
        
        Lead Profile:
        - Name: ${leadData.name}
        - Company: ${leadData.company}
        - Title: ${leadData.title}
        - Score: ${leadData.score}
        - Segment: ${leadData.segment}
        
        Recent Activity:
        ${activityHistory.slice(0, 5).map(activity => 
          `- ${activity.type}: ${activity.details} (${activity.timestamp})`
        ).join('\n')}
        
        Provide strategic insights and next steps.
        
        Respond with only a JSON object containing:
        {
          "insights": [
            {
              "type": "opportunity|risk|behavior|timing",
              "insight": "key observation",
              "confidence": number (0-100)
            }
          ],
          "recommendations": [
            {
              "action": "specific action to take",
              "priority": "high|medium|low",
              "reasoning": "why this action is recommended"
            }
          ],
          "nextBestAction": "single most important next step"
        }
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales strategist. Provide actionable insights based on lead behavior and data patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.4
      })

      const result = JSON.parse(response.choices[0].message.content)
      return { data: result, error: null }
    } catch (error) {
      console.error('AI Lead Insights Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Generate sequence optimization suggestions
  async optimizeSequence(sequenceData, performanceMetrics) {
    try {
      if (!config.features.aiFeatures) {
        throw new Error('AI features are disabled')
      }

      const prompt = `
        Analyze this email sequence and suggest optimizations:
        
        Sequence Overview:
        - Name: ${sequenceData.name}
        - Steps: ${sequenceData.steps?.length || 0}
        - Active: ${sequenceData.isActive}
        
        Performance Metrics:
        - Total Sent: ${performanceMetrics.totalSent}
        - Average Open Rate: ${performanceMetrics.avgOpenRate}%
        - Average Click Rate: ${performanceMetrics.avgClickRate}%
        - Conversion Rate: ${performanceMetrics.conversionRate}%
        
        Sequence Steps:
        ${sequenceData.steps?.map((step, index) => 
          `Step ${index + 1}: ${step.type} - ${step.delay} delay`
        ).join('\n') || 'No steps defined'}
        
        Provide optimization recommendations.
        
        Respond with only a JSON object containing:
        {
          "overallHealth": number (0-100),
          "optimizations": [
            {
              "stepNumber": number,
              "category": "timing|content|targeting|flow",
              "current": "current approach",
              "suggested": "suggested improvement",
              "expectedImpact": "high|medium|low"
            }
          ],
          "strategicRecommendations": [
            "high-level strategic suggestions"
          ]
        }
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email sequence strategist. Provide data-driven optimization recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content)
      return { data: result, error: null }
    } catch (error) {
      console.error('AI Sequence Optimization Error:', error)
      return { data: null, error: error.message }
    }
  }
}

export default aiService
