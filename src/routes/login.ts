import { Router, Request, Response } from "express"
import expressAsyncHandler from "express-async-handler"
import { parseLoginBody } from "../utils/type-parsers"

const loginRouter = Router()

loginRouter.post("/", expressAsyncHandler(async (req: Request, res: Response) => {
  const loginBody = parseLoginBody(req.body)
}))