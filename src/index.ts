console.log("tässä")
import express from "express"
/* import http from "http" */
import http = require("http")
console.log("tässä")
import storeRouter from "./routes/stores"
import shoppingListRouter from "./routes/shopping-lists"
console.log("tässä")
import { errorHandler, unknownEndpoint, tokenExtractor } from "./utils/middleware"
console.log("tässä")
import userRouter from "./routes/users"
console.log("tässä")
import loginRouter from "./routes/login"
/* require("express-async-errors") */
console.log("tässä")

const PORT = 3000

console.log("tässä")

const app = express()

console.log("tässä")

app.use(express.json())
app.use(tokenExtractor)
app.use("/api/stores", storeRouter)
app.use("/api/shoppinglists", shoppingListRouter)
app.use("/api/users", userRouter)
app.use("/api/login", loginRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

http.createServer(app).listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`)
})