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
//  axios.post(`https://readyforyourreview.com/KevinR123/api/team`, team, )
    // create a team 
    createTeam(team) {
        setTimeout(() => {
            axios.post(`${apiUrl.VITE_BACKEND_PATH}team`, team, )
                .then(response => {
                    console.log("team created:", response.data);
                })
                .catch(error => {
                    console.error("There was an error creating the team!", error);
                });
        }, 500);
    }
}

export const teamsStore = new TeamsStore()