import express from "express"
import expressAsyncHandler from "express-async-handler"
import { parseSLSearch } from "../utils/type-parsers"
import { getProductsForList } from "../services/shopping-list-service"

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

export default shoppingListRouter