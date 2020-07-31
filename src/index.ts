import express from "express"
/* import http from "http" */
import http = require("http")
import storeRouter from "./routes/stores"
import productRouter from "./routes/products"
import { errorHandler, unknownEndpoint } from "./utils/middleware"
/* require("express-async-errors") */

const PORT = 3000

const app = express()

app.use(express.json())
app.get("/", (_req: express.Request, res: express.Response): void => {
  res.status(200).send("Hello")
})
app.use("/api/stores", storeRouter)
app.use("/api/products", productRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

http.createServer(app).listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`)
})