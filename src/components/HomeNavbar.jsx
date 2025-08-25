import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Separator } from "../components/ui/separator"
import data from "../../data"
import { useSearchParams } from "react-router-dom"


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
    const [grade, setGrade] = useState([])
    const [group, setGroup] = useState([])
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (!searchParams.season) {
            const year = new Date().getFullYear()
            setCompetition(
                data.matchData.filter(match => match.season === year)
                    .map(match => {
                        return match.competition;
                    })
            );
        }

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

        if (filters.competition) {
            searchParams.set("season", filters.season)
            searchParams.set("competition", filters.competition.code)
            searchParams.set("code", filters.code)
            searchParams.set("grade", filters.grade)
            searchParams.set("group", filters.group)
            setSearchParams(searchParams)
        }

        console.log(filters)

        localStorage.setItem("filters", JSON.stringify(filters))
    }, [filters])


    useEffect(() => {
        console.log(competition)
    }, [competition])




    // handle filters 
    const handleFilters = (value, id) => {
        if (id == 1) {
            setFilters({ ...filters, season: value })
            setCompetition(
                data.matchData.filter(match => match.season === value)
                    .map(match => {
                        return match.competition;
                    })
            );

        } else if (id == 2) {
            setFilters({ ...filters, competition: competition.find((val) => value == val.name), code: data.matchData.find((val) => { return value == val.competition.name }).game_code })

            //  setGrade(data.matchData.find((val) => { return value == val.competition }).ruleset)
            //  setGroup(data.matchData.find((val) => { return value == val.competition }).round)

        } else if (id == 3) {
            setFilters({ ...filters, code: value })

        } else if (id == 4) {
            setFilters({ ...filters, grade: value })
        } else if (id == 5) {
            setFilters({ ...filters, group: value })
        }

    }


    return (
        <div className="sticky top-14 z-50 bg-card border-b border-border">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex flex-wrap gap-3">
                        {/* year  */}
                        <Select value={filters.season} onValueChange={(value) => handleFilters(value, 1)}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years?.map((val) => { return <SelectItem key={val} value={val}>{val}</SelectItem> })}
                            </SelectContent>
                        </Select>

                        {/* competition  */}
                        <Select
                            value={filters.competition.name}
                            onValueChange={(value) => { handleFilters(value, 2) }}
                        >
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder="Select a competition" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                {competition?.map((val) => { return <SelectItem key={val.code} value={val.name}>{val.name}</SelectItem> })}
                            </SelectContent>
                        </Select>

                        {/* code  */}
                        <Select value={filters.code} onValueChange={(value) => handleFilters(value, 3)}>
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder='Select game code' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hurling">Hurling</SelectItem>
                                <SelectItem value="Football">Football</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* grade  */}
                        <Select value={filters.grade} onValueChange={(value) => handleFilters(value, 4)}>
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder="Enter match grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
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
                        <Select value={filters.group} onValueChange={(value) => handleFilters(value, 5)}>
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder="Enter match group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
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
