import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class MatchesStore {

    matches = []
    competitions = []

    constructor() {
        makeAutoObservable(this)
        this.getAllMatchBySeason(new Date().getFullYear())
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
}

export const matchesStore = new MatchesStore()