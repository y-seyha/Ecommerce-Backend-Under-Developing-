import "dotenv/config";
import { Database } from "Configuration/database.js";
import { Logger } from "./utils/logger.js";
import app from "./app.js";

const logger = Logger.getInstance();

//Database Connection
Database.getIntance();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
