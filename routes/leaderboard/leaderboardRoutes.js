import { Router } from "express";
import { renderLeaderboard } from "../../controllers/leaderboard/leaderboardController.js";

const router = Router();

router.get("/leaderboard", renderLeaderboard);

export default router;
