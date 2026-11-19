import {
  getAllSports,
  getSportById,
  createSport,
  updateSport,
  deleteSport
} from "../../models/sports/sportModel.js";
import { getAllStudents } from "../../models/student/studentModel.js";
import { resolveActiveStudent } from "../student/studentController.js";

export function renderExploreSports(req, res) {
  const activeStudent = resolveActiveStudent(req);
  const allStudents = getAllStudents();
  const sports = getAllSports();
  const categories = ["All", ...new Set(sports.map((s) => s.category))];

  res.render("sports/explore", {
    pageTitle: "Explore Sports — Track",
    activeNav: "sports",
    workspace: "public",
    activeStudent,
    allStudents,
    sports,
    categories
  });
}

export function getSportDetails(req, res) {
  const sport = getSportById(req.params.id);
  if (!sport) return res.status(404).json({ error: "Sport not found." });
  const roster = getAllStudents().filter((s) => s.enrolledSports.includes(sport.id));
  return res.json({ sport, roster });
}

export function createSportAction(req, res) {
  if (!req.body.name || !String(req.body.name).trim()) {
    return res.status(400).json({ error: "Sport name is required." });
  }
  const sport = createSport(req.body);
  return res.status(201).json({ sport });
}

export function updateSportAction(req, res) {
  const sport = updateSport(req.params.id, req.body);
  if (!sport) return res.status(404).json({ error: "Sport not found." });
  return res.json({ sport });
}

export function deleteSportAction(req, res) {
  const removed = deleteSport(req.params.id);
  if (!removed) return res.status(404).json({ error: "Sport not found." });
  return res.json({ deleted: true });
}
