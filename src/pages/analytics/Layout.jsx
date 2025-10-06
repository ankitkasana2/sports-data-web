import { Outlet } from "react-router-dom"
import LeftMenu from "../../components/analytics/LeftMenu"

export default function AnalyticsLayout() {
    return (
        <div className="min-h-[100vh]  bg-background grid grid-cols-6">
            {/* Left Sidebar */}
            <div className='col-span-1'>
                <LeftMenu />
            </div>

            {/* Right Content Area */}
            <main className="px-4 py-6 md:px-8 col-span-5">
                <Outlet />
            </main>
        </div>
    )
}
