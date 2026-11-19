import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/src/assets", express.static(path.join(__dirname, "src/assets")));

registerRoutes(app);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Track MVC server listening on http://0.0.0.0:${PORT}`);
});
