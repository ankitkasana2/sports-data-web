import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class TeamsStore {

    allTeams = []

    constructor() {
        makeAutoObservable(this)
        this.getAllTeams()
    }

    // get all teams 
    getAllTeams() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}teams`)
                .then(response => {
                    this.allTeams = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);
    }

    // create a team 
    async createTeam(team) {
        try {
            const response = await axios.post(`${apiUrl.VITE_BACKEND_PATH}api/team`, team);

            if (response.data.success) {
                return true;  // success
            } else {
                return false; // failed
            }
        } catch (error) {
            console.error("Error creating team:", error);
            return false;
        }
    }
}

export const teamsStore = new TeamsStore()