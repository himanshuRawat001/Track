import { Router } from "express";
import {
  renderAdminDashboard,
  renderManageStudents,
  renderManageSportsMatches
} from "../../controllers/admin/adminController.js";

const router = Router();

router.get("/admin", renderAdminDashboard);
router.get("/admin/students", renderManageStudents);
router.get("/admin/sports-matches", renderManageSportsMatches);

export default router;
