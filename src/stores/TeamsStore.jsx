import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class TeamsStore {

    teams = []

    constructor() {
        makeAutoObservable(this)
        this.getAllTeams()
    }

    getAllTeams() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}teams`)
                .then(response => {
                    this.teams = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);
    }
}

export const teamsStore = new TeamsStore()