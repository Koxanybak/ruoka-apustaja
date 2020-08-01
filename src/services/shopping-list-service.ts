import { pool } from "../utils/config"
import format from "pg-format"
import { SLSearch, ShoppingList } from "../types"
import { parseProductEntry } from "../utils/type-parsers"

export const getProductsForList = async (sl: SLSearch): Promise<ShoppingList> => {
  // formats the search object for the db query
  sl.productSearches = sl.productSearches.map(ps => {
    return {
      ...ps,
      desc: ps.desc.map(d => `%${d.toLowerCase()}%`)
    }
  })

  // makes the queries and adds the resulting list to the shopping list object
  const shoppingList: ShoppingList = {}
  shoppingList["storeID"] = sl.storeID
  for (let i = 0; i < sl.productSearches.length; i++) {
    const queryText = format("SELECT (id, name, price, price_per_unit, unit, imgSrc, storeID, link) FROM products WHERE name LIKE ALL (%L)", sl.productSearches[i].desc)
    const res = await pool.query(queryText)
    shoppingList[sl.productSearches[i].desc.join(" ")] = res.rows.map(row => parseProductEntry(row))
  }

  return shoppingList
}