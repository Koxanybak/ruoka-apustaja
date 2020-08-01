import { Request, Response, Router } from "express"
import { getStoreById } from "../services/store-service"
import expressAsyncHandler from "express-async-handler"

const recipeRouter = Router()

recipeRouter.get("/", expressAsyncHandler(async (req: Request, _res: Response): Promise<void> => {
  const storeId = req.query.storeId?.toString()
  const store = await getStoreById(storeId)
  if (store) {
    
  }
}))

export default recipeRouter