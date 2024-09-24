# priqo

## Priority Queue Library

`priqo` is a lightweight (640b gzipped) JavaScript library that provides a priority queue implementation. It allows you to manage tasks with different priorities, ensuring that higher-priority tasks are executed before lower-priority ones.

### Features

- **Priority-Based Execution**: Tasks are executed based on their priority, with higher-priority tasks being processed first.
- **Concurrency Control**: You can set the desired concurrency level to control how many tasks are processed simultaneously.
- **Task Cancellation**: Supports cancelling tasks by their unique IDs.
- **Error Handling**: Properly handles errors and rejections, ensuring that failed tasks do not block the queue.

### Installation

To use `priqo` in your project, install it using your favourite package manager:

```bash
bun install priqo
```

### Usage

Here is an example of how to use `priqo`:

```typescript
import { PriorityQueue } from 'priqo';

const queue = new PriorityQueue(3); // Create a priority queue with a concurrency of 3

// Enqueue tasks with different priorities
queue.enqueue(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate long-running task
    return 1;
  },
  [],
  1,
  'longTask'
);

queue.enqueue(async (x) => x, [2], 2, 'highPriorityTask');

queue.enqueue(async (x) => x, [3], 0, 'lowPriorityTask');

// Cancel a task by its ID
queue.cancel('lowPriorityTask');

// Wait for tasks to complete
const result1 = await queue.enqueue(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate long-running task
    return 1;
  },
  [],
  1,
  'anotherLongTask'
);

console.log(result1); // Output: 1
```

### API Documentation

#### `PriorityQueue`

- **Constructor**: `new PriorityQueue<T>(concurrency: number)`
  - Creates a new priority queue with the specified concurrency level (`concurrency`).

#### Methods

- **`enqueue`**:

  - `enqueue(fn: (...args: any[]) => Promise<T>, args: Parameters<typeof fn>, priority = 0, id: string): Promise<T>`
    - Adds a task to the queue. The task is represented by the function `fn`, which returns a promise of type `T`. The `args` parameter is an array of arguments to be passed to `fn`. The `priority` parameter determines the order in which tasks are executed, and the `id` parameter is a unique identifier for the task.

- **`cancel`**:

  - `cancel(id: string): void`
    - Cancels a task by its unique ID.

- **`isEmpty`**:

  - `isEmpty(): boolean`
    - Returns whether the queue is empty (both processing and waiting queues).

- **`setConcurrency`**:
  - `setConcurrency(size: number): void`
    - Sets the desired concurrency level of the queue.

### Testing

The library includes comprehensive tests to ensure its functionality. These tests are written and run using Bun's built-in testing framework. You can execute the tests using the `bun test` command.

### Contributing

Contributions are welcome If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

### License

`priqo` is licensed under the [MIT License](LICENSE).
