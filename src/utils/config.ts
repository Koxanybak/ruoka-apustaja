import { Pool } from "pg"
import dotenv from "dotenv"
dotenv.config()

export const pool = new Pool()