import express from "express"
import expressAsyncHandler from "express-async-handler"
import { parseSLSearch, parseShoppingList } from "../utils/type-parsers"
import { getProductsForList, createShoppingList } from "../services/shopping-list-service"

const shoppingListRouter = express.Router()

shoppingListRouter.get("/", expressAsyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
  const slSearchObj = parseSLSearch(req.body)
  const shoppingListOrMessage = await getProductsForList(slSearchObj)
  if (typeof shoppingListOrMessage === "string") {
    res.status(202).send({ message: shoppingListOrMessage })
  } else {
    res.status(200).json(shoppingListOrMessage)
  }
}))

shoppingListRouter.post("/", expressAsyncHandler(async (req: express.Request, _res: express.Response): Promise<void> => {
  const shoppingList = parseShoppingList(req.body)
  const newShoppingList = await createShoppingList(shoppingList)
  console.log(newShoppingList)
}))

export default shoppingListRouter