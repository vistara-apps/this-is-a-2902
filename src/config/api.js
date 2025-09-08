// API Configuration
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
  app: {
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    name: import.meta.env.VITE_APP_NAME || 'LeadFlow AI',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  features: {
    aiFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
    stripePayments: import.meta.env.VITE_ENABLE_STRIPE_PAYMENTS === 'true',
    emailSequences: import.meta.env.VITE_ENABLE_EMAIL_SEQUENCES === 'true',
  },
}

// API Endpoints
export const endpoints = {
  leads: '/api/leads',
  sequences: '/api/sequences',
  activities: '/api/activities',
  users: '/api/users',
  subscriptions: '/api/subscriptions',
  analytics: '/api/analytics',
}

// API Response Types
export const ResponseStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
}

// Subscription Plans
export const SubscriptionPlans = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: {
      maxLeads: 100,
      maxSequences: 3,
      aiScoring: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    features: {
      maxLeads: 1000,
      maxSequences: 10,
      aiScoring: true,
      advancedAnalytics: true,
      prioritySupport: false,
    },
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 199,
    features: {
      maxLeads: -1, // unlimited
      maxSequences: -1, // unlimited
      aiScoring: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
  },
}

// Lead Scoring Criteria
export const ScoringCriteria = {
  EMAIL_ENGAGEMENT: {
    weight: 0.3,
    factors: {
      recentActivity: 30,
      mediumActivity: 20,
      oldActivity: 10,
    },
  },
  COMPANY_SIZE: {
    weight: 0.25,
    factors: {
      enterprise: 25,
      medium: 15,
      small: 10,
    },
  },
  EMAIL_DOMAIN: {
    weight: 0.2,
    factors: {
      business: 20,
      personal: 5,
    },
  },
  TITLE_ROLE: {
    weight: 0.25,
    factors: {
      executive: 25,
      director: 20,
      manager: 15,
      individual: 10,
    },
  },
}

// Sequence Trigger Types
export const TriggerTypes = {
  IMMEDIATE: 'immediate',
  DELAY: 'delay',
  CONDITION: 'condition',
  WEBHOOK: 'webhook',
}

// Activity Types
export const ActivityTypes = {
  EMAIL_SENT: 'email_sent',
  EMAIL_OPENED: 'email_opened',
  EMAIL_CLICKED: 'email_clicked',
  EMAIL_REPLIED: 'email_replied',
  LEAD_CREATED: 'lead_created',
  LEAD_UPDATED: 'lead_updated',
  SEQUENCE_STARTED: 'sequence_started',
  SEQUENCE_COMPLETED: 'sequence_completed',
}

export default config
