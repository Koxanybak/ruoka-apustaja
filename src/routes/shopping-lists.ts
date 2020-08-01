import express from "express"
import expressAsyncHandler from "express-async-handler"
import { parseSLSearch } from "../utils/type-parsers"

const shoppingListRouter = express.Router()

shoppingListRouter.get("/", expressAsyncHandler(async (req: express.Request, _res: express.Response): Promise<void> => {
  const slSearchObj = parseSLSearch(req.body)
}))

export default shoppingListRouter