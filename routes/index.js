import homeRoutes from "./home/homeRoutes.js";
import studentRoutes from "./student/studentRoutes.js";
import sportRoutes from "./sports/sportRoutes.js";
import matchRoutes from "./matches/matchRoutes.js";
import resultRoutes from "./results/resultRoutes.js";
import leaderboardRoutes from "./leaderboard/leaderboardRoutes.js";
import adminRoutes from "./admin/adminRoutes.js";

export function registerRoutes(app) {
  app.use(homeRoutes);
  app.use(studentRoutes);
  app.use(sportRoutes);
  app.use(matchRoutes);
  app.use(resultRoutes);
  app.use(leaderboardRoutes);
  app.use(adminRoutes);
}
