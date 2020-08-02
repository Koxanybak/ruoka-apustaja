import { pool } from "../utils/config"
import { SLSearch, ShoppingList, } from "../types"
import { parseProductEntry, parseProductCheck } from "../utils/type-parsers"
import { scrape } from "../utils/scraper/product-scraper"

export const getProductsForList = async (sl: SLSearch): Promise<ShoppingList | string> => {
  // checks if the store has products in db, if not, scrape
  const queryText = "SELECT searching, has_products FROM stores WHERE id = $1"
  const res = await pool.query(queryText, [sl.storeID])
  const searching = (parseProductCheck(res.rows[0])).searching
  const has_products = (parseProductCheck(res.rows[0])).has_products
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
  const shoppingList: ShoppingList = {}
  shoppingList["storeID"] = sl.storeID
  for (let i = 0; i < sl.productSearches.length; i++) {
    console.log(sl.productSearches[i].desc)
    const queryText = "SELECT id, name, price, price_per_unit, unit, imgSrc, store_id, link FROM products WHERE name LIKE ALL($1)"
    console.log(queryText)
    const res = await pool.query(queryText, [sl.productSearches[i].desc])
    console.log(res.rows)
    shoppingList[sl.productSearches[i].desc.join(" ")] = res.rows.map(row => parseProductEntry(row))
  }

  return shoppingList
}