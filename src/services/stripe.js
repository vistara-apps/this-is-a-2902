import { loadStripe } from '@stripe/stripe-js'
import { config, SubscriptionPlans } from '../config/api'

// Initialize Stripe
let stripePromise
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripe.publishableKey)
  }
  return stripePromise
}

// Stripe Service for payment processing
export const stripeService = {
  // Initialize Stripe checkout for subscription
  async createCheckoutSession(planId, userId, successUrl, cancelUrl) {
    try {
      if (!config.features.stripePayments) {
        throw new Error('Stripe payments are disabled')
      }

      const plan = Object.values(SubscriptionPlans).find(p => p.id === planId)
      if (!plan) {
        throw new Error('Invalid subscription plan')
      }

      // In a real app, this would call your backend API
      // For now, we'll simulate the checkout process
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          successUrl,
          cancelUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()
      
      const stripe = await getStripe()
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (error) {
        throw error
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Stripe Checkout Error:', error)
      return { success: false, error: error.message }
    }
  },

  // Create customer portal session for subscription management
  async createPortalSession(customerId, returnUrl) {
    try {
      if (!config.features.stripePayments) {
        throw new Error('Stripe payments are disabled')
      }

      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const session = await response.json()
      
      // Redirect to customer portal
      window.location.href = session.url
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Stripe Portal Error:', error)
      return { success: false, error: error.message }
    }
  },

  // Get subscription status
  async getSubscriptionStatus(userId) {
    try {
      const response = await fetch(`/api/subscription-status/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('Subscription Status Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      if (!config.features.stripePayments) {
        throw new Error('Stripe payments are disabled')
      }

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('Cancel Subscription Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Update subscription
  async updateSubscription(subscriptionId, newPlanId) {
    try {
      if (!config.features.stripePayments) {
        throw new Error('Stripe payments are disabled')
      }

      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPlanId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('Update Subscription Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Get payment methods
  async getPaymentMethods(customerId) {
    try {
      const response = await fetch(`/api/payment-methods/${customerId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get payment methods')
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('Payment Methods Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Get billing history
  async getBillingHistory(customerId) {
    try {
      const response = await fetch(`/api/billing-history/${customerId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get billing history')
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('Billing History Error:', error)
      return { data: null, error: error.message }
    }
  }
}

// Subscription utilities
export const subscriptionUtils = {
  // Check if user has access to feature
  hasFeatureAccess(userPlan, feature) {
    const plan = Object.values(SubscriptionPlans).find(p => p.id === userPlan)
    if (!plan) return false
    
    return plan.features[feature] === true || plan.features[feature] === -1
  },

  // Check if user is within limits
  isWithinLimits(userPlan, resource, currentCount) {
    const plan = Object.values(SubscriptionPlans).find(p => p.id === userPlan)
    if (!plan) return false
    
    const limit = plan.features[`max${resource.charAt(0).toUpperCase() + resource.slice(1)}`]
    return limit === -1 || currentCount < limit
  },

  // Get feature limits for plan
  getFeatureLimits(planId) {
    const plan = Object.values(SubscriptionPlans).find(p => p.id === planId)
    return plan ? plan.features : null
  },

  // Calculate usage percentage
  getUsagePercentage(userPlan, resource, currentCount) {
    const plan = Object.values(SubscriptionPlans).find(p => p.id === userPlan)
    if (!plan) return 0
    
    const limit = plan.features[`max${resource.charAt(0).toUpperCase() + resource.slice(1)}`]
    if (limit === -1) return 0 // Unlimited
    
    return Math.min((currentCount / limit) * 100, 100)
  },

  // Get upgrade recommendations
  getUpgradeRecommendation(currentPlan, usage) {
    const plans = Object.values(SubscriptionPlans)
    const currentPlanIndex = plans.findIndex(p => p.id === currentPlan)
    
    if (currentPlanIndex === -1 || currentPlanIndex === plans.length - 1) {
      return null // Already on highest plan or invalid plan
    }
    
    // Check if user is approaching limits
    const needsUpgrade = Object.entries(usage).some(([resource, count]) => {
      const percentage = this.getUsagePercentage(currentPlan, resource, count)
      return percentage > 80 // Recommend upgrade at 80% usage
    })
    
    if (needsUpgrade) {
      return plans[currentPlanIndex + 1]
    }
    
    return null
  }
}

export { getStripe }
export default stripeService
