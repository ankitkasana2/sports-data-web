import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


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
        const startYear = 2000
        const years = []
        for (let year = startYear; year <= currentYear; year++) {
            years.push(year)
        }
        this.years = years.reverse()
    }

    // fetch all matches by season
    getMatches() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}matches/season/${this.filters.season}`)
                .then(response => {
                    this.matches = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);
    }

    // Load competitions for selected season
    loadCompetitions() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}competition/${this.filters.season}`)
                .then(response => {
                    this.competitions = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);
    }

    // Handle filter updates
    setFilter(key, value) {
        this.filters[key] = value


        // Save to localStorage
        if (localStorage.getItem("filters")) {
            let filter = JSON.parse(localStorage.getItem("filters"))
            if (key == "season" && value != this.filters.season) {
                this.loadCompetitions(value)
                this.filters.competition = ""
                this.filters.code = ""
            }
            filter[key] = value
            localStorage.setItem('filters', JSON.stringify(filter))
        } else {
            localStorage.setItem("filters", JSON.stringify(this.filters))
        }
    }
}

export const homeFilterbarStore = new HomeFilterbarStore()