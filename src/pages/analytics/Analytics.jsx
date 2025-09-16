import React from 'react'
import AnalyticsPage from '../../components/analytics/AnalyticsPage'

const Analytics = () => {
    return (
        <main className="min-h-[100vh] px-4 py-6 md:px-8 bg-background">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-700 text-balance">Analytics</h1>
                <p className="text-sm text-slate-700/80">Comprehensive insights and performance metrics</p>
            </header>
            <AnalyticsPage />
        </main>
    )
}

export default Analytics