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
}

export const refereesStore = new RefereesStore()