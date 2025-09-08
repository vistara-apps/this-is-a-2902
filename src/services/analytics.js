import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns'

// Analytics Service for calculating performance metrics
export const analyticsService = {
  // Calculate lead conversion funnel
  calculateLeadFunnel(leads, activities) {
    const funnel = {
      total: leads.length,
      contacted: 0,
      responded: 0,
      qualified: 0,
      converted: 0,
    }

    leads.forEach(lead => {
      const leadActivities = activities.filter(a => a.leadId === lead.leadId)
      
      // Check if lead was contacted
      if (leadActivities.some(a => a.type === 'email_sent')) {
        funnel.contacted++
        
        // Check if lead responded
        if (leadActivities.some(a => a.type === 'email_replied')) {
          funnel.responded++
          
          // Check if lead is qualified (high score)
          if (lead.score >= 70) {
            funnel.qualified++
            
            // Check if lead converted (has conversion activity)
            if (leadActivities.some(a => a.type === 'converted')) {
              funnel.converted++
            }
          }
        }
      }
    })

    return {
      ...funnel,
      rates: {
        contactRate: funnel.total > 0 ? (funnel.contacted / funnel.total) * 100 : 0,
        responseRate: funnel.contacted > 0 ? (funnel.responded / funnel.contacted) * 100 : 0,
        qualificationRate: funnel.responded > 0 ? (funnel.qualified / funnel.responded) * 100 : 0,
        conversionRate: funnel.qualified > 0 ? (funnel.converted / funnel.qualified) * 100 : 0,
      }
    }
  },

  // Calculate sequence performance metrics
  calculateSequenceMetrics(sequences, activities) {
    return sequences.map(sequence => {
      const sequenceActivities = activities.filter(a => a.sequenceId === sequence.sequenceId)
      
      const metrics = {
        sequenceId: sequence.sequenceId,
        name: sequence.name,
        totalSent: sequenceActivities.filter(a => a.type === 'email_sent').length,
        totalOpened: sequenceActivities.filter(a => a.type === 'email_opened').length,
        totalClicked: sequenceActivities.filter(a => a.type === 'email_clicked').length,
        totalReplied: sequenceActivities.filter(a => a.type === 'email_replied').length,
        isActive: sequence.isActive,
      }

      return {
        ...metrics,
        openRate: metrics.totalSent > 0 ? (metrics.totalOpened / metrics.totalSent) * 100 : 0,
        clickRate: metrics.totalSent > 0 ? (metrics.totalClicked / metrics.totalSent) * 100 : 0,
        replyRate: metrics.totalSent > 0 ? (metrics.totalReplied / metrics.totalSent) * 100 : 0,
        clickThroughRate: metrics.totalOpened > 0 ? (metrics.totalClicked / metrics.totalOpened) * 100 : 0,
      }
    })
  },

  // Calculate time-based analytics
  calculateTimeSeriesData(activities, days = 30) {
    const endDate = new Date()
    const startDate = subDays(endDate, days - 1)
    
    const timeSeriesData = []
    
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, days - 1 - i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp)
        return isWithinInterval(activityDate, { start: dayStart, end: dayEnd })
      })
      
      timeSeriesData.push({
        date: format(date, 'yyyy-MM-dd'),
        dateLabel: format(date, 'MMM dd'),
        emailsSent: dayActivities.filter(a => a.type === 'email_sent').length,
        emailsOpened: dayActivities.filter(a => a.type === 'email_opened').length,
        emailsClicked: dayActivities.filter(a => a.type === 'email_clicked').length,
        emailsReplied: dayActivities.filter(a => a.type === 'email_replied').length,
        leadsCreated: dayActivities.filter(a => a.type === 'lead_created').length,
        sequencesStarted: dayActivities.filter(a => a.type === 'sequence_started').length,
      })
    }
    
    return timeSeriesData
  },

  // Calculate lead scoring distribution
  calculateScoreDistribution(leads) {
    const distribution = {
      'Hot (80-100)': 0,
      'Warm (60-79)': 0,
      'Cold (40-59)': 0,
      'Nurture (0-39)': 0,
    }

    leads.forEach(lead => {
      const score = lead.score || 0
      if (score >= 80) distribution['Hot (80-100)']++
      else if (score >= 60) distribution['Warm (60-79)']++
      else if (score >= 40) distribution['Cold (40-59)']++
      else distribution['Nurture (0-39)']++
    })

    return Object.entries(distribution).map(([segment, count]) => ({
      segment,
      count,
      percentage: leads.length > 0 ? (count / leads.length) * 100 : 0,
    }))
  },

  // Calculate top performing sequences
  getTopPerformingSequences(sequenceMetrics, limit = 5) {
    return sequenceMetrics
      .filter(seq => seq.totalSent > 0)
      .sort((a, b) => b.replyRate - a.replyRate)
      .slice(0, limit)
      .map(seq => ({
        name: seq.name,
        replyRate: seq.replyRate,
        totalSent: seq.totalSent,
        totalReplied: seq.totalReplied,
      }))
  },

  // Calculate lead source performance
  calculateSourcePerformance(leads) {
    const sourceStats = {}
    
    leads.forEach(lead => {
      const source = lead.source || 'Unknown'
      if (!sourceStats[source]) {
        sourceStats[source] = {
          source,
          count: 0,
          totalScore: 0,
          hotLeads: 0,
        }
      }
      
      sourceStats[source].count++
      sourceStats[source].totalScore += lead.score || 0
      if ((lead.score || 0) >= 80) {
        sourceStats[source].hotLeads++
      }
    })
    
    return Object.values(sourceStats).map(stat => ({
      ...stat,
      averageScore: stat.count > 0 ? stat.totalScore / stat.count : 0,
      hotLeadRate: stat.count > 0 ? (stat.hotLeads / stat.count) * 100 : 0,
    })).sort((a, b) => b.averageScore - a.averageScore)
  },

  // Calculate engagement trends
  calculateEngagementTrends(activities, days = 7) {
    const trends = this.calculateTimeSeriesData(activities, days)
    
    if (trends.length < 2) return { trend: 'stable', change: 0 }
    
    const recent = trends.slice(-3).reduce((sum, day) => sum + day.emailsOpened, 0) / 3
    const previous = trends.slice(-6, -3).reduce((sum, day) => sum + day.emailsOpened, 0) / 3
    
    if (previous === 0) return { trend: 'stable', change: 0 }
    
    const change = ((recent - previous) / previous) * 100
    
    return {
      trend: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
      change: Math.round(change),
    }
  },

  // Generate insights and recommendations
  generateInsights(leads, sequences, activities) {
    const insights = []
    const sequenceMetrics = this.calculateSequenceMetrics(sequences, activities)
    const funnel = this.calculateLeadFunnel(leads, activities)
    const scoreDistribution = this.calculateScoreDistribution(leads)
    const engagementTrends = this.calculateEngagementTrends(activities)
    
    // Lead quality insights
    const hotLeadsPercentage = scoreDistribution.find(s => s.segment === 'Hot (80-100)')?.percentage || 0
    if (hotLeadsPercentage < 10) {
      insights.push({
        type: 'warning',
        title: 'Low Hot Lead Percentage',
        description: `Only ${hotLeadsPercentage.toFixed(1)}% of your leads are in the Hot segment. Consider refining your lead sources or scoring criteria.`,
        priority: 'high',
      })
    }
    
    // Sequence performance insights
    const avgReplyRate = sequenceMetrics.reduce((sum, seq) => sum + seq.replyRate, 0) / sequenceMetrics.length
    if (avgReplyRate < 5) {
      insights.push({
        type: 'warning',
        title: 'Low Email Reply Rate',
        description: `Your average reply rate is ${avgReplyRate.toFixed(1)}%. Industry average is 8-12%. Consider personalizing your emails more.`,
        priority: 'high',
      })
    }
    
    // Engagement trend insights
    if (engagementTrends.trend === 'decreasing') {
      insights.push({
        type: 'alert',
        title: 'Declining Engagement',
        description: `Email engagement has decreased by ${Math.abs(engagementTrends.change)}% recently. Review your recent campaigns.`,
        priority: 'medium',
      })
    } else if (engagementTrends.trend === 'increasing') {
      insights.push({
        type: 'success',
        title: 'Growing Engagement',
        description: `Email engagement has increased by ${engagementTrends.change}% recently. Great work!`,
        priority: 'low',
      })
    }
    
    // Conversion funnel insights
    if (funnel.rates.responseRate < 15) {
      insights.push({
        type: 'tip',
        title: 'Improve Response Rate',
        description: `Your response rate is ${funnel.rates.responseRate.toFixed(1)}%. Try A/B testing subject lines and send times.`,
        priority: 'medium',
      })
    }
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  },

  // Export data for reporting
  exportAnalyticsData(leads, sequences, activities) {
    return {
      summary: {
        totalLeads: leads.length,
        totalSequences: sequences.length,
        totalActivities: activities.length,
        generatedAt: new Date().toISOString(),
      },
      funnel: this.calculateLeadFunnel(leads, activities),
      sequenceMetrics: this.calculateSequenceMetrics(sequences, activities),
      scoreDistribution: this.calculateScoreDistribution(leads),
      sourcePerformance: this.calculateSourcePerformance(leads),
      timeSeriesData: this.calculateTimeSeriesData(activities, 30),
      insights: this.generateInsights(leads, sequences, activities),
    }
  }
}

export default analyticsService
