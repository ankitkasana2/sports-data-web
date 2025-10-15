import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class AnalyticsStore {

    possession = []
    filter = {
        'view': 'Attacking',
        'rateMode': '',
        'showDiff': false,
        'showDelta': false,
        'percentile': false,
    }
    teams = []


    constructor() {
        makeAutoObservable(this)
        this.getAllPossession()
        this.getTeamElo()
    }

    // get possession 
    getAllPossession() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}possessions`)
                .then(response => {
                    this.possession = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching possession!", error);
                });
        }, 500);
    }


    // Update a single field
    setFilterField(field, value) {
        this.filter[field] = value;
    }

    // get team by elo 
    getTeamElo() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}teamELO`)
                .then(response => {
                    this.teams = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching team!", error);
                });
        }, 500);
    }

}

export const analyticsStore = new AnalyticsStore()