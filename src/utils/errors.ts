export class ProductScrapeError extends Error {
  constructor(m: string) {
    super(m)
    this.name = "ProductScrapeError"
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

export class BadRequestError extends Error {
  constructor(m: string) {
    super(m)
    this.name = "BadRequestError"
  }
}

export class ForbiddenError extends Error {
  constructor(m: string) {
    super(m)
    this.name = "ForbiddenError"
  }
}