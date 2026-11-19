import { getDashboardStats } from "../../models/admin/adminModel.js";
import { getAllSports } from "../../models/sports/sportModel.js";
import { getAllStudents } from "../../models/student/studentModel.js";
import { getFixtures, getResults } from "../../models/matches/matchModel.js";
import { getLeaderboard } from "../../models/leaderboard/leaderboardModel.js";

export function renderAdminDashboard(req, res) {
  const stats = getDashboardStats();
  const sports = getAllSports();
  const fixtures = getFixtures();
  const results = getResults();
  const topAthletes = getLeaderboard("all", "points").slice(0, 6);

  res.render("admin/dashboard", {
    pageTitle: "Admin Console — Track",
    activeNav: "admin-dashboard",
    workspace: "admin",
    breadcrumbs: ["Admin Console", "Overview"],
    stats,
    sports,
    fixtures,
    results,
    topAthletes
  });
}

export function renderManageStudents(req, res) {
  const students = getAllStudents();
  const sports = getAllSports();

  res.render("admin/students", {
    pageTitle: "Manage Students · Admin Console — Track",
    activeNav: "admin-students",
    workspace: "admin",
    breadcrumbs: ["Admin Console", "Manage Students"],
    students,
    sports
  });
}

export function renderManageSportsMatches(req, res) {
  const sports = getAllSports();
  const fixtures = getFixtures();
  const results = getResults();

  res.render("admin/sports-matches", {
    pageTitle: "Manage Sports & Matches · Admin Console — Track",
    activeNav: "admin-sports-matches",
    workspace: "admin",
    breadcrumbs: ["Admin Console", "Manage Sports & Matches"],
    sports,
    fixtures,
    results
  });
}
