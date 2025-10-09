import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class MatchesStore {

    matches = []
    competitions = []
    allCompetitions = []
    allVenues = []
    lineups = []

    constructor() {
        makeAutoObservable(this)
        this.getAllMatchBySeason(new Date().getFullYear())
        this.getAllCompetition()
        this.getAllVenue()
    }

    getAllMatchBySeason(season) {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}matches/season/${season}`)
                .then(response => {
                    this.matches = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);
    }

    // competition 
    getAllCompetition() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}competition`)
                .then(response => {
                    this.allCompetitions = response.data;
                    this.getAllVenue()
                })
                .catch(error => {
                    console.error("There was an error fetching competition!", error);
                });
        }, 500);
    }

    // get all venue 
    getAllVenue() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}venue`)
                .then(response => {
                    this.allVenues = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);
    }


    // store lineups 
    storeLineups(lineupsA, lineupsB) {
        const data = [lineupsA, lineupsB];
        setTimeout(() => {
            axios.post(`${apiUrl.VITE_BACKEND_PATH}lineup`, data)
                .then(response => {
                    console.log("Match created:", response.data);
                })
                .catch(error => {
                    console.error("There was an error creating the match!", error);
                });
        }, 500);
    }


    // create a new match 
    createMatch(match) {
        setTimeout(() => {
            axios.post(`${apiUrl.VITE_BACKEND_PATH}match`, match)
                .then(response => {
                    console.log("Match created:", response.data);
                })
                .catch(error => {
                    console.error("There was an error creating the match!", error);
                });
        }, 500);
    }
}

export const matchesStore = new MatchesStore()