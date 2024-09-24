interface QueueItem<T> {
  fn: (...args: any[]) => Promise<T>;
  args: Parameters<QueueItem<T>['fn']>;
  priority: number;
  id: string;
  resolve: (value: T | PromiseLike<T>) => void;
  reject?: (reason?: any) => void; // Add reject method
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
    return new Promise((resolve, reject) => {
      const item: QueueItem<T> = { fn, args, priority, id, resolve, reject };
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
      item
        .fn(...item.args)
        .then((result) => {
          item.resolve(result);
          this.processingQueue = this.processingQueue.filter((i) => i !== item);
          this.processNextItem();
        })
        .catch((error) => {
          if (item.reject) {
            item.reject(error); // Propagate the error to the promise
          }
          this.processingQueue = this.processingQueue.filter((i) => i !== item);
          this.processNextItem();
        });
    }
  }

  cancel(id: string): void {
    // Cancel task from the queue
    const queuedItem = this.queue.find((item) => item.id === id);
    if (queuedItem) {
      this.queue = this.queue.filter((item) => item.id !== id);
      queuedItem.reject?.(new Error(`Task ${id} was cancelled`));
    }

    // Cancel task from the processing queue
    const processingItem = this.processingQueue.find((item) => item.id === id);
    if (processingItem) {
      this.processingQueue = this.processingQueue.filter(
        (item) => item.id !== id
      );

      // If the task is already running, we need to abort it.
      // However, since we can't directly abort a promise in JavaScript,
      // we'll just reject it and let the caller handle it.
      processingItem.reject?.(new Error(`Task ${id} was cancelled`));

      // Re-process next item if necessary
      this.processNextItem();
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
