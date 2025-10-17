import { makeAutoObservable } from "mobx"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class VenuesStore {

    allVenues = []
    venueAnalytics = []


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


    // get player analytics
    getVenueAnalytics() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}venueAnalytics`)
                .then(response => {

                    this.calculateAnalytics(response.data)
                })
                .catch(error => {
                    console.error("There was an error fetching venue analytics!", error);
                });
        }, 500);
    }


    calculateAnalytics(data) {
        // map through each player and calculate average minutes per game
        const analytics = data.map(player => {
            const gamesPlayed = Number(player.games_played);
            const totalMinutes = Number(player.total_minutes);

            // calculate average minutes per game
            const avgMinutes = gamesPlayed > 0 ? totalMinutes / gamesPlayed : 0;
            const subs = gamesPlayed - player.starter_games
            const total_pts = (player.goals * 3) + player.points
            const fp_sc = player.goals + player.points
            const fp_percentile = (fp_sc / player.fp_att) * 100

            return {
                ...player,
                avg_minutes: parseFloat(avgMinutes.toFixed(1)), // round to 1 decimal
                subs: subs,
                total_pts: total_pts,
                fp_sc: fp_sc,
                fp_percentile: parseFloat(fp_percentile.toFixed(2)),
            };
        });

        // store the result in playerAnalytics
        this.venueAnalytics = analytics;
    }


}

export const venuesStore = new VenuesStore()