import { getLeaderboard, getTeamStandings } from "../../models/leaderboard/leaderboardModel.js";
import { getAllSports } from "../../models/sports/sportModel.js";

export function renderLeaderboard(req, res) {
  const sportFilter = req.query.sport || "all";
  const sortBy = req.query.sort || "points";
  const athletes = getLeaderboard(sportFilter, sortBy);
  const teamStandings = getTeamStandings();
  const sports = getAllSports();

  res.render("leaderboard/index", {
    pageTitle: "Leaderboard — Track",
    activeNav: "leaderboard",
    workspace: "public",
    athletes,
    teamStandings,
    sports,
    sportFilter,
    sortBy
  });
}
