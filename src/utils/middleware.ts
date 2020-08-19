import express, {Request, Response, NextFunction} from "express"

// gets the token from the request and sets the token field
export const tokenExtractor = (req: Request, res: Response, next: NextFunction): void => {
  const auth = req.get("authorization")
  if (auth && auth.toLowerCase().startsWith("bearer")) {
    req.token = auth.substr(7)
  } else req.token = undefined
  next()
}

export const errorHandler = (err: Error, _req: express.Request, res: express.Response, next: express.NextFunction): void => {
  /* console.error(err.name, err.message) */
  if (err.name === "TypeError") {
    res.status(400).send({ error: err.message })
  } else if (err.name === "ValidationError") {
    res.status(400).send({ error: err.message })
  } else {
    next(err)
  }
}

export const unknownEndpoint = (_req: express.Request, res: express.Response): void => {
  res.status(404).json({ error: "Unknown endpoint" })
}