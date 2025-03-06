export function complain<T>(cause: string): Exclude<T, undefined> {
  throw new Error(cause)
}
