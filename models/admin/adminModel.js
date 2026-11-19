import { getAllSports } from "../sports/sportModel.js";
import { getAllStudents } from "../student/studentModel.js";
import { getFixtures, getResults } from "../matches/matchModel.js";

export function getDashboardStats() {
  const sports = getAllSports();
  const students = getAllStudents();
  const fixtures = getFixtures();
  const results = getResults();
  const totalWins = sports.reduce((acc, s) => acc + s.wins, 0);
  const totalGames = sports.reduce((acc, s) => acc + s.wins + s.losses, 0);
  const avgWinPct = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  return {
    activeSportsCount: sports.filter((s) => s.status === "Active").length,
    totalSportsCount: sports.length,
    totalStudentsCount: students.length,
    upcomingFixturesCount: fixtures.length,
    completedResultsCount: results.length,
    avgWinPct
  };
}
