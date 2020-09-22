import { pool } from "../utils/config"
import { ShoppingList, ProductEntry } from "../types"
import { getProductById } from "./product-service"
import { BadRequestError, DatabaseError } from "../utils/errors"


// creates an empty shoppinglist and returns its id
export const createEmptyShoppingList = async (user_id: number | string, store_id: number | string, name: string): Promise<Omit<ShoppingList, "productList">> => {
  user_id = parseInt(user_id.toString())
  store_id = parseInt(store_id.toString())
  const queryText = "INSERT INTO shopping_lists(user_id, store_id, name) VALUES ($1, $2, $3) RETURNING id, store_id, name"
  const { rows } = await pool.query(queryText, [user_id, store_id, name])
  return rows[0]
}

// deletes the shopping list
export const deleteShoppingList = async (shopping_list_id: number | string) => {
  shopping_list_id = parseInt(shopping_list_id.toString())
  const queryText = "DELETE FROM shopping_lists WHERE id = $1"
  await pool.query(queryText, [shopping_list_id])
}

// adds an items to the shopping list
export const addItemToShoppingList = async (shopping_list_id: string | number, product_id: string | number): Promise<ProductEntry> => {
  shopping_list_id = parseInt(shopping_list_id.toString())
  product_id = parseInt(product_id.toString())
  const shopping_list = await getShoppingListById(shopping_list_id)
  const product = await getProductById(product_id.toString())

  if (!product) throw new BadRequestError("The product does not exist")
  if (shopping_list?.store_id !== product.storeID) throw new BadRequestError("The product must be from the store of the shopping list")

  try {
    const queryText = `INSERT INTO shopping_list_items(shopping_list_id, product_id) VALUES ($1, $2) RETURNING product_id`
    await pool.query(queryText, [shopping_list_id, product_id])
  } catch (e) {
    throw new DatabaseError("Kyseinen tuote on jo lisätty ostoslistalle.")
  }
  
  return product
}

// deletes an items from the shopping list
export const deleteItemFromShoppingList = async (shopping_list_id: string | number, product_id: string | number) => {
  shopping_list_id = parseInt(shopping_list_id.toString())
  product_id = parseInt(product_id.toString())
  const queryText = "DELETE FROM shopping_list_items WHERE shopping_list_id = $1 AND product_id = $2"
  await pool.query(queryText, [shopping_list_id, product_id])
}

// gets all the shopping list ids and names of the user
export const getShoppingLists = async (user_id: number | string): Promise<Omit<ShoppingList, "productList">[]> => {
  user_id = parseInt(user_id.toString())
  const queryText = "SELECT id, name, store_id FROM shopping_lists WHERE user_id = $1"
  const { rows } = await pool.query(queryText, [user_id])
  return rows
}

// gets contents of the shopping list
export const getShoppingListItems = async (id: number | string): Promise<Omit<ProductEntry, "storeID">[]> => {
  id = parseInt(id.toString())
  const queryText = "SELECT p.id, p.name, p.price, p.price_per_unit, p.unit, p.imgsrc, p.link FROM shopping_list_items s, products p, shopping_lists sl WHERE s.product_id = p.id AND sl.id = $1 AND sl.id = s.shopping_list_id"
  const { rows } = await pool.query(queryText, [id])
  return rows
}

// gets a shoppinglist by id without items
export const getShoppingListById = async (id: number | string): Promise<Omit<ShoppingList, "productList"> | null> => {
  id = parseInt(id.toString())
  const queryText = "SELECT id, name, store_id, user_id FROM shopping_lists WHERE id = $1"
  const { rows } = await pool.query(queryText, [id])
  return rows[0]
}