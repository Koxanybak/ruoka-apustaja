import express from "express"
/* import http from "http" */
import http = require("http")
import storeRouter from "./routes/stores"
import shoppingListRouter from "./routes/shopping-lists"
import { errorHandler, unknownEndpoint } from "./utils/middleware"
import userRouter from "./routes/users"
import loginRouter from "./routes/login"
/* require("express-async-errors") */

const PORT = 3000

const app = express()

app.use(express.json())
app.use("/api/stores", storeRouter)
app.use("/api/shoppinglists", shoppingListRouter)
app.use("/api/users", userRouter)
app.use("/api/login", loginRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

http.createServer(app).listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`)
})