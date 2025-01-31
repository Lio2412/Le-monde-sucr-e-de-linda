export const cookingModeMetrics = {
  criticalPaths: {
    stepChange: {
      sampling: 'ALL',
      metrics: ['latency', 'error_rate', 'user_impact']
    },
    timerOperation: {
      analytics: {
        console: true,
        external: 'splunk'
      }
    }
  },
  thresholds: {
    fps: { warn: 50, crit: 30 },
    memory: { crit: '100MB' },
    crashRate: '0.1%'
  }
}; 