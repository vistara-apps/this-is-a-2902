import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Loader2 } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  
  const { signUp, error } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {}
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      full_name: `${formData.firstName} ${formData.lastName}`,
    }
    
    const result = await signUp(formData.email, formData.password, userData)
    
    if (result.success) {
      navigate('/login', { 
        state: { 
          message: 'Account created successfully! Please check your email to verify your account.' 
        }
      })
    }
    
    setIsLoading(false)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    
    // Clear validation error when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }))
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-dark-accent/10">
            <UserPlus className="h-6 w-6 text-dark-accent" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-dark-text-primary">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-dark-text-secondary">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-dark-accent hover:text-dark-accent/80 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-dark-text-secondary" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      validationErrors.firstName ? 'border-red-500' : 'border-gray-700'
                    } placeholder-dark-text-secondary text-dark-text-primary bg-dark-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent focus:z-10 sm:text-sm`}
                    placeholder="First name"
                  />
                </div>
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.firstName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-3 border ${
                    validationErrors.lastName ? 'border-red-500' : 'border-gray-700'
                  } placeholder-dark-text-secondary text-dark-text-primary bg-dark-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent focus:z-10 sm:text-sm`}
                  placeholder="Last name"
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-dark-text-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-700'
                  } placeholder-dark-text-secondary text-dark-text-primary bg-dark-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-dark-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 border ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-700'
                  } placeholder-dark-text-secondary text-dark-text-primary bg-dark-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent focus:z-10 sm:text-sm`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-dark-text-secondary hover:text-dark-text-primary" />
                  ) : (
                    <Eye className="h-5 w-5 text-dark-text-secondary hover:text-dark-text-primary" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-dark-text-secondary" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 border ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                  } placeholder-dark-text-secondary text-dark-text-primary bg-dark-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-accent focus:border-transparent focus:z-10 sm:text-sm`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-dark-text-secondary hover:text-dark-text-primary" />
                  ) : (
                    <Eye className="h-5 w-5 text-dark-text-secondary hover:text-dark-text-primary" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-dark-accent hover:bg-dark-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create account
                </>
              )}
            </button>
          </div>
          
          <div className="text-xs text-dark-text-secondary text-center">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-dark-accent hover:text-dark-accent/80">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-dark-accent hover:text-dark-accent/80">
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
