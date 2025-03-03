export function complain<T>(cause: string): Exclude<T, undefined> {
  throw new Error(cause)
}

export function get<T>(optional: T | undefined): T {
  return optional ?? complain('get undefined')
}