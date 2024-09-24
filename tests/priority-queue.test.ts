import { PriorityQueue } from '../src';
import { describe, it, expect } from 'bun:test';

describe('PriorityQueue', () => {
  it('should enqueue items with correct priority', async () => {
    const queue = new PriorityQueue<number>(2);

    const result1 = queue.enqueue(async (x) => x, [1], 1, 'task1');
    const result2 = queue.enqueue(async (x) => x, [2], 2, 'task2');

    const res1 = await result1;
    const res2 = await result2;

    expect(res1).toBe(1);
    expect(res2).toBe(2);
  });

  it('should process items asynchronously', async () => {
    const queue = new PriorityQueue<number>(1);

    const result1 = queue.enqueue(async (x) => x, [1], 1, 'task1');
    const result2 = queue.enqueue(async (x) => x, [2], 2, 'task2');

    const res1 = await result1;
    const res2 = await result2;

    expect(res1).toBe(1);
    expect(res2).toBe(2);
  });

  it('should handle dynamic processing queue size', async () => {
    const queue = new PriorityQueue<number>(1);

    queue.enqueue(async (x) => x, [1], 1, 'task1');
    queue.setConcurrency(2);
    const result2 = queue.enqueue(async (x) => x, [2], 2, 'task2');
    const result3 = queue.enqueue(async (x) => x, [3], 3, 'task3');

    const res2 = await result2;
    const res3 = await result3;

    expect(res2).toBe(2);
    expect(res3).toBe(3);
  });

  it('should check if queue is empty', () => {
    const queue = new PriorityQueue<number>(1);
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(async (x) => x, [1], 1, 'task1');
    expect(queue.isEmpty()).toBe(false);
  });

  it('should process items in order of priority', async () => {
    const queue = new PriorityQueue<number>(1);

    const result1 = queue.enqueue(async (x) => x, [1], 2, 'task1');
    const result2 = queue.enqueue(async (x) => x, [2], 1, 'task2');
    const result3 = queue.enqueue(async (x) => x, [3], 3, 'task3');

    const res1 = await result1;
    const res2 = await result2;
    const res3 = await result3;

    expect(res2).toBe(2);
    expect(res1).toBe(1);
    expect(res3).toBe(3);
  });

  it('should handle errors in tasks', async () => {
    const queue = new PriorityQueue<number>(1);

    const result1 = queue.enqueue(
      async () => {
        throw new Error('Task failed');
      },
      [],
      1,
      'failingTask'
    );
    const result2 = queue.enqueue(async (x) => x, [2], 2, 'successfulTask');

    expect(result1).rejects.toThrow('Task failed');
    const res2 = await result2;
    expect(res2).toBe(2);
  });

  it('should allow cancellation of tasks', async () => {
    const queue = new PriorityQueue<number>(1);

    const longRunningTask = new Promise<number>((resolve) => {
      setTimeout(() => resolve(1), 2000);
    });

    const result1 = queue.enqueue(
      async () => longRunningTask,
      [],
      1,
      'cancelledTask'
    );
    const result2 = queue.enqueue(async (x) => x, [2], 2, 'simpleTask');

    // Ensure cancellation happens immediately after enqueuing
    queue.cancel('cancelledTask');

    expect(result1).rejects.toThrow('Task cancelledTask was cancelled');

    expect(await result2).toBe(2);
  });

  it('should check if a task is queued', async () => {
    const queue = new PriorityQueue<number>(1);
    queue.enqueue(async (x) => x, [1], 1, 'task1');
    const result2 = queue.enqueue(async (x) => x, [2], 2, 'task2');

    expect(queue.isQueued('task2')).toBe(true);
    expect(queue.isQueued('task1')).toBe(false);
    expect(queue.isQueued('nonexistent')).toBe(false);

    await result2;
  });

  it('should check if a task is processing', async () => {
    const queue = new PriorityQueue<number>(1);
    const longTask = new Promise<number>((resolve) =>
      setTimeout(() => resolve(1), 100)
    );
    const result1 = queue.enqueue(async () => longTask, [], 1, 'task1');
    queue.enqueue(async (x) => x, [2], 2, 'task2');

    expect(queue.isProcessing('task1')).toBe(true);
    expect(queue.isProcessing('task2')).toBe(false);
    expect(queue.isProcessing('nonexistent')).toBe(false);

    await result1;
  });

  it('should check if a task is queued or processing', async () => {
    const queue = new PriorityQueue<number>(1);
    const longTask = new Promise<number>((resolve) =>
      setTimeout(() => resolve(1), 100)
    );
    const result1 = queue.enqueue(async () => longTask, [], 1, 'task1');
    queue.enqueue(async (x) => x, [2], 2, 'task2');

    expect(queue.isProcessingOrQueued('task1')).toBe(true);
    expect(queue.isProcessingOrQueued('task2')).toBe(true);
    expect(queue.isProcessingOrQueued('nonexistent')).toBe(false);

    await result1;
  });

  it('should ensure task ids are unique', async () => {
    const queue = new PriorityQueue<number>(1);
    queue.enqueue(
      async () => new Promise((resolve) => setTimeout(() => resolve(1), 1000)),
      [],
      1,
      'task1'
    );

    const res = queue.enqueue(async (x) => x, [2], 2, 'task1');

    expect(res).rejects.toThrow('Task with id task1 already exists');
  });
});
