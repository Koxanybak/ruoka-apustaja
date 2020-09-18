import { Router, Request, Response } from "express"
import expressAsyncHandler from "express-async-handler"
import { parseLoginBody } from "../utils/type-parsers"
import { getUserByName, getUserFromToken } from "../services/user-service"
import { compare } from "bcrypt"
import jwt from "jsonwebtoken"
import { REFRESH_COOKIE_NAME, DEFAULT_TOKEN_EXP_SEC, SECRET } from "../utils/config"
import { AES, enc } from "crypto-js";

const loginRouter = Router()

loginRouter.get("/", expressAsyncHandler(async (req: Request, res: Response) => {
  const refresh_token = req.cookies[REFRESH_COOKIE_NAME]
  if (!refresh_token) res.status(401).send({ error: "Refresh token missing." })
  const access_token = AES.decrypt(refresh_token, SECRET).toString(enc.Utf8)
  const logged_user = await getUserFromToken(access_token)
  res.status(200).json({
    id: logged_user.id,
    username: logged_user.username,
    access_token,
  })
}))

loginRouter.post("/", expressAsyncHandler(async (req: Request, res: Response) => {
  const loginBody = parseLoginBody(req.body)
  const userInDb = await getUserByName(loginBody.username)
  const match = await compare(loginBody.password, userInDb?.pwHash ? userInDb?.pwHash : "")
  if (!userInDb || !match) {
    res.status(401).send({ error: "Wrong username or password" })
  } else {
    const userForToken = {
      id: userInDb.id,
      username: userInDb.username,
    }
    const access_token = jwt.sign(userForToken, SECRET, { expiresIn: DEFAULT_TOKEN_EXP_SEC })

    const refresh_token = AES.encrypt(access_token, SECRET).toString()

    res.cookie(REFRESH_COOKIE_NAME, refresh_token, { sameSite: true, maxAge: DEFAULT_TOKEN_EXP_SEC*1000 })
    res.status(200).json({ ...userForToken, access_token, })
  }
}))

export default loginRouter