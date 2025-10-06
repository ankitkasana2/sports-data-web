import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class RefereesStore {

    allRefrees = []

    constructor() {
        makeAutoObservable(this)
        this.getReferees()
    }

    getReferees() {
         setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}referees`)
                .then(response => {
                    this.allRefrees = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);
    }


    // create referee
    async createReferee(referee) {
        try {
            const response = await axios.post(`${apiUrl.VITE_BACKEND_PATH}api/createReferee`, referee);

            if (response.data.success) {
                return true;  // success
            } else {
                return false; // failed
            }
        } catch (error) {
            console.error("Error creating referee:", error);
            return false;
        }
    }
}

export const refereesStore = new RefereesStore()