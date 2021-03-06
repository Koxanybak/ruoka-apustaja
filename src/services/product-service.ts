import { pool, redis_client } from "../utils/config"
import { ProductEntry } from "../types"
import { SLSearch, ShoppingListResult, } from "../types"
import { parseProductEntry, } from "../utils/type-parsers"
import { scrape } from "../utils/scraper/product-scraper"
import { getItemCheckById } from "./store-service"
import { ProductScrapeError } from "../utils/errors"
import { promisify } from "util";

// gets all the stores
export const getProducts = async (name: string | undefined, city: string | undefined): Promise<ProductEntry[]> => {
  const queryText = "SELECT * FROM stores WHERE LOWER(name) LIKE LOWER($1) AND LOWER(city) LIKE LOWER($2)"
  console.log(name, city)
  name = name ? name : ""
  city = city ? city : ""

  const res = await pool.query(queryText, [`%${name}%`, `%${city}%`])

  return res.rows.map(row => parseProductEntry(row))

}

// gets the products for the search object and formats them
// so that the field of the resulting object is the searchstring and the value is the productlist for the search
export const getProductsForList = async (sl: SLSearch): Promise<ShoppingListResult> => {
  // checks if the store has products in db, if not, scrape
  const storeID = parseInt(sl.storeID)
  const { has_products } = await getItemCheckById(sl.storeID)

  // redis
  const get_async = promisify(redis_client.get).bind(redis_client)
  const set_async = promisify(redis_client.set).bind(redis_client)
  const searching = await get_async(`searching:${storeID}`)
  console.log({searching})

  if (searching === "true") throw new ProductScrapeError(
    `Näyttäisi siltä, että kyseisen kaupan tuotteita ei ole vielä tietokannassa.
    Palvelin aloitti tuotteiden etsinnän. Siinä voi kestää 15-80 minuttia riippuen kaupan koosta.`
  )

  if (!has_products) {
    // starts the scrape and update searching object
    void set_async(`searching:${storeID}`, "true")
    void scrape(storeID)
      .finally(() => {
        void set_async(`searching:${storeID}`, "false")
      })
    throw new ProductScrapeError(
      `Näyttäisi siltä, että kyseisen kaupan tuotteita ei ole vielä tietokannassa.
      Palvelin aloitti tuotteiden etsinnän. Siinä voi kestää 15-80 minuttia riippuen kaupan koosta.`
    )
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
    const res = await pool.query(queryText, [storeID, sl.productSearches[i].desc])
    const wildcardsRemoved = sl.productSearches[i].desc.map(word => word.substr(1, word.length-2)).join(" ")
    /* const shoppinglistDesc = fullSearchStr.substr(1, fullSearchStr.length-2) */
    shoppingList[wildcardsRemoved] = res.rows.map(row => parseProductEntry(row))
  }

  return shoppingList
}

// gets a single product
export const getProductById = async (id: string | undefined): Promise<ProductEntry | null> => {
  const queryText = "SELECT * FROM products WHERE id = $1"
  id = id ? id : ""
  const res = await pool.query(queryText, [parseInt(id)])

  return res.rows.map(row => parseProductEntry(row))[0]
}