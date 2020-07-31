import express from "express"
import { getStores, getStoreById } from "../services/store-service"
import expressAsyncHandler from "express-async-handler"

const storeRouter = express.Router()

storeRouter.get("/", expressAsyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
  const name = req.query.name?.toString()
  const city = req.query.city?.toString()
  const stores = await getStores(name, city)
  res.status(200).json(stores)
}))

storeRouter.get("/:id", expressAsyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
  const id = req.params.id
  const store = await getStoreById(id)
  if (store) {
    res.status(200).json(store)
  } else {
    res.status(404).end()
  }
}))

export default storeRouter