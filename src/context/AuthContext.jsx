import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { authService, supabase } from '../services/supabase'
import { stripeService, subscriptionUtils } from '../services/stripe'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  session: null,
  subscription: null,
  loading: true,
  error: null,
  isAuthenticated: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isAuthenticated: !!action.payload.user,
        loading: false,
        error: null,
      }
    case 'SET_SUBSCRIPTION':
      return { ...state, subscription: action.payload }
    case 'CLEAR_AUTH':
      return {
        ...initialState,
        loading: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          dispatch({ type: 'SET_ERROR', payload: error.message })
          return
        }

        if (mounted) {
          if (session?.user) {
            dispatch({
              type: 'SET_USER',
              payload: { user: session.user, session }
            })
            
            // Load subscription data
            await loadSubscriptionData(session.user.id)
          } else {
            dispatch({ type: 'SET_LOADING', payload: false })
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          dispatch({ type: 'SET_ERROR', payload: error.message })
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          dispatch({
            type: 'SET_USER',
            payload: { user: session.user, session }
          })
          await loadSubscriptionData(session.user.id)
          toast.success('Successfully signed in!')
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'CLEAR_AUTH' })
          toast.success('Successfully signed out!')
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          dispatch({
            type: 'SET_USER',
            payload: { user: session.user, session }
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Load subscription data
  const loadSubscriptionData = async (userId) => {
    try {
      const { data, error } = await stripeService.getSubscriptionStatus(userId)
      if (!error && data) {
        dispatch({ type: 'SET_SUBSCRIPTION', payload: data })
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  // Sign up
  const signUp = async (email, password, userData = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const { data, error } = await authService.signUp(email, password, userData)
      
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error })
        toast.error(error)
        return { success: false, error }
      }

      toast.success('Check your email to confirm your account!')
      return { success: true, data }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during sign up'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Sign in
  const signIn = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const { data, error } = await authService.signIn(email, password)
      
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error })
        toast.error(error)
        return { success: false, error }
      }

      // Auth state will be updated by the onAuthStateChange listener
      return { success: true, data }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during sign in'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const { error } = await authService.signOut()
      
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error })
        toast.error(error)
        return { success: false, error }
      }

      // Auth state will be updated by the onAuthStateChange listener
      return { success: true }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during sign out'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const { error } = await authService.resetPassword(email)
      
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error })
        toast.error(error)
        return { success: false, error }
      }

      toast.success('Password reset email sent!')
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: true }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during password reset'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const { data, error } = await supabase.auth.updateUser(updates)
      
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      dispatch({
        type: 'SET_USER',
        payload: { user: data.user, session: state.session }
      })
      
      toast.success('Profile updated successfully!')
      return { success: true, data }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred updating profile'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Subscription management
  const upgradeSubscription = async (planId) => {
    try {
      if (!state.user) {
        throw new Error('User not authenticated')
      }

      const successUrl = `${window.location.origin}/settings?success=true`
      const cancelUrl = `${window.location.origin}/settings?canceled=true`

      const result = await stripeService.createCheckoutSession(
        planId,
        state.user.id,
        successUrl,
        cancelUrl
      )

      if (!result.success) {
        toast.error(result.error)
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  const cancelSubscription = async () => {
    try {
      if (!state.subscription?.id) {
        throw new Error('No active subscription found')
      }

      const result = await stripeService.cancelSubscription(state.subscription.id)
      
      if (!result.error) {
        await loadSubscriptionData(state.user.id)
        toast.success('Subscription canceled successfully')
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  const openCustomerPortal = async () => {
    try {
      if (!state.subscription?.customerId) {
        throw new Error('No customer ID found')
      }

      const returnUrl = `${window.location.origin}/settings`
      await stripeService.createPortalSession(state.subscription.customerId, returnUrl)
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Feature access helpers
  const hasFeatureAccess = (feature) => {
    if (!state.subscription) return false
    return subscriptionUtils.hasFeatureAccess(state.subscription.planId, feature)
  }

  const isWithinLimits = (resource, currentCount) => {
    if (!state.subscription) return false
    return subscriptionUtils.isWithinLimits(state.subscription.planId, resource, currentCount)
  }

  const getUsagePercentage = (resource, currentCount) => {
    if (!state.subscription) return 0
    return subscriptionUtils.getUsagePercentage(state.subscription.planId, resource, currentCount)
  }

  const value = {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    upgradeSubscription,
    cancelSubscription,
    openCustomerPortal,
    hasFeatureAccess,
    isWithinLimits,
    getUsagePercentage,
    refreshSubscription: () => loadSubscriptionData(state.user?.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
