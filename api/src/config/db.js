import mongoose from "mongoose";
import Logger from "../utils/logger.util.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI).then(() => {
      Logger.info(`DB Connected Successfully`)
    }).catch((err) => {
      Logger.error(`DB Connection Failed`)
      process.exit(1)
    })
  } catch (err) {
    Logger.error(err.message)
    process.exit(1)
  }
}

export default connectDB;
