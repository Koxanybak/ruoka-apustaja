import { pool } from "../utils/config"
import { StoreEntry } from "../types"
import { parseStoreEntry } from "../utils/type-parsers"

// gets all the stores
export const getStores = async (name: string | undefined, city: string | undefined): Promise<StoreEntry[]> => {
  const queryText = "SELECT * FROM stores WHERE LOWER(name) LIKE LOWER($1) AND LOWER(city) LIKE LOWER($2)"
  name = name ? name : ""
  city = city ? city : ""

  const res = await pool.query(queryText, [`%${name}%`, `%${city}%`])
  console.log("stores")

  return res.rows.map(row => parseStoreEntry(row))
}

// gets a single store
export const getStoreById = async (id: string | undefined): Promise<StoreEntry | null> => {
  const queryText = "SELECT * FROM stores WHERE id = $1"
  id = id ? id : ""
  const res = await pool.query(queryText, [parseInt(id)])

  return res.rows.map(row => parseStoreEntry(row))[0]
}