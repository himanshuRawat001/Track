import {
  getFixtures,
  createMatch,
  recordMatchResult,
  deleteMatch
} from "../../models/matches/matchModel.js";
import { getAllSports } from "../../models/sports/sportModel.js";

export function renderFixtures(req, res) {
  const fixtures = getFixtures();
  const sports = getAllSports();

  res.render("matches/fixtures", {
    pageTitle: "Matches & Fixtures — Track",
    activeNav: "matches",
    workspace: "public",
    fixtures,
    sports
  });
}

export function createMatchAction(req, res) {
  if (!req.body.awayTeam || !String(req.body.awayTeam).trim()) {
    return res.status(400).json({ error: "Opponent team is required." });
  }
  const match = createMatch(req.body);
  return res.status(201).json({ match });
}

export function recordResultAction(req, res) {
  const match = recordMatchResult(req.params.id, req.body);
  if (!match) return res.status(404).json({ error: "Match not found." });
  return res.json({ match });
}

export function deleteMatchAction(req, res) {
  const removed = deleteMatch(req.params.id);
  if (!removed) return res.status(404).json({ error: "Match not found." });
  return res.json({ deleted: true });
}
