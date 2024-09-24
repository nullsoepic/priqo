interface QueueItem<T> {
  fn: (...args: any[]) => Promise<T>;
  args: any[];
  priority: number;
  id: string;
  resolve: (value: T | PromiseLike<T>) => void;
  reject?: (reason?: any) => void;
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
    args: any[],
    priority = 0,
    id: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, args, priority, id, resolve, reject });
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
          this.removeFromProcessingQueue(item);
        })
        .catch((error) => {
          item.reject?.(error);
          this.removeFromProcessingQueue(item);
        });
    }
  }

  private removeFromProcessingQueue(item: QueueItem<T>) {
    this.processingQueue = this.processingQueue.filter((i) => i !== item);
    this.processNextItem();
  }

  cancel(id: string): void {
    const cancelItem = (queue: QueueItem<T>[], id: string) => {
      const index = queue.findIndex((item) => item.id === id);
      if (index !== -1) {
        const [item] = queue.splice(index, 1);
        item.reject?.(new Error(`Task ${id} was cancelled`));
        return true;
      }
      return false;
    };

    if (!cancelItem(this.queue, id)) {
      if (cancelItem(this.processingQueue, id)) {
        this.processNextItem();
      }
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
