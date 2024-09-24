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
    queue.setDesiredSize(2);
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
});
