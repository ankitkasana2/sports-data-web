import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Separator } from "../components/ui/separator"
import data from "../../data"


export default function HomeNavbar() {
    const [filters, setFilters] = useState({
        season: new Date().getFullYear(),
        competition: "",
        code: "",
        grade: "",
        group: "",
    })

    const [years, setYears] = useState([])
    const [competition, setCompetition] = useState([])

    useEffect(() => {

        const year = new Date().getFullYear()
        setCompetition(data.matchData.filter((val) => { return val.season == year }))

        // get full years 
        const getYears = () => {
            const currentYear = new Date().getFullYear();
            const startYear = 1950; // Or any desired starting year
            const years = [];

            for (let year = startYear; year <= currentYear; year++) {
                years.push(year);
            }

            setYears(years.reverse())
        }

        getYears()
    }, [])


    useEffect(() => {
        console.log("hiiiiiiiii", filters)
    }, [filters])



    return (
        <div className="sticky top-0 z-50 bg-card border-b border-border">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <h1 className="text-2xl font-bold text-foreground">GAA Analytics</h1>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex flex-wrap gap-3">
                        {/* year  */}
                        <Select value={filters.season} onValueChange={(value) => { setFilters({ ...filters, season: value }), setCompetition(data.matchData.filter((val) => { return value == val.season })) }}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years?.map((val) => { return <SelectItem key={val} value={val}>{val}</SelectItem> })}
                            </SelectContent>
                        </Select>

                        {/* competition  */}
                        <Select
                            value={filters.competition}
                            onValueChange={(value) => { setFilters({ ...filters, competition: value, code: data.matchData.find((val) => { return value == val.competition }).game_code, grade: data.matchData.find((val) => { return value == val.competition }).ruleset, group: data.matchData.find((val) => { return value == val.competition }).round }) }}
                        >
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder="Select a competition" />
                            </SelectTrigger>
                            <SelectContent>
                                {competition?.map((val) => { return <SelectItem key={val.id} value={val.competition}>{val.competition}</SelectItem> })}
                            </SelectContent>
                        </Select>

                        {/* code  */}
                        <Select value={filters.code} onValueChange={(value) => setFilters({ ...filters, code: value })}>
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder='Select game code' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hurling">Hurling</SelectItem>
                                <SelectItem value="Football">Football</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* grade  */}
                        <Select value={filters.grade} onValueChange={(value) => setFilters({ ...filters, grade: value })}>
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder="Enter match grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Senior">Senior</SelectItem>
                                <SelectItem value="Junior">Junior</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Junior A">Junior A</SelectItem>
                                <SelectItem value="Junior B">Junior B</SelectItem>
                                <SelectItem value="Junior C">Junior C</SelectItem>
                                <SelectItem value="Minor">Minor</SelectItem>
                                <SelectItem value="U20">U20</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* group  */}
                        <Select value={filters.group} onValueChange={(value) => setFilters({ ...filters, group: value })}>
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder="Enter match group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Group A">Group A</SelectItem>
                                <SelectItem value="Group B">Group B</SelectItem>
                                <SelectItem value="Quarter Final">Quarter Final</SelectItem>
                                <SelectItem value="Semi Final">Semi Final</SelectItem>
                                <SelectItem value="Final">Final</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    )
}
