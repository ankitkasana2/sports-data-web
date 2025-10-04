import { makeAutoObservable } from "mobx"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class VenuesStore {

    allVenues = []

    constructor() {
        makeAutoObservable(this)
        this.getAllVenues()
    }

    getAllVenues() {
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


    // create venue 
    async createVenue(venue) {
        try {
            const response = await axios.post(`${apiUrl.VITE_BACKEND_PATH}api/createVenue`, venue);

            if (response.data.success) {
                return true;  // success
            } else {
                return false; // failed
            }
        } catch (error) {
            console.error("Error creating venue:", error);
            return false;
        }
    }


}

export const venuesStore = new VenuesStore()