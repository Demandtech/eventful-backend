import dotenv from "dotenv";
dotenv.config();

const config = {
  databaseUrl: process.env.DATABASE_HOST,
  serverPort: process.env.PORT,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  jwtSecret: process.env.JWT_SECRET,
};

export default config;
