import { store, nextId } from "../store.js";

export function getAllSports() {
  return store.sports.map((sport) => {
    const rosterCount = store.students.filter((s) => s.enrolledSports.includes(sport.id)).length;
    const nextFixture =
      store.matches
        .filter((m) => m.sportId === sport.id && m.status !== "Completed")
        .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
    return {
      ...sport,
      rosterCount,
      nextFixture
    };
  });
}

export function getSportById(id) {
  return getAllSports().find((s) => s.id === id) || null;
}

export function createSport(payload) {
  const sport = {
    id: nextId("spt"),
    name: String(payload.name || "New Sport").trim(),
    category: String(payload.category || "Team Court").trim(),
    coach: String(payload.coach || "Staff Coach").trim(),
    venue: String(payload.venue || "Main Athletic Complex").trim(),
    season: String(payload.season || "2026–27").trim(),
    schedule: String(payload.schedule || "Mon & Wed · 17:00").trim(),
    maxRoster: Math.max(4, Number(payload.maxRoster) || 20),
    status: String(payload.status || "Active").trim(),
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    image: null,
    summary: String(payload.summary || "Collegiate competitive program tracked on Track.").trim()
  };
  store.sports.push(sport);
  return getSportById(sport.id);
}

export function updateSport(id, payload) {
  const sport = store.sports.find((s) => s.id === id);
  if (!sport) return null;
  if (payload.name) sport.name = String(payload.name).trim();
  if (payload.category) sport.category = String(payload.category).trim();
  if (payload.coach) sport.coach = String(payload.coach).trim();
  if (payload.venue) sport.venue = String(payload.venue).trim();
  if (payload.season) sport.season = String(payload.season).trim();
  if (payload.schedule) sport.schedule = String(payload.schedule).trim();
  if (payload.status) sport.status = String(payload.status).trim();
  if (payload.maxRoster) sport.maxRoster = Math.max(4, Number(payload.maxRoster));
  if (payload.summary) sport.summary = String(payload.summary).trim();
  return getSportById(id);
}

export function deleteSport(id) {
  const idx = store.sports.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  store.sports.splice(idx, 1);
  store.matches = store.matches.filter((m) => m.sportId !== id);
  store.students.forEach((stu) => {
    stu.enrolledSports = stu.enrolledSports.filter((sid) => sid !== id);
    if (stu.primarySportId === id) {
      stu.primarySportId = stu.enrolledSports[0] || store.sports[0]?.id || "";
    }
  });
  return true;
}
