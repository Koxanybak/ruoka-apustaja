import { pool } from "../utils/config"
import { SLSearch, ShoppingListResult, ShoppingList, } from "../types"
import { parseProductEntry, parseItemCheck } from "../utils/type-parsers"
import { scrape } from "../utils/scraper/product-scraper"

export const getProductsForList = async (sl: SLSearch): Promise<ShoppingListResult | string> => {
  // checks if the store has products in db, if not, scrape
  const queryText = "SELECT searching, has_products FROM stores WHERE id = $1"
  const res = await pool.query(queryText, [sl.storeID])
  const searching = (parseItemCheck(res.rows[0])).searching
  const has_products = (parseItemCheck(res.rows[0])).has_items
  if (searching) return "The server is searching for products for the store in question. This may take up to 30 min."
  if (!has_products) {
    // starts the scrape
    void scrape(sl.storeID)
      .then(() => {
        void pool.query("UPDATE stores SET searching = $1 WHERE id = $2", [false, sl.storeID])
      })
      .catch((err: Error) => {
        if (err.message !== "The search is already running.") {
          void pool.query("UPDATE stores SET searching = $1 WHERE id = $2", [false, sl.storeID])
        }
      })
    return "It appears that there is no products in the database for the store in question. The server started searching for products for the store in question. This may take up to 30 min."
  }

  // formats the search object for the db query
  sl.productSearches = sl.productSearches.map(ps => {
    return {
      ...ps,
      desc: ps.desc.map(d => `%${d.toLowerCase()}%`)
    }
  })

  // makes the queries and adds the resulting list to the shopping list object
  const shoppingList: ShoppingListResult = {}
  for (let i = 0; i < sl.productSearches.length; i++) {
    const queryText = "SELECT id, name, price, price_per_unit, unit, imgSrc, store_id, link FROM products WHERE store_id = $1 AND LOWER(name) LIKE ALL($2)"
    const res = await pool.query(queryText, [sl.storeID, sl.productSearches[i].desc])
    console.log(res.rows)
    const wildcardsRemoved = sl.productSearches[i].desc.map(word => word.substr(1, word.length-2)).join(" ")
    /* const shoppinglistDesc = fullSearchStr.substr(1, fullSearchStr.length-2) */
    shoppingList[wildcardsRemoved] = res.rows.map(row => parseProductEntry(row))
  }

  return shoppingList
}

export const createShoppingList = async (_shoppingList: ShoppingList) => {
  const queryText = "INSERT INTO shopping_lists(user_id) VALUES ($1) RETURNING id"
  console.log(queryText)
}