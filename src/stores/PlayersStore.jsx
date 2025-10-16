import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class PlayersStore {

    allPlayers = []
    players = []
    playerAnalytics = []

    constructor() {
        makeAutoObservable(this)
        this.getAllPlayers()
    }

    getAllPlayers() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}players`)
                .then(response => {
                    this.allPlayers = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);
    }

    getPlayerByTeam(teamId) {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}players/team/${teamId}`)
                .then(response => {
                    this.players = response.data;
                })
                .catch(error => {
                    console.error("There was an error fetching users!", error);
                });
        }, 500);
    }

    // create a player
    async createPlayer(player) {
        try {
            const response = await axios.post(`${apiUrl.VITE_BACKEND_PATH}api/player`, player);

            if (response.data.success) {
                return true;  // success
            } else {
                return false; // failed
            }
        } catch (error) {
            console.error("Error creating player:", error);
            return false;
        }
    }


    // get player analytics
    getPlayerAnalytics() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}playerAnalytics`)
                .then(response => {

                    this.calculateAnalytics(response.data)
                })
                .catch(error => {
                    console.error("There was an error fetching player analytics!", error);
                });
        }, 500);
    }


    calculateAnalytics(data) {
        
    }

}

export const playersStore = new PlayersStore()