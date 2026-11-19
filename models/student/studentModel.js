import { store, nextId } from "../store.js";
import { getSportById } from "../sports/sportModel.js";

export function getAllStudents() {
  const sportMap = Object.fromEntries(store.sports.map((s) => [s.id, s]));
  return store.students.map((student) => ({
    ...student,
    primarySportName: sportMap[student.primarySportId]?.name || "Unassigned",
    enrolledSportNames: student.enrolledSports.map((id) => sportMap[id]?.name).filter(Boolean),
    winRate: student.matchesPlayed > 0 ? Math.round((student.wins / student.matchesPlayed) * 100) : 0
  }));
}

export function getStudentById(id) {
  const all = getAllStudents();
  return all.find((s) => s.id === id) || all[0] || null;
}

export function toggleEnrollment(studentId, sportId) {
  const student = store.students.find((s) => s.id === studentId);
  const sport = store.sports.find((sp) => sp.id === sportId);
  if (!student || !sport) return null;

  const exists = student.enrolledSports.includes(sportId);
  if (exists) {
    student.enrolledSports = student.enrolledSports.filter((id) => id !== sportId);
    if (student.primarySportId === sportId) {
      student.primarySportId = student.enrolledSports[0] || sportId;
    }
  } else {
    const currentRoster = store.students.filter((s) => s.enrolledSports.includes(sportId)).length;
    if (currentRoster >= sport.maxRoster) {
      return { error: `${sport.name} roster is currently at capacity (${sport.maxRoster}/${sport.maxRoster}).` };
    }
    student.enrolledSports.push(sportId);
  }
  return { enrolled: !exists, student: getStudentById(studentId), sport: getSportById(sportId) };
}

export function updateStudentProfile(studentId, payload) {
  const student = store.students.find((s) => s.id === studentId);
  if (!student) return null;
  if (payload.name && payload.name.trim()) student.name = payload.name.trim();
  if (payload.email && payload.email.trim()) student.email = payload.email.trim();
  if (payload.department && payload.department.trim()) student.department = payload.department.trim();
  if (payload.year && payload.year.trim()) student.year = payload.year.trim();
  if (payload.position && payload.position.trim()) student.position = payload.position.trim();
  if (payload.personalBest !== undefined) student.personalBest = String(payload.personalBest).trim();
  if (payload.bio !== undefined) student.bio = String(payload.bio).trim();
  if (payload.jersey !== undefined && !Number.isNaN(Number(payload.jersey))) {
    student.jersey = Math.max(0, Math.min(99, Number(payload.jersey)));
  }
  if (payload.primarySportId && store.sports.some((s) => s.id === payload.primarySportId)) {
    student.primarySportId = payload.primarySportId;
    if (!student.enrolledSports.includes(payload.primarySportId)) {
      student.enrolledSports.push(payload.primarySportId);
    }
  }
  return getStudentById(studentId);
}

export function addPerformanceLog(studentId, entry) {
  const student = store.students.find((s) => s.id === studentId);
  if (!student) return null;
  const log = {
    id: nextId("log"),
    date: entry.date || new Date().toISOString().slice(0, 10),
    metric: String(entry.metric || "Training Split").trim(),
    value: String(entry.value || "").trim(),
    note: String(entry.note || "").trim()
  };
  student.logs.unshift(log);
  student.points += 8;
  student.rating = Number(Math.min(99.9, student.rating + 0.2).toFixed(1));
  return { log, student: getStudentById(studentId) };
}

export function createStudent(payload) {
  const primarySportId = store.sports.some((s) => s.id === payload.primarySportId)
    ? payload.primarySportId
    : store.sports[0]?.id || "spt-track";
  const count = store.students.length + 1;
  const student = {
    id: nextId("stu"),
    name: String(payload.name || "New Athlete").trim(),
    studentCode: `TRK-2026-${String(count + 80).padStart(3, "0")}`,
    email: String(payload.email || `athlete${count}@college.edu`).trim(),
    department: String(payload.department || "General Studies").trim(),
    year: String(payload.year || "Freshman").trim(),
    jersey: Number(payload.jersey) || count + 10,
    primarySportId,
    enrolledSports: [primarySportId],
    position: String(payload.position || "Varsity Squad").trim(),
    matchesPlayed: Math.max(0, Number(payload.matchesPlayed) || 0),
    wins: Math.max(0, Number(payload.wins) || 0),
    points: Math.max(0, Number(payload.points) || 120),
    rating: Math.min(99.9, Math.max(60, Number(payload.rating) || 84.0)),
    personalBest: String(payload.personalBest || "Season Debut").trim(),
    bio: String(payload.bio || "Registered college varsity athlete.").trim(),
    logs: []
  };
  store.students.unshift(student);
  return getStudentById(student.id);
}

export function deleteStudent(id) {
  const idx = store.students.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  store.students.splice(idx, 1);
  return true;
}
