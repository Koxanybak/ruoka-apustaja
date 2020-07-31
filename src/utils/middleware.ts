import express from "express"

export const errorHandler = (err: Error, _req: express.Request, res: express.Response, next: express.NextFunction): void => {
  /* console.error(err.name, err.message) */
  if (err.name === "TypeError") {
    res.status(500).send({ error: err.message })
  } else {
    next(err)
  }
}

export const unknownEndpoint = (_req: express.Request, res: express.Response): void => {
  res.status(404).json({ error: "Unknown endpoint" })
}