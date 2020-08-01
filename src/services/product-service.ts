import { pool } from "../utils/config"
import { ProductEntry } from "../types"
import { parseProductEntry } from "../utils/type-parsers"

// CHANGE FROM STORE TO PRODUCT

// gets all the stores
export const getProducts = async (name: string | undefined, city: string | undefined): Promise<ProductEntry[]> => {
  const queryText = "SELECT * FROM stores WHERE LOWER(name) LIKE LOWER($1) AND LOWER(city) LIKE LOWER($2)"
  console.log(name, city)
  name = name ? name : ""
  city = city ? city : ""

  const res = await pool.query(queryText, [`%${name}%`, `%${city}%`])

  return res.rows.map(row => parseProductEntry(row))

}

// gets a single store
export const getProductById = async (id: string | undefined): Promise<ProductEntry | null> => {
  const queryText = "SELECT * FROM products WHERE id = $1"
  id = id ? id : ""
  const res = await pool.query(queryText, [parseInt(id)])

  return res.rows.map(row => parseProductEntry(row))[0]
}