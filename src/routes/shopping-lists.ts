import { Request, Response, Router } from "express"
import expressAsyncHandler from "express-async-handler"
import { createEmptyShoppingList, getShoppingListById, deleteShoppingList, getShoppingLists, getShoppingListItems, addItemToShoppingList, deleteItemFromShoppingList } from "../services/shopping-list-service"
import { parseString, parseNumber } from "../utils/type-parsers"
import { getUserFromToken } from "../services/user-service"
import { TokenUser } from "../types"
import { ForbiddenError } from "../utils/errors"

const shoppingListRouter = Router()

const checkUserFromTokenAndUrl = (loggedUser: TokenUser, url_user_id: string): void => {
  if (loggedUser.id.toString() !== url_user_id) throw new ForbiddenError("User from token doesn't match the url")
}

shoppingListRouter.post("/", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const name = parseString(req.body.name, "name")
  const store_id = parseNumber(req.body.store_id, "store_id")
  const loggedUser = await getUserFromToken(req.token)

  const url_user_id = req.params.user_id
  console.log("url_user_id:", url_user_id)
  checkUserFromTokenAndUrl(loggedUser, url_user_id)

  const newShoppingList = await createEmptyShoppingList(loggedUser.id, store_id, name)
  res.status(201).json(newShoppingList)
}))

shoppingListRouter.delete("/:id", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const shopping_list_id = req.params.id
  const loggedUser = await getUserFromToken(req.token)
  const url_user_id = req.params.user_id
  console.log("url_user_id:", url_user_id)
  checkUserFromTokenAndUrl(loggedUser, url_user_id)

  const shoppingListInDb = await getShoppingListById(shopping_list_id)
  if (!shoppingListInDb) res.status(204).end()
  else if (loggedUser.id === shoppingListInDb.user_id) {
    await deleteShoppingList(shopping_list_id)
    res.status(204).end()
  }
  else res.status(403).send({ error: "Access denied" })
}))

shoppingListRouter.get("/", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const loggedUser = await getUserFromToken(req.token)
  const url_user_id = req.params.user_id
  checkUserFromTokenAndUrl(loggedUser, url_user_id)

  const shoppingLists = await getShoppingLists(loggedUser.id)
  res.status(200).json(shoppingLists)
}))

shoppingListRouter.get("/:shopping_list_id/items", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const shopping_list_id = req.params.shopping_list_id
  const loggedUser = await getUserFromToken(req.token)
  const url_user_id = req.params.user_id
  checkUserFromTokenAndUrl(loggedUser, url_user_id)

  const shoppingListInDb = await getShoppingListById(shopping_list_id)
  if (!shoppingListInDb) res.status(404).end()
  else if (loggedUser.id === shoppingListInDb.user_id) {
    const shoppingListItems = await getShoppingListItems(shopping_list_id)
    res.status(200).json(shoppingListItems)
  }
  else res.status(403).send({ error: "Access denied" })
}))

shoppingListRouter.post("/:shopping_list_id/items", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const shopping_list_id = req.params.shopping_list_id
  const loggedUser = await getUserFromToken(req.token)
  const url_user_id = req.params.user_id
  checkUserFromTokenAndUrl(loggedUser, url_user_id)

  const shoppingListInDb = await getShoppingListById(shopping_list_id)
  if (!shoppingListInDb) res.status(404).end()
  else if (loggedUser.id === shoppingListInDb.user_id) {
    const product_id = parseString(req.body.id, "id")
    const addedProduct = await addItemToShoppingList(shopping_list_id, product_id)
    res.status(201).json(addedProduct)
  }
  else res.status(403).send({ error: "Access denied" })
}))

shoppingListRouter.delete("/:shopping_list_id/items/:id", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const shopping_list_id = req.params.shopping_list_id
  const loggedUser = await getUserFromToken(req.token)
  const url_user_id = req.params.user_id
  checkUserFromTokenAndUrl(loggedUser, url_user_id)

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