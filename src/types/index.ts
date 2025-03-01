type Cancel = () => void


export interface EventSource<T> {
  observe: (f: (value: T) => void) => Cancel
}