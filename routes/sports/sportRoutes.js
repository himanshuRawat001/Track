import { Router } from "express";
import {
  renderExploreSports,
  getSportDetails,
  createSportAction,
  updateSportAction,
  deleteSportAction
} from "../../controllers/sports/sportController.js";

const router = Router();

router.get("/sports", renderExploreSports);

router.get("/api/sports/:id", getSportDetails);
router.post("/api/sports", createSportAction);
router.post("/api/sports/:id", updateSportAction);
router.delete("/api/sports/:id", deleteSportAction);

export default router;
