interface QueueItem<T> {
  fn: (...args: any[]) => Promise<T>;
  args: Parameters<QueueItem<T>['fn']>;
  priority: number;
  id: string;
  resolve: (value: T | PromiseLike<T>) => void;
}

export class PriorityQueue<T> {
  private queue: QueueItem<T>[] = [];
  private processingQueue: QueueItem<T>[] = [];
  private desiredSize: number;

  constructor(desiredSize: number) {
    this.desiredSize = desiredSize;
  }

  enqueue(
    fn: (...args: any[]) => Promise<T>,
    args: Parameters<typeof fn>,
    priority = 0,
    id: string
  ): Promise<T> {
    return new Promise((resolve) => {
      const item: QueueItem<T> = { fn, args, priority, id, resolve };
      this.queue.push(item);
      this.queue.sort((a, b) => b.priority - a.priority);
      this.processNextItem();
    });
  }

  private processNextItem() {
    if (
      this.processingQueue.length < this.desiredSize &&
      this.queue.length > 0
    ) {
      const item = this.queue.shift()!;
      this.processingQueue.push(item);
      item.fn(...item.args).then((result) => {
        item.resolve(result);
        this.processingQueue = this.processingQueue.filter((i) => i !== item);
        this.processNextItem();
      });
    }
  }

  isEmpty(): boolean {
    return this.queue.length === 0 && this.processingQueue.length === 0;
  }

  setDesiredSize(size: number) {
    this.desiredSize = size;
    this.processNextItem();
  }
}
