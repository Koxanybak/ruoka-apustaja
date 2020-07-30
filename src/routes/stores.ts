import express from "express"
import { getStores, getStoreById } from "../services/store-service"

const storeRouter = express.Router()

storeRouter.get("/", async (req: express.Request, res: express.Response): Promise<void> => {
  const name = req.params.name
  const city = req.params.city
  const stores = await getStores()
  res.status(200).json(stores)
})

storeRouter.get("/:id", async (req: express.Request, res: express.Response): Promise<void> => {
  const id = req.params.id
  const store = await getStoreById(id)
  if (store) {
    res.status(200).json(store)
  } else {
    res.status(404).end()
  }
})

export default storeRouter