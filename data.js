
const data = {

    matchData: [
        {
            "match_id": "M2025-001",
            "season": "2025",
            "competition": {
                "name": "Wexford Senior Hurling Championship",
                "code": "WSHC"
            },
            "round": {
                "name" : "Quarter Final",
                "code" : "QF",
            },
            "date": "2025-08-27",
            "time": "19:30",
            "venue_id": "V001",
            "venue_name": "Innovate Wexford Park",
            "venue_type": "stadium",
            "referee_id": "R101",
            "referee_name": "John Murphy",
            "game_code": "Hurling",
            "ruleset": "Senior",
            "half_length_sec": 1800,
            "extra_time_possible": true,
            "penalty_shootout_possible": true,
            "neutral_flag": false,
            "team_a_id": "T001",
            "team_b_id": "T002",
            "video_source": "https://example.com/videos/m2025-001.mp4"
        },
        {
            "match_id": "M2025-002",
            "season": "2025",
            "competition": {
                "name": "Leinster Football Championship",
                "code": "LFC"
            },
            "round": {
                "name":  "Semi Final",
                "code": "SF",
            },
            "date": "2025-08-28",
            "time": "14:00",
            "venue_id": "V002",
            "venue_name": "Croke Park",
            "venue_type": "neutral",
            "referee_id": "R102",
            "referee_name": "Michael Doyle",
            "game_code": "Football",
            "ruleset": "Senior",
            "half_length_sec": 1800,
            "extra_time_possible": true,
            "penalty_shootout_possible": false,
            "neutral_flag": true,
            "team_a_id": "T010",
            "team_b_id": "T011",
            "video_source": "https://example.com/videos/m2025-002.mp4"
        },
        {
            "match_id": "M2024-015",
            "season": "2024",
            "competition": {
                "name": "All-Ireland Hurling Championship",
                "code": "AIHC",
            },
            "round": {
                "name": "Final",
                "code": "F",
            },
            "date": "2024-08-18",
            "time": "16:00",
            "venue_id": "V002",
            "venue_name": "Croke Park",
            "venue_type": "stadium",
            "referee_id": "R103",
            "referee_name": "Brian Kelly",
            "game_code": "Hurling",
            "ruleset": "Senior",
            "half_length_sec": 1800,
            "extra_time_possible": true,
            "penalty_shootout_possible": true,
            "neutral_flag": true,
            "team_a_id": "T003",
            "team_b_id": "T004",
            "video_source": "https://example.com/videos/m2024-015.mp4"
        },
        {
            "match_id": "M2023-022",
            "season": "2023",
            "competition": {
                "name": "National Football League",
                "code": "NFL",
            },
            "round": {
                "name": "Group Stage - Round 5",
                "code": "GSR5",
            },
            "date": "2023-03-11",
            "time": "19:00",
            "venue_id": "V003",
            "venue_name": "Pearse Stadium",
            "venue_type": "stadium",
            "referee_id": "R104",
            "referee_name": "Patrick O’Connor",
            "game_code": "Football",
            "ruleset": "Senior",
            "half_length_sec": 1800,
            "extra_time_possible": false,
            "penalty_shootout_possible": false,
            "neutral_flag": false,
            "team_a_id": "T012",
            "team_b_id": "T013",
            "video_source": "https://example.com/videos/m2023-022.mp4"
        },
        {
            "match_id": "M2025-010",
            "season": "2025",
            "competition": {
                "name": "Wexford Senior Hurling Championship",
                "code": "WSHC"
            },
            "round": {
                "name": "Group Stage - Round 2",
                "code": "GSR2",
            },
            "date": "2025-05-10",
            "time": "12:30",
            "venue_id": "V004",
            "venue_name": "Bellefield",
            "venue_type": "club",
            "referee_id": "R105",
            "referee_name": "David Byrne",
            "game_code": "Hurling",
            "ruleset": "Minor",
            "half_length_sec": 1500,
            "extra_time_possible": false,
            "penalty_shootout_possible": false,
            "neutral_flag": false,
            "team_a_id": "T020",
            "team_b_id": "T021",
            "video_source": "https://example.com/videos/m2025-010.mp4"
        }
    ],



    player: [
        {
            "PlayerID": 1,
            "TeamID": "DUB01",
            "Name": "Conor Murphy",
            "PreferredPosition": "Goalkeeper",
            "ActiveFlag": true,
            "dominant_side": ''
        },
        {
            "PlayerID": 2,
            "TeamID": "DUB01",
            "Name": "Patrick O'Neill",
            "JerseyNumber": 3,
            "PreferredPosition": "Full Back",
            "ActiveFlag": true
        },
        {
            "PlayerID": 3,
            "TeamID": "DUB01",
            "Name": "Sean Gallagher",
            "JerseyNumber": 6,
            "PreferredPosition": "Centre Back",
            "ActiveFlag": true
        },
        {
            "PlayerID": 4,
            "TeamID": "DUB01",
            "Name": "Brian Kelly",
            "JerseyNumber": 8,
            "PreferredPosition": "Midfield",
            "ActiveFlag": true
        },
        {
            "PlayerID": 5,
            "TeamID": "DUB01",
            "Name": "James Doyle",
            "JerseyNumber": 11,
            "PreferredPosition": "Centre Forward",
            "ActiveFlag": true
        },
        {
            "PlayerID": 6,
            "TeamID": "DUB01",
            "Name": "Michael Byrne",
            "JerseyNumber": 15,
            "PreferredPosition": "Corner Forward",
            "ActiveFlag": false
        },
        {
            "PlayerID": 7,
            "TeamID": "KER01",
            "Name": "Daniel Walsh",
            "JerseyNumber": 1,
            "PreferredPosition": "Goalkeeper",
            "ActiveFlag": true
        },
        {
            "PlayerID": 8,
            "TeamID": "KER01",
            "Name": "Eoin O'Shea",
            "JerseyNumber": 5,
            "PreferredPosition": "Wing Back",
            "ActiveFlag": true
        },
        {
            "PlayerID": 9,
            "TeamID": "KER01",
            "Name": "Liam Fitzgerald",
            "JerseyNumber": 9,
            "PreferredPosition": "Midfield",
            "ActiveFlag": true
        },
        {
            "PlayerID": 10,
            "TeamID": "KER01",
            "Name": "Tomás Keane",
            "JerseyNumber": 13,
            "PreferredPosition": "Corner Forward",
            "ActiveFlag": false
        }
    ],

    team: [
        {
            "TeamID": "DUB01",
            "TeamName": "Dublin",
            "Code": "football"
        },
        {
            "TeamID": "KER01",
            "TeamName": "Kerry",
            "Code": "football"
        },
        {
            "TeamID": "GAL01",
            "TeamName": "Galway",
            "Code": "football"
        },
        {
            "TeamID": "MAY01",
            "TeamName": "Mayo",
            "Code": "football"
        },
        {
            "TeamID": "CORK01",
            "TeamName": "Cork",
            "Code": "football"
        },
        {
            "TeamID": "KIL01",
            "TeamName": "Kilkenny",
            "Code": "hurling"
        },
        {
            "TeamID": "TIP01",
            "TeamName": "Tipperary",
            "Code": "hurling"
        },
        {
            "TeamID": "LIM01",
            "TeamName": "Limerick",
            "Code": "hurling"
        },
        {
            "TeamID": "WEX01",
            "TeamName": "Wexford",
            "Code": "hurling"
        },
        {
            "TeamID": "CLA01",
            "TeamName": "Clare",
            "Code": "hurling"
        }
    ],


    lineups: [
        {
            "MatchID": "MATCH001",
            "TeamID": "DUB01",
            "PlayerID": "P001",
            "StarterFlag": true,
            "BenchOrder": null
        },
        {
            "MatchID": "MATCH001",
            "TeamID": "DUB01",
            "PlayerID": "P002",
            "StarterFlag": true,
            "BenchOrder": null
        },
        {
            "MatchID": "MATCH001",
            "TeamID": "DUB01",
            "PlayerID": "P006",
            "StarterFlag": false,
            "BenchOrder": 1
        },
        {
            "MatchID": "MATCH001",
            "TeamID": "DUB01",
            "PlayerID": "P005",
            "StarterFlag": false,
            "BenchOrder": 2
        },
        {
            "MatchID": "MATCH001",
            "TeamID": "KER01",
            "PlayerID": "P007",
            "StarterFlag": true,
            "BenchOrder": null
        },
        {
            "MatchID": "MATCH001",
            "TeamID": "KER01",
            "PlayerID": "P008",
            "StarterFlag": true,
            "BenchOrder": null
        },
        {
            "MatchID": "MATCH001",
            "TeamID": "KER01",
            "PlayerID": "P010",
            "StarterFlag": false,
            "BenchOrder": 1
        },
        {
            "MatchID": "MATCH001",
            "TeamID": "KER01",
            "PlayerID": "P009",
            "StarterFlag": false,
            "BenchOrder": 2
        }
    ],


    possessions: [
        {
            "PossessionID": "POS001",
            "MatchID": "MATCH001",
            "TeamInPossessionID": "DUB01",
            "StartType": "Kickout",
            "EndType": "Point",
            "Points": 1,
            "StartClock": "00:15",
            "EndClock": "00:52",
            "DurationSeconds": 37,
            "Half": 1,
            "StartSourceTag": "Kickout Won - Midfield",
            "PassCount": 4,
            "ShotZone": "Zone2",
            "Channel": "Left"
        },
        {
            "PossessionID": "POS002",
            "MatchID": "MATCH001",
            "TeamInPossessionID": "KER01",
            "StartType": "Turnover",
            "EndType": "Wide",
            "Points": 0,
            "StartClock": "05:10",
            "EndClock": "05:40",
            "DurationSeconds": 30,
            "Half": 1,
            "StartSourceTag": "Turnover in Defence",
            "PassCount": 3,
            "ShotZone": "Zone3",
            "Channel": "Right"
        },
        {
            "PossessionID": "POS003",
            "MatchID": "MATCH001",
            "TeamInPossessionID": "DUB01",
            "StartType": "Free",
            "EndType": "Goal",
            "Points": 3,
            "StartClock": "10:22",
            "EndClock": "10:50",
            "DurationSeconds": 28,
            "Half": 1,
            "StartSourceTag": "Free Won - Forward",
            "PassCount": 1,
            "ShotZone": "Zone1",
            "Channel": "Centre"
        },
        {
            "PossessionID": "POS004",
            "MatchID": "MATCH001",
            "TeamInPossessionID": "KER01",
            "StartType": "Puckout",
            "EndType": "Turnover",
            "Points": 0,
            "StartClock": "15:00",
            "EndClock": "15:25",
            "DurationSeconds": 25,
            "Half": 1,
            "StartSourceTag": "Puckout Lost",
            "PassCount": 2,
            "ShotZone": null,
            "Channel": "Centre"
        }
    ],


    event: [
        {
            "EventID": "EV001",
            "MatchID": "MATCH001",
            "PossessionID": "POS001",
            "TeamID": "DUB01",
            "PlayerID": "P002",
            "EventType": "Kickout",
            "SubType": "Short Kickout",
            "Outcome": "Successful",
            "Clock": "00:15",
            "Zone": "Zone1",
            "DistanceBand": "0-20m",
            "AssistPlayerID": null,
            "CardType": null,
            "Notes": "Goalkeeper played short to corner-back"
        },
        {
            "EventID": "EV002",
            "MatchID": "MATCH001",
            "PossessionID": "POS001",
            "TeamID": "DUB01",
            "PlayerID": "P003",
            "EventType": "Pass",
            "SubType": "Hand Pass",
            "Outcome": "Successful",
            "Clock": "00:25",
            "Zone": "Zone2",
            "DistanceBand": "0-20m",
            "AssistPlayerID": null,
            "CardType": null,
            "Notes": "Quick hand pass to midfielder"
        },
        {
            "EventID": "EV003",
            "MatchID": "MATCH001",
            "PossessionID": "POS001",
            "TeamID": "DUB01",
            "PlayerID": "P005",
            "EventType": "Shot",
            "SubType": "Kick",
            "Outcome": "Point",
            "Clock": "00:52",
            "Zone": "Zone2",
            "DistanceBand": "20-40m",
            "AssistPlayerID": "P004",
            "CardType": null,
            "Notes": "Scored from play after buildup"
        },
        {
            "EventID": "EV004",
            "MatchID": "MATCH001",
            "PossessionID": "POS002",
            "TeamID": "KER01",
            "PlayerID": "P101",
            "EventType": "Turnover",
            "SubType": "Interception",
            "Outcome": "Successful",
            "Clock": "05:12",
            "Zone": "Zone2",
            "DistanceBand": null,
            "AssistPlayerID": null,
            "CardType": null,
            "Notes": "Defender intercepted pass"
        },
        {
            "EventID": "EV005",
            "MatchID": "MATCH001",
            "PossessionID": "POS003",
            "TeamID": "DUB01",
            "PlayerID": "P005",
            "EventType": "Shot",
            "SubType": "Free Kick",
            "Outcome": "Goal",
            "Clock": "10:50",
            "Zone": "Zone1",
            "DistanceBand": "20-40m",
            "AssistPlayerID": null,
            "CardType": null,
            "Notes": "Free taken directly for a goal"
        },
        {
            "EventID": "EV006",
            "MatchID": "MATCH001",
            "PossessionID": "POS004",
            "TeamID": "KER01",
            "PlayerID": "P108",
            "EventType": "Foul",
            "SubType": "Pull Down",
            "Outcome": "Free Conceded",
            "Clock": "15:20",
            "Zone": "Zone2",
            "DistanceBand": null,
            "AssistPlayerID": null,
            "CardType": "Yellow",
            "Notes": "Cynical foul on midfielder"
        }
    ],


    // restart: [
    //     {
    //         "RestartID": "RS001",
    //         "MatchID": "MATCH001",
    //         "TeamID": "DUB01",
    //         "TakerPlayerID": "P001",
    //         "Type": "Kickout",
    //         "LengthBand": "Short (0-20m)",
    //         "TargetZone": "Zone1",
    //         "Result": "Won Clean",
    //         "LedToShotFlag": false,
    //         "LedToScoreFlag": false,
    //         "Clock": "00:15"
    //     },
    //     {
    //         "RestartID": "RS002",
    //         "MatchID": "MATCH001",
    //         "TeamID": "KER01",
    //         "TakerPlayerID": "P101",
    //         "Type": "Kickout",
    //         "LengthBand": "Medium (20-40m)",
    //         "TargetZone": "Zone2",
    //         "Result": "Contested",
    //         "LedToShotFlag": true,
    //         "LedToScoreFlag": false,
    //         "Clock": "03:42"
    //     },
    //     {
    //         "RestartID": "RS003",
    //         "MatchID": "MATCH001",
    //         "TeamID": "DUB01",
    //         "TakerPlayerID": "P004",
    //         "Type": "Free",
    //         "LengthBand": "Medium (20-40m)",
    //         "TargetZone": "Zone3",
    //         "Result": "Won Clean",
    //         "LedToShotFlag": true,
    //         "LedToScoreFlag": true,
    //         "Clock": "10:50"
    //     },
    //     {
    //         "RestartID": "RS004",
    //         "MatchID": "MATCH001",
    //         "TeamID": "KER01",
    //         "TakerPlayerID": "P109",
    //         "Type": "Sideline",
    //         "LengthBand": "Short (0-20m)",
    //         "TargetZone": "Zone2",
    //         "Result": "Lost",
    //         "LedToShotFlag": false,
    //         "LedToScoreFlag": false,
    //         "Clock": "18:20"
    //     },
    //     {
    //         "RestartID": "RS005",
    //         "MatchID": "MATCH001",
    //         "TeamID": "DUB01",
    //         "TakerPlayerID": "P005",
    //         "Type": "Free",
    //         "LengthBand": "Long (40m+)",
    //         "TargetZone": "Zone3",
    //         "Result": "Won Clean",
    //         "LedToShotFlag": true,
    //         "LedToScoreFlag": false,
    //         "Clock": "25:10"
    //     }
    // ],









};

export default data;