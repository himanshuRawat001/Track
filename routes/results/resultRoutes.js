import { Router } from "express";
import { renderResults } from "../../controllers/results/resultController.js";

const router = Router();

router.get("/results", renderResults);

export default router;
