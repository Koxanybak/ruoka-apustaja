import express from "express"
import expressAsyncHandler from "express-async-handler"
import { parseShoppingList } from "../utils/type-parsers"
import { createShoppingList } from "../services/shopping-list-service"

const shoppingListRouter = express.Router()

shoppingListRouter.post("/", expressAsyncHandler(async (req: express.Request, _res: express.Response): Promise<void> => {
  const shoppingList = parseShoppingList(req.body)
  const newShoppingList = await createShoppingList(shoppingList)
  console.log(newShoppingList)
}))

export default shoppingListRouter