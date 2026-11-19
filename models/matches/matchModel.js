import { store, nextId } from "../store.js";

export function getAllMatches() {
  const sportMap = Object.fromEntries(store.sports.map((s) => [s.id, s]));
  return store.matches.map((match) => ({
    ...match,
    sportName: sportMap[match.sportId]?.name || "General Athletics",
    sportCategory: sportMap[match.sportId]?.category || "Athletics"
  }));
}

export function getFixtures() {
  return getAllMatches()
    .filter((m) => m.status !== "Completed")
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getResults() {
  return getAllMatches()
    .filter((m) => m.status === "Completed")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function createMatch(payload) {
  const sportId = store.sports.some((s) => s.id === payload.sportId)
    ? payload.sportId
    : store.sports[0]?.id || "spt-basketball";
  const homeTeam = String(payload.homeTeam || "Track University").trim();
  const awayTeam = String(payload.awayTeam || "Visiting Opponent").trim();
  const match = {
    id: nextId("mat"),
    sportId,
    title: String(payload.title || `${homeTeam} vs. ${awayTeam}`).trim(),
    homeTeam,
    awayTeam,
    date: String(payload.date || "2026-12-01").trim(),
    time: String(payload.time || "18:00").trim(),
    venue: String(payload.venue || "Northgate Arena").trim(),
    round: String(payload.round || "Regular Season").trim(),
    status: String(payload.status || "Scheduled").trim(),
    homeScore: null,
    awayScore: null,
    mvp: null,
    notes: String(payload.notes || "Official collegiate fixture.").trim()
  };
  store.matches.unshift(match);
  return getAllMatches().find((m) => m.id === match.id);
}

export function recordMatchResult(matchId, payload) {
  const match = store.matches.find((m) => m.id === matchId);
  if (!match) return null;
  const wasCompleted = match.status === "Completed";
  const homeScore = Math.max(0, Number(payload.homeScore) || 0);
  const awayScore = Math.max(0, Number(payload.awayScore) || 0);
  match.homeScore = homeScore;
  match.awayScore = awayScore;
  match.mvp = String(payload.mvp || "Team Effort").trim();
  if (payload.notes) match.notes = String(payload.notes).trim();
  match.status = "Completed";

  if (!wasCompleted) {
    const sport = store.sports.find((s) => s.id === match.sportId);
    if (sport) {
      sport.pointsFor += homeScore;
      sport.pointsAgainst += awayScore;
      if (homeScore >= awayScore) sport.wins += 1;
      else sport.losses += 1;
    }
    store.students
      .filter((stu) => stu.enrolledSports.includes(match.sportId))
      .forEach((stu) => {
        stu.matchesPlayed += 1;
        if (homeScore >= awayScore) {
          stu.wins += 1;
          stu.points += 18;
        } else {
          stu.points += 6;
        }
      });
  }

  return getAllMatches().find((m) => m.id === match.id);
}

export function deleteMatch(id) {
  const idx = store.matches.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  store.matches.splice(idx, 1);
  return true;
}
