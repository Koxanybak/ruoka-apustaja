import express from "express"
import expressAsyncHandler from "express-async-handler"
import { createEmptyShoppingList } from "../services/shopping-list-service"
import { parseString, parseNumber } from "../utils/type-parsers"
import { getUserFromToken } from "../services/user-service"

const shoppingListRouter = express.Router()

shoppingListRouter.post("/", expressAsyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
  const name = parseString(req.body.name, "name")
  const store_id = parseNumber(req.body.store_id, "store_id")
  const loggedUser = await getUserFromToken(req.token)
  const newShoppingList = await createEmptyShoppingList(loggedUser.id, store_id, name)
  res.status(201).json(newShoppingList)
}))

export default shoppingListRouter