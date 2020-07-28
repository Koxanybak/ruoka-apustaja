/* eslint-disable @typescript-eslint/no-explicit-any */


const info = (...args: any[]): void => {
  console.log(args)
}

const error = (...args: any[]): void => {
  console.error(args)
}

export default { info, error }