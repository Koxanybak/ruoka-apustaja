export class ProductScrapeError extends Error {
  constructor(m: string) {
    super(m)
  }
}

export class NoContentError extends Error {
  constructor(m: string) {
    super(m)
    this.name = "NoContentError"
  }
}

export class InvalidTokenError extends Error {
  constructor(m: string) {
    super(m)
    this.name = "InvalidTokenError"
  }
}