import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";

import connectDB from "./config/db.js";
import apiRouter from "./routes/index.js";
import authRoutes from "./routes/auth.routes.js";
import logger from "./utils/logger.util.js";
import errorMiddleware from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.resolve(__dirname, "../swagger/swagger.yml");
const swaggerDocument = YAML.load(swaggerPath);


// Initialize DB connection
connectDB();

const app = express();
app.use(passport.initialize());

const stream = {
  write: (message) => logger.info(message.trim()),
};

const morganMiddleware = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream }
);

// Middlewares
app.use(morganMiddleware);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:4200",
  credentials: true
}));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Headers
app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api", apiRouter);
app.use("/auth", authRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
