import express, {Request, Response, NextFunction} from "express"

// gets the token from the request and sets the token field
export const tokenExtractor = (req: Request, _res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization
  if (auth && auth.toLowerCase().startsWith("bearer")) {
    req.token = auth.substr(7)
  }

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
  else if (err.name === "TokenExpiredError") {
    res.status(401).send({ error: "Istuntosi on päättynyt. Kirjaudu sisään uudelleen." })
  }
  else {
    next(err)
  }
}

export const unknownEndpoint = (_req: express.Request, res: express.Response): void => {
  console.log("Resource does not exist")
  res.status(404).json({ error: "Unknown endpoint" })
}