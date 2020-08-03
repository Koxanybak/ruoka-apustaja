import { Response, Request, Router } from "express"
import expressAsyncHandler from "express-async-handler"
import { parseNewUserEntry } from "../utils/type-parsers"
import { createUser } from "../services/user-service"

const userRouter = Router()

userRouter.post("/", expressAsyncHandler(async (req: Request, res: Response) => {
  const newUser = parseNewUserEntry(req.body)
  await createUser(newUser)
  res.status(204).end()
}))

export default userRouter