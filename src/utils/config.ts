import { Pool } from "pg"
import dotenv from "dotenv"
dotenv.config()

const pool = new Pool()
const SECRET = <string>process.env.SECRET
if (!SECRET) {
  process.exit()
}
export { SECRET, pool }