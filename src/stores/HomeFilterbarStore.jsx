import { makeAutoObservable } from "mobx"
import data from "../../data"
import { useSearchParams } from "react-router-dom"

class HomeFilterbarStore {
    filters = {
        season: new Date().getFullYear(),
        competition: "",
        code: "",
        grade: "",
        group: "",
    }

    years = []
    competitions = []
    grades = [
        "All", "Senior", "Junior", "Intermediate",
        "Junior A", "Junior B", "Junior C", "Minor", "U20"
    ]
    groups = [
        "All", "Group A", "Group B", "Quarter Final", "Semi Final", "Final"
    ]

    constructor() {
        makeAutoObservable(this)
        this.initYears()
        this.loadCompetitions(this.filters.season)
    }

    // Generate years from 1950 to current year
    initYears() {
        const currentYear = new Date().getFullYear()
        const startYear = 1950
        const years = []
        for (let year = startYear; year <= currentYear; year++) {
            years.push(year)
        }
        this.years = years.reverse()
    }

    // Load competitions for selected season
    loadCompetitions(year) {
        this.competitions = [
            ...new Map(
                data.matchData
                    .filter(match => match.season === Number(year))
                    .map(match => [match.competition.code, match.competition])
            ).values()
        ]
    }

    // Handle filter updates
    setFilter(key, value) {
        this.filters[key] = value

        // When season changes → reload competitions
        if (key === "season") {
            this.loadCompetitions(value)
            this.filters.competition = ""
            this.filters.code = ""
        }

        if (key === "competition") {
            this.filters.code = data.matchData.find((val) => { return value.name == val.competition.name })?.game_code
        }

        // Save to localStorage
        localStorage.setItem("filters", JSON.stringify(this.filters))
    }
}

export const homeFilterbarStore = new HomeFilterbarStore()