import { Router } from "express";
import {
  renderDashboard,
  renderProfile,
  enrollSport,
  createStudentAction,
  updateStudentAction,
  deleteStudentAction,
  addLogAction
} from "../../controllers/student/studentController.js";

const router = Router();

router.get("/student", renderDashboard);
router.get("/student/profile", renderProfile);

router.post("/api/enroll", enrollSport);
router.post("/api/students", createStudentAction);
router.post("/api/students/:id", updateStudentAction);
router.delete("/api/students/:id", deleteStudentAction);
router.post("/api/students/:id/logs", addLogAction);

export default router;
