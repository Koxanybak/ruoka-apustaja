import { pool } from "../utils/config"
import { StoreEntry, ItemCheck } from "../types"
import { parseStoreEntry, parseItemCheck } from "../utils/type-parsers"
import { NoContentError } from "../utils/errors"

// gets all the stores
export const getStores = async (name: string | undefined, city: string | undefined): Promise<StoreEntry[]> => {
  const queryText = "SELECT * FROM stores WHERE LOWER(name) LIKE LOWER($1) AND LOWER(city) LIKE LOWER($2)"
  name = name ? name : ""
  city = city ? city : ""

  const res = await pool.query(queryText, [`%${name}%`, `%${city}%`])

  return res.rows.map(row => parseStoreEntry(row))
}

// gets a single store
export const getStoreById = async (id: string | undefined): Promise<StoreEntry | null> => {
  const queryText = "SELECT * FROM stores WHERE id = $1"
  id = id ? id : ""
  const res = await pool.query(queryText, [parseInt(id)])

  if (res.rows.length === 0) {
    throw new NoContentError("")
  }

  return res.rows.map(row => parseStoreEntry(row))[0]
}

// gets and object for the store that tells if the items are being searched currently and if the object has items
export const getItemCheckById = async (id: string | undefined): Promise<ItemCheck> => {
  const queryText = "SELECT * FROM stores WHERE id = $1"
  id = id ? id : ""
  const res = await pool.query(queryText, [parseInt(id)])
  if (res.rows.length === 0) {
    throw new NoContentError("")
  }

  return res.rows.map(row => parseItemCheck(row))[0]
}