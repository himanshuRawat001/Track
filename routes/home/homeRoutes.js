import { Router } from "express";
import { renderHome } from "../../controllers/home/homeController.js";

const router = Router();

router.get("/", renderHome);

export default router;
