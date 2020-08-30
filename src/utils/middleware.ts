import express, {Request, Response, NextFunction} from "express"

// gets the token from the request and sets the token field
export const tokenExtractor = (req: Request, _res: Response, next: NextFunction): void => {
  const auth = req.get("authorization")
  if (auth && auth.toLowerCase().startsWith("bearer")) {
    req.token = auth.substr(7)
  } else req.token = undefined
  next()
}

export const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  /* console.error(err.name, err.message) */
  if (err.name === "TypeError") {
    res.status(400).send({ error: err.message })
  } else if (err.name === "ValidationError") {
    res.status(400).send({ error: err.message })
  } else if (err.name === "NoContentError") {
    unknownEndpoint(req, res)
  } else {
    next(err)
  }
}

export const unknownEndpoint = (_req: express.Request, res: express.Response): void => {
  console.log("Resource does not exist")
  res.status(404).json({ error: "Unknown endpoint" })
}