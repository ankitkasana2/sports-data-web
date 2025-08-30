import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"


class HomeFilterbarStore {
    filters = {
        season: "",
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

    matches = []

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

    // fetch all matches by season
    getMatches() {
        setTimeout(() => {
            axios.get(`https://readyforyourreview.com/KevinR123/public/matches/season/${this.filters.season}`)
                .then(response => {
                    this.matches = response.data;
                    this.loadCompetitions(response.data)
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);

    }

    // Load competitions for selected season
    loadCompetitions(value) {

        value ? this.competitions = [...new Set(value.map(match => match.competition_name))] : this.competitions = []

    }

    // Handle filter updates
    setFilter(key, value) {
        this.filters[key] = value

        // When season changes → reload competitions
        if (key === "season") {
            // this.loadCompetitions(value)
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