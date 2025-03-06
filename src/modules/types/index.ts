export interface Disposable {
  dispose(): void
}

export interface Canvas<T, E extends HTMLElement = HTMLElement> extends Disposable {
  dom: E
  resize(width: number, height: number): void
  react(data: T): void
}

export type Cancel = () => void
