import { ChatPayload, parseReply } from './chat';

const TIMEOUT_MS = 45000;

/** Sends the conversation to the chat server and returns the answer text. Throws on any problem. */
export async function requestReply(url: string, payload: ChatPayload): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Chat server answered ${res.status}`);
    return parseReply(await res.json());
  } finally {
    clearTimeout(timer);
  }
}