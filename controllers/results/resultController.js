import { getResults } from "../../models/matches/matchModel.js";
import { getAllSports } from "../../models/sports/sportModel.js";

export function renderResults(req, res) {
  const results = getResults();
  const sports = getAllSports();

  res.render("results/index", {
    pageTitle: "Match Results — Track",
    activeNav: "results",
    workspace: "public",
    results,
    sports
  });
}
