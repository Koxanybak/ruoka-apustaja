import express, {Request, Response, NextFunction} from "express"
import { cookie_name } from "./config"

// gets the token from the request and sets the token field
export const tokenExtractor = (req: Request, _res: Response, next: NextFunction): void => {
  const cookies = req.headers.cookie
  const token = cookies?.substr(cookie_name.length + 1)
  console.log("Got the token:", token)
  req.token = token

  next()
}

export const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error(err.name, err.message)
  if (err.name === "TypeError") {
    res.status(400).send({ error: err.message })
  }
  else if (err.name === "ValidationError") {
    res.status(400).send({ error: err.message })
  }
  else if (err.name === "NoContentError") {
    console.trace()
    unknownEndpoint(req, res)
  }
  else if (err.name === "InvalidTokenError") {
    res.status(401).send({ error: err.message })
  }
  else if (err.name === "JsonWebTokenError") {
    res.status(401).send({ error: "Invalid token" })
  }
  else if (err.name === "BadRequestError") {
    res.status(400).send({ error: err.message })
  }
  else if (err.name === "ForbiddenError") {
    res.status(403).send({ error: err.message })
  }
  else if (err.name === "ProductScrapeError") {
    res.status(501).send({ error: err.message })
  }
  else {
    next(err)
  }
}

export const unknownEndpoint = (_req: express.Request, res: express.Response): void => {
  console.log("Resource does not exist")
  res.status(404).json({ error: "Unknown endpoint" })
}