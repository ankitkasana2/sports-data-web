import { Outlet } from "react-router-dom"
import LeftMenu from "../../components/analytics/LeftMenu"
import HomeFilterbar from "../../components/HomeFilterbar"
import TopBar from "../../components/analytics/top-bar"

export default function AnalyticsLayout() {
    return (
        <div className="min-h-[100vh]  bg-background ">
            <HomeFilterbar/>
            <TopBar/>
            <div className="grid grid-cols-6">
                {/* Left Sidebar */}
                <div className='col-span-1'>

                    <LeftMenu />
                </div>

                {/* Right Content Area */}
                <main className="px-4 py-6 md:px-8 col-span-5">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
