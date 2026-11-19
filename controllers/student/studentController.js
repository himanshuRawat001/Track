import {
  getAllStudents,
  getStudentById,
  toggleEnrollment,
  updateStudentProfile,
  addPerformanceLog,
  createStudent,
  deleteStudent
} from "../../models/student/studentModel.js";
import { getAllSports } from "../../models/sports/sportModel.js";
import { getFixtures, getResults } from "../../models/matches/matchModel.js";
import { getLeaderboard } from "../../models/leaderboard/leaderboardModel.js";

export function resolveActiveStudent(req) {
  const id = req.query.studentId || req.query.id || req.headers["x-student-id"] || "stu-1";
  return getStudentById(id);
}

export function renderDashboard(req, res) {
  const activeStudent = resolveActiveStudent(req);
  const allStudents = getAllStudents();
  const allSports = getAllSports();
  const enrolledSportDetails = allSports.filter((s) => activeStudent.enrolledSports.includes(s.id));
  const personalFixtures = getFixtures().filter((m) => activeStudent.enrolledSports.includes(m.sportId));
  const recentResults = getResults()
    .filter((m) => activeStudent.enrolledSports.includes(m.sportId))
    .slice(0, 4);
  const leaderboard = getLeaderboard("all", "points");
  const studentRank = leaderboard.find((l) => l.id === activeStudent.id)?.rank || 1;

  res.render("student/dashboard", {
    pageTitle: `Student Dashboard · ${activeStudent.name} — Track`,
    activeNav: "student-dashboard",
    workspace: "student",
    breadcrumbs: ["Student Portal", "Dashboard"],
    activeStudent,
    allStudents,
    enrolledSportDetails,
    personalFixtures,
    recentResults,
    studentRank
  });
}

export function renderProfile(req, res) {
  const activeStudent = resolveActiveStudent(req);
  const allStudents = getAllStudents();
  const allSports = getAllSports();
  const enrolledSportDetails = allSports.filter((s) => activeStudent.enrolledSports.includes(s.id));
  const leaderboard = getLeaderboard("all", "points");
  const studentRank = leaderboard.find((l) => l.id === activeStudent.id)?.rank || 1;

  res.render("student/profile", {
    pageTitle: `${activeStudent.name} · Athlete Profile — Track`,
    activeNav: "student-profile",
    workspace: "student",
    breadcrumbs: ["Student Portal", "Athlete Profile", activeStudent.name],
    activeStudent,
    allStudents,
    allSports,
    enrolledSportDetails,
    studentRank
  });
}

export function enrollSport(req, res) {
  const { studentId, sportId } = req.body;
  const result = toggleEnrollment(studentId || "stu-1", sportId);
  if (!result) return res.status(404).json({ error: "Student or sport not found." });
  if (result.error) return res.status(400).json({ error: result.error });
  return res.json(result);
}

export function createStudentAction(req, res) {
  if (!req.body.name || !String(req.body.name).trim()) {
    return res.status(400).json({ error: "Athlete name is required." });
  }
  const student = createStudent(req.body);
  return res.status(201).json({ student });
}

export function updateStudentAction(req, res) {
  const updated = updateStudentProfile(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Student not found." });
  return res.json({ student: updated });
}

export function deleteStudentAction(req, res) {
  const removed = deleteStudent(req.params.id);
  if (!removed) return res.status(404).json({ error: "Student not found." });
  return res.json({ deleted: true });
}

export function addLogAction(req, res) {
  if (!req.body.value || !String(req.body.value).trim()) {
    return res.status(400).json({ error: "Performance measurement is required." });
  }
  const result = addPerformanceLog(req.params.id, req.body);
  if (!result) return res.status(404).json({ error: "Student not found." });
  return res.status(201).json(result);
}
