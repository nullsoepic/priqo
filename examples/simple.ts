import { PriorityQueue } from '../src';

const queue = new PriorityQueue(3);

function simulateLlmResponse(
  id: string,
  message: string
): Promise<{ id: string; response: string }> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ id, response: `Response to ${message}` }), 1000)
  );
}

async function handleChatEvent(message: string, id: string): Promise<string> {
  const response = await queue.enqueue(
    simulateLlmResponse,
    [id, message],
    1,
    crypto.randomUUID()
  );
  return (response as { id: string; response: string }).response;
}

async function chatEventHandler(message: string, id: string) {
  try {
    const response = await handleChatEvent(message, id);
    console.log(`Received response for ${id}: ${response}`);
  } catch (error) {
    console.error(`Error handling chat event for ${id}:`, error);
  }
}

[
  'Hello',
  'How are you?',
  'What is your purpose?',
  'I am here to help',
  'Bye',
  'Goodbye',
  'See you later',
].forEach((message, index) => chatEventHandler(message, `user${index + 1}`));
