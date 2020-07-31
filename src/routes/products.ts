import express from "express"
import { getStoreById } from "../services/store-service"
import expressAsyncHandler from "express-async-handler"

const productRouter = express.Router()

productRouter.get("/", expressAsyncHandler(async (req: express.Request, _res: express.Response): Promise<void> => {
  const storeId = req.query.storeId?.toString()
  const store = await getStoreById(storeId)
  if (store) {
    
  }
}))

export default productRouter