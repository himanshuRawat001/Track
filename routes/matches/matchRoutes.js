import { Router } from "express";
import {
  renderFixtures,
  createMatchAction,
  recordResultAction,
  deleteMatchAction
} from "../../controllers/matches/matchController.js";

const router = Router();

router.get("/matches", renderFixtures);

router.post("/api/matches", createMatchAction);
router.post("/api/matches/:id/result", recordResultAction);
router.delete("/api/matches/:id", deleteMatchAction);

export default router;
