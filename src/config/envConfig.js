import { config } from "dotenv";
config();

const {
  DB_URI,
  PORT,
  SERVER_IP,
  JWT_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  BUCKET_NAME,
} = process.env;

const serverIP = SERVER_IP || "http://127.0.0.1";
const port = PORT || 8000;
const jwtSecretKey = JWT_SECRET_KEY;
const refreshTokenSecretKey = REFRESH_TOKEN_SECRET_KEY;
const dbUri = DB_URI;
const awsAccessKey = AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = AWS_SECRET_ACCESS_KEY;
const awsRegion = AWS_REGION;
const bucketName = BUCKET_NAME;

export default {
  serverIP,
  port,
  jwtSecretKey,
  refreshTokenSecretKey,
  dbUri,
  awsAccessKey,
  awsSecretAccessKey,
  awsRegion,
  bucketName,
};
