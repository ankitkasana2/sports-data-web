import React from 'react'
import AnalyticsPage from '../../components/analytics/AnalyticsPage'
import LeftMenu from '../../components/analytics/LeftMenu'

const Analytics = () => {
    return (
        <main className="min-h-[100vh]  bg-background grid grid-cols-6">
            <div className='col-span-1'>
                <LeftMenu />
            </div>
            <div className='px-4 py-6 md:px-8 col-span-5'>
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold text-slate-700 text-balance">Analytics</h1>
                    <p className="text-sm text-slate-700/80">Comprehensive insights and performance metrics</p>
                </header>
                <AnalyticsPage />
            </div>
        </main>
    )
}

export default Analytics