import { ShoppingList } from "../types"


export const createShoppingList = async (_shoppingList: ShoppingList) => {
  const queryText = "INSERT INTO shopping_lists(user_id) VALUES ($1) RETURNING id"
  console.log(queryText)
}