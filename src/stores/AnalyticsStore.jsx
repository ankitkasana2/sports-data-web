import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class AnalyticsStore {

    possession = []
    

    constructor() {
        makeAutoObservable(this)
        this.getAllPossession()
    }

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

}

export const analyticsStore = new AnalyticsStore()