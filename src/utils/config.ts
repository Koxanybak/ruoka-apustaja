import { Pool } from "pg"
import dotenv from "dotenv"
import { createClient } from "redis"
dotenv.config()

// Connection may fail with scrape script (TULEVAISUUDEN LEEVI: Kui ihmees? Oisit kertonu enemmän.)
const pool = new Pool({
  user: "postgres",
  host: process.env.NODE_ENV === "production" ? "db" : "localhost",
  database: "ruoka_apustaja",
  password: "postgres",
  port: 5432,
})

const redis_client = createClient({
  host: process.env.NODE_ENV === "production" ? "redis" : "localhost",
  port: 6379,
})

const SECRET = <string>process.env.SECRET
if (!SECRET) {
  console.error("NO SECRET ENVIROMENT VARIABLE")
  process.exit()
}

const REFRESH_COOKIE_NAME = "ruoka_apustaja_refresh_token"
const DEFAULT_TOKEN_EXP_SEC = 30*60

export { SECRET, pool, REFRESH_COOKIE_NAME, DEFAULT_TOKEN_EXP_SEC, redis_client }