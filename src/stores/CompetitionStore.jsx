import { makeAutoObservable } from "mobx"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class CompetitionsStore {

    allCompetition = []

    constructor() {
        makeAutoObservable(this)
        this.getAllCompetitions()
    }

    getAllCompetitions() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}competition`)
                .then(response => {
                    this.allCompetition = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching competitions!", error);
                });
        }, 500);
    }


    // create competition
    async createCompetition(competition) {
        try {
            const response = await axios.post(`${apiUrl.VITE_BACKEND_PATH}api/createCompetition`, competition);

            if (response.data.success) {
                return true;  // success
            } else {
                return false; // failed
            }
        } catch (error) {
            console.error("Error creating competition:", error);
            return false;
        }
    }


}

export const competitionsStore = new CompetitionsStore()