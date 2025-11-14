
export class Queue<T> {

  private _items: T[] = [];

  public add(item: T): void {
    this._items.unshift(item);
  }

  public poll(): T {
    return this._items.pop();
  }

  public peek(): T {
    return this._items[this._items.length - 1];
  }

  public isEmpty(): boolean {
    return !!this._items.length;
  }

}
