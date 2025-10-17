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
        this.playerAnalytics = analytics;
    }

}

export const playersStore = new PlayersStore()