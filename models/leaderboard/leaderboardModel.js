import { getAllStudents } from "../student/studentModel.js";
import { getAllSports } from "../sports/sportModel.js";

export function getLeaderboard(sportFilter = "all", sortBy = "points") {
  let athletes = getAllStudents();
  if (sportFilter && sportFilter !== "all") {
    athletes = athletes.filter(
      (a) => a.primarySportId === sportFilter || a.enrolledSports.includes(sportFilter)
    );
  }
  const sorters = {
    points: (a, b) => b.points - a.points || b.rating - a.rating,
    rating: (a, b) => b.rating - a.rating || b.points - a.points,
    wins: (a, b) => b.wins - a.wins || b.winRate - a.winRate,
    winRate: (a, b) => b.winRate - a.winRate || b.wins - a.wins
  };
  const sorted = [...athletes].sort(sorters[sortBy] || sorters.points);
  return sorted.map((athlete, index) => ({
    ...athlete,
    rank: index + 1
  }));
}

export function getTeamStandings() {
  return getAllSports()
    .map((sport) => {
      const total = sport.wins + sport.losses;
      const winPct = total > 0 ? Math.round((sport.wins / total) * 100) : 0;
      const diff = sport.pointsFor - sport.pointsAgainst;
      return {
        ...sport,
        played: total,
        winPct,
        diff
      };
    })
    .sort((a, b) => b.winPct - a.winPct || b.wins - a.wins)
    .map((team, idx) => ({ ...team, rank: idx + 1 }));
}
