import { Response, Request, Router } from "express"
import expressAsyncHandler from "express-async-handler"
import { parseNewUserEntry } from "../utils/type-parsers"
import { createUser } from "../services/user-service"
import shoppingListRouter from "./shopping-lists"

const userRouter = Router()

userRouter.use("/shoppinglists", shoppingListRouter)

userRouter.post("/", expressAsyncHandler(async (req: Request, res: Response) => {
  const newUser = parseNewUserEntry(req.body)
  await createUser(newUser)
  res.status(204).end()
}))

export default userRouter