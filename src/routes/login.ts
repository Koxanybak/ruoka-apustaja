import { Router, Request, Response } from "express"
import expressAsyncHandler from "express-async-handler"
import { parseLoginBody } from "../utils/type-parsers"
import { getUserByName } from "../services/user-service"
import { compare } from "bcrypt"
import jwt from "jsonwebtoken"
import { SECRET } from "../utils/config"

const loginRouter = Router()

loginRouter.post("/", expressAsyncHandler(async (req: Request, res: Response) => {
  const loginBody = parseLoginBody(req.body)
  const userInDb = await getUserByName(loginBody.username)
  const match = await compare(loginBody.password, userInDb?.pwHash ? userInDb?.pwHash : "")
  if (!userInDb || !match) {
    res.status(401).send({ error: "Wrong username or password" })
  } else {
    const userForToken = {
      id: userInDb.id,
      username: userInDb.username
    }
    const token = jwt.sign(userForToken, SECRET, { expiresIn: 30*60 })
    res.cookie("token", token, { httpOnly: true, sameSite: true })
    res.status(200).json({ ...userForToken, token })
  }
}))

export default loginRouter