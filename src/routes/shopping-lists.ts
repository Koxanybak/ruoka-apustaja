import { Request, Response, Router } from "express"
import expressAsyncHandler from "express-async-handler"
import { createEmptyShoppingList, getShoppingListById, deleteShoppingList, getShoppingLists, getShoppingListItems, addItemToShoppingList, deleteItemFromShoppingList } from "../services/shopping-list-service"
import { parseStringUndef, parseNumber, parseString } from "../utils/type-parsers"
import { getUserFromToken } from "../services/user-service"
import { TokenUser } from "../types"
import { ForbiddenError } from "../utils/errors"

const shoppingListRouter = Router()

// Checks if the user from the url mathces the user from the token
const checkUserFromTokenAndUrl = (loggedUser: TokenUser, url: string): void => {
  let url_user_id = ""
  let slashes_found = 0
  for (let i = url.length - 1; i >= 0 && slashes_found < 2; i--) {
    const c = url.charAt(i)
    if (slashes_found === 1 && c !== "/") url_user_id += c
    if (c === "/") slashes_found++
  }
  url_user_id = url_user_id.split("").reverse().join()
  if (loggedUser.id.toString() !== url_user_id) throw new ForbiddenError("User from token doesn't match the url")
}

// Gets the shopping_list_id from the request or throws an error
const validate_and_get_list_id_and_logged_user = async (req: Request): Promise<{ loggedUser: TokenUser; shopping_list_id: string }> => {
  const shopping_list_id = req.params.shopping_list_id
  const loggedUser = await getUserFromToken(req.token)
  
  const url = req.baseUrl
  checkUserFromTokenAndUrl(loggedUser, url)

  return { loggedUser, shopping_list_id }
}

shoppingListRouter.post("/", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  let name = parseStringUndef(req.body.name, "name")
  name = name ? name : "Nimetön ostoslista"
  const store_id = parseNumber(req.body.store_id, "store_id")
  const loggedUser = await getUserFromToken(req.token)

  const url = req.baseUrl
  checkUserFromTokenAndUrl(loggedUser, url)

  const newShoppingList = await createEmptyShoppingList(loggedUser.id, store_id, name)
  res.status(201).json(newShoppingList)
}))

shoppingListRouter.delete("/:id", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { loggedUser, shopping_list_id } = await validate_and_get_list_id_and_logged_user(req)

  const shoppingListInDb = await getShoppingListById(shopping_list_id)
  if (!shoppingListInDb) res.status(204).end()
  else if (loggedUser.id === shoppingListInDb.user_id) {
    await deleteShoppingList(shopping_list_id)
    res.status(204).end()
  }
  else res.status(403).send({ error: "Access denied" })
}))

shoppingListRouter.get("/", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { loggedUser } = await validate_and_get_list_id_and_logged_user(req)

  const shoppingLists = await getShoppingLists(loggedUser.id)
  res.status(200).json(shoppingLists)
}))

shoppingListRouter.get("/:shopping_list_id/items", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { loggedUser, shopping_list_id } = await validate_and_get_list_id_and_logged_user(req)

  const shoppingListInDb = await getShoppingListById(shopping_list_id)
  if (!shoppingListInDb) res.status(404).end()
  else if (loggedUser.id === shoppingListInDb.user_id) {
    const shoppingListItems = await getShoppingListItems(shopping_list_id)
    res.status(200).json(shoppingListItems)
  }
  else res.status(403).send({ error: "Access denied" })
}))

shoppingListRouter.post("/:shopping_list_id/items", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { loggedUser, shopping_list_id } = await validate_and_get_list_id_and_logged_user(req)

  const shoppingListInDb = await getShoppingListById(shopping_list_id)
  if (!shoppingListInDb) res.status(404).end()
  else if (loggedUser.id === shoppingListInDb.user_id) {
    const product_id = parseNumber(req.body.id, "id")
    const addedProduct = await addItemToShoppingList(shopping_list_id, product_id)
    res.status(201).json(addedProduct)
  }
  else res.status(403).send({ error: "Access denied" })
}))

shoppingListRouter.delete("/:shopping_list_id/items/:id", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { loggedUser, shopping_list_id } = await validate_and_get_list_id_and_logged_user(req)

  const shoppingListInDb = await getShoppingListById(shopping_list_id)
  if (!shoppingListInDb) res.status(404).end()
  else if (loggedUser.id === shoppingListInDb.user_id) {
    const product_id = parseString(req.params.id, "id")
    await deleteItemFromShoppingList(shopping_list_id, product_id)
    res.status(204).end()
  }
  else res.status(403).send({ error: "Access denied" })
}))


export default shoppingListRouter