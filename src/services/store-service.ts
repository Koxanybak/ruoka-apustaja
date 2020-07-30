import { pool } from "../utils/config"
import { StoreEntry } from "../types"
import logger from "../utils/logger"
import { parseStoreEntry } from "../utils/type-parsers"

// gets all the stores
export const getStores = async (name: string, city: string): Promise<StoreEntry[]> => {
  let queryText = ""
  if (name && city) {
    queryText = "SELECT * FROM stores"
  }
  try {
    const res = await pool.query(queryText)

    return res.rows.map(row => parseStoreEntry(row))
  } catch (err) {
    logger.error("Error executing query:", err)
  }

  return []
}

// gets a single store
export const getStoreById = async (id: string): Promise<StoreEntry | null> => {
  const queryText = "SELECT * FROM stores WHERE id = $1"
  try {
    const res = await pool.query(queryText, [parseInt(id)])

    return res.rows.map(row => parseStoreEntry(row))[0]
  } catch (err) {
    logger.error("Error executing query:", err)
  }

  return null
}