import { makeAutoObservable } from "mobx"
import data from "../../data"
import axios from "axios"
import { toJS } from "mobx"

const apiUrl = import.meta.env;


class TeamsStore {

    allTeams = []
    teamAnalytics = []


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

    // get team analytics
    getTeamAnalytics() {
        setTimeout(() => {
            axios.get(`${apiUrl.VITE_BACKEND_PATH}teamsAnalytics`)
                .then(response => {

                    this.calculateAnalytics(response.data)
                })
                .catch(error => {
                    console.error("There was an error fetching team analytics!", error);
                });
        }, 500);
    }


    // calculate analytics 
    calculateAnalytics(data) {
        const totals = {};

        data.forEach(team => {
            const teamId = team.team_id;
            const teamName = team.team_name;
            const teamPoss = Number(team.total_possession_time_sec);
            const totalTime = Number(team.half_length_sec) * 2 + Number(team.et_half_length_sec);
            const possessionCount = Number(team.possession_count); // from DB
            const teamPoints = Number(team.total_point || 0); // from DB
            const pointsAllowed = Number(team.points_allowed || 0); // from DB

            // include short_kickout_count and total_kickout_count
            const shortKickout = Number(team.short_kickout_count || 0);
            const oppShortKickout = Number(team.opp_short_kickout_count || 0);
            const totalKickout = Number(team.total_kickout_count || 0);

            if (!totals[teamId]) {
                totals[teamId] = {
                    team_id: teamId,
                    team_name: teamName,
                    total_possession_time_sec: 0,
                    total_game_time_sec: 0,
                    possession_count: 0,
                    total_points: 0,
                    short_kickout_count: 0,
                    total_kickout_count: 0,
                    points_allowed: 0,
                    opp_short_kickout_count: 0
                };
            }

            totals[teamId].total_possession_time_sec += teamPoss;
            totals[teamId].total_game_time_sec += totalTime;
            totals[teamId].possession_count += possessionCount;
            totals[teamId].total_points += teamPoints;
            totals[teamId].short_kickout_count += shortKickout;
            totals[teamId].total_kickout_count += totalKickout;
            totals[teamId].points_allowed += pointsAllowed;
            totals[teamId].opp_short_kickout_count += oppShortKickout;
        });

        this.teamAnalytics = Object.values(totals).map(team => {
            const possFor = (team.total_possession_time_sec / team.total_game_time_sec) * 100;
            const pace = team.possession_count / (team.total_game_time_sec / 60);
            const ORtg = team.total_points && team.possession_count > 0
                ? (team.total_points / team.possession_count) * 100
                : 0;

            const ko_short_own = team.total_kickout_count > 0
                ? (team.short_kickout_count / team.total_kickout_count) * 100
                : 0;

            const opp_ko_short_own = team.total_kickout_count > 0
                ? (team.opp_short_kickout_count / team.total_kickout_count) * 100
                : 0;
            const DRtg = (team.points_allowed /  (100 - possFor)) * 100;

            return {
                team: team.team_name,
                poss_for: parseFloat(possFor.toFixed(2)),
                pace: parseFloat(pace.toFixed(2)),
                ORtg: parseFloat(ORtg.toFixed(2)),
                ko_short_own: parseFloat(ko_short_own.toFixed(2)),
                poss_against: parseFloat((100 - possFor).toFixed(2)),
                DRtg: parseFloat(DRtg.toFixed(2)),
                opp_ko_short_own: parseFloat(opp_ko_short_own.toFixed(2)),
                nett_diff : parseFloat((ORtg - DRtg).toFixed(2)),
                short_ko_diff : parseFloat((ko_short_own - opp_ko_short_own).toFixed(2))
            };
        });
    }







}

export const teamsStore = new TeamsStore()