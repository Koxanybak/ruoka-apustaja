import { Request, Response, Router } from "express"
import expressAsyncHandler from "express-async-handler"
import { parseSLSearch } from "../utils/type-parsers"
import { getProductsForList } from "../services/shopping-list-service"

const productRouter = Router()

productRouter.get("/search", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = {
    storeID: req.query.storeID,
    productSearches: req.query.productSearches,
  }
  const slSearchObj = parseSLSearch(body)
  const shoppingListOrMessage = await getProductsForList(slSearchObj)
  if (typeof shoppingListOrMessage === "string") {
    res.status(202).send({ message: shoppingListOrMessage })
  } else {
    res.status(200).json(shoppingListOrMessage)
  }
}))

export default productRouter