import { createClient } from '@supabase/supabase-js'
import { config } from '../config/api'

// Initialize Supabase client
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Database Tables Schema
export const Tables = {
  USERS: 'users',
  LEADS: 'leads',
  SEQUENCES: 'sequences',
  SEQUENCE_STEPS: 'sequence_steps',
  LEAD_ACTIVITIES: 'lead_activities',
  SUBSCRIPTIONS: 'subscriptions',
}

// Auth Service
export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${config.app.url}/reset-password`
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Database Service
export const dbService = {
  // Generic CRUD operations
  async create(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  async read(table, filters = {}, options = {}) {
    try {
      let query = supabase.from(table).select(options.select || '*')
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else {
          query = query.eq(key, value)
        }
      })
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending !== false 
        })
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  async update(table, id, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  async delete(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Lead Service
export const leadService = {
  async getLeads(userId, filters = {}) {
    return dbService.read(Tables.LEADS, { user_id: userId, ...filters }, {
      orderBy: { column: 'created_at', ascending: false }
    })
  },

  async createLead(leadData) {
    return dbService.create(Tables.LEADS, leadData)
  },

  async updateLead(leadId, updates) {
    return dbService.update(Tables.LEADS, leadId, updates)
  },

  async deleteLead(leadId) {
    return dbService.delete(Tables.LEADS, leadId)
  },

  async getLeadActivities(leadId) {
    return dbService.read(Tables.LEAD_ACTIVITIES, { lead_id: leadId }, {
      orderBy: { column: 'timestamp', ascending: false }
    })
  }
}

// Sequence Service
export const sequenceService = {
  async getSequences(userId) {
    return dbService.read(Tables.SEQUENCES, { user_id: userId }, {
      orderBy: { column: 'created_at', ascending: false }
    })
  },

  async createSequence(sequenceData) {
    return dbService.create(Tables.SEQUENCES, sequenceData)
  },

  async updateSequence(sequenceId, updates) {
    return dbService.update(Tables.SEQUENCES, sequenceId, updates)
  },

  async deleteSequence(sequenceId) {
    return dbService.delete(Tables.SEQUENCES, sequenceId)
  },

  async getSequenceSteps(sequenceId) {
    return dbService.read(Tables.SEQUENCE_STEPS, { sequence_id: sequenceId }, {
      orderBy: { column: 'order', ascending: true }
    })
  }
}

// Real-time subscriptions
export const realtimeService = {
  subscribeToLeads(userId, callback) {
    return supabase
      .channel('leads')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: Tables.LEADS,
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  subscribeToSequences(userId, callback) {
    return supabase
      .channel('sequences')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: Tables.SEQUENCES,
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  unsubscribe(subscription) {
    return supabase.removeChannel(subscription)
  }
}

export default supabase
