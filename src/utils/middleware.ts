import express from "express"

export const errorHandler = (err: Error, _req: express.Request, _res: express.Response, next: express.NextFunction): void => {


  next(err)
}

export const unknownEndpoint = (_req: express.Request, res: express.Response): void => {
  res.status(404).json({ error: "Unknown endpoint" })
}