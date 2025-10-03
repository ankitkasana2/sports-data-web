
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import path from "path"

const tabs = [
    { value: "venues", label: "Venues", path: "/admin/reference/Venues" },
    { value: "referees", label: "Referees", path: "/admin/reference/referees" },
    { value: "competitions", label: "Competitions", path: "/admin/reference/competitions" },
    { value: "stages", label: "Stages", path: "/admin/reference/stages" },
]

export default function TopBar() {
    const location = useLocation()
    const navigate = useNavigate()
    const pathname = location.pathname

    useEffect(() => {
      console.log(tabs)
    }, [])
    

    // Redirect to venues if on base admin/reference path
    useEffect(() => {
        if (pathname === "/admin/reference") {
            navigate("/admin/reference/venues")
        }
    }, [pathname, navigate])

    const currentTab = tabs.find(tab=>tab.path==pathname).value 

    const handleTabChange = (value) => {
        const tab = tabs.find((t) => t.value === value)
        if (tab) {
            navigate(tab.path)
        }
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Admin</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Reference</BreadcrumbPage>
                    </BreadcrumbItem>
                    {currentTab && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="capitalize">{currentTab}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </>
                    )}
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-balance">Reference Data Management</h1>
                <p className="text-muted-foreground">
                    Manage master data for venues, referees, competitions, and stages
                </p>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

            </Tabs>
        </div>
    )
}
