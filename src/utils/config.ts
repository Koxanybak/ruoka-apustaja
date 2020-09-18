import { Pool } from "pg"
import dotenv from "dotenv"
dotenv.config()

// connection may fail with scrape script
const pool = new Pool({
  user: "postgres",
  host: process.env.NODE_ENV === "production" ? "db" : "localhost",
  database: "ruoka_apustaja",
  password: "postgres",
  port: 5432,
})

const SECRET = <string>process.env.SECRET
if (!SECRET) {
  process.exit()
}

const REFRESH_COOKIE_NAME = "ruoka_apustaja_refresh_token"
const DEFAULT_TOKEN_EXP_SEC = 30*60

export { SECRET, pool, REFRESH_COOKIE_NAME, DEFAULT_TOKEN_EXP_SEC }