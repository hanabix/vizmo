export interface Disposable {
  dispose(): void
}

export interface Canvas<T> extends Disposable {
  dom: HTMLElement
  resize(width: number, height: number): void
  react(data: T): void
}

export type Cancel = () => void
