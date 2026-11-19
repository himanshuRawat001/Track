import { HERO_IMAGE } from "../../models/store.js";
import { getDashboardStats } from "../../models/admin/adminModel.js";
import { getAllSports } from "../../models/sports/sportModel.js";
import { getFixtures, getResults } from "../../models/matches/matchModel.js";
import { getLeaderboard } from "../../models/leaderboard/leaderboardModel.js";

export function renderHome(req, res) {
  const stats = getDashboardStats();
  const sports = getAllSports();
  const fixtures = getFixtures().slice(0, 4);
  const results = getResults().slice(0, 4);
  const topAthletes = getLeaderboard("all", "points").slice(0, 5);

  res.render("home/index", {
    pageTitle: "Track — College Sports Management & Performance Tracking",
    activeNav: "home",
    heroImage: HERO_IMAGE,
    stats,
    sports,
    fixtures,
    results,
    topAthletes
  });
}
