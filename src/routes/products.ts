import { Request, Response, Router } from "express"
import expressAsyncHandler from "express-async-handler"
import { parseSLSearch } from "../utils/type-parsers"
import { getProductsForList } from "../services/product-service"

const productRouter = Router()

const parseArray = (obj: any): obj is string[] => !!obj && Array.isArray(obj)

productRouter.get("/search", expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const pSearches = req.query.productSearches
  const body = {
    storeID: req.query.storeID,
    productSearches: parseArray(pSearches) ? pSearches.map((ps: any) => JSON.parse(ps.toString())) : [],
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