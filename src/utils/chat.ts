/** Rules of the chat assistant. No phone code in here, so they can be tested. */

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

/**
 * The only cycle information that may leave the phone, and only if she agreed.
 * No name, email, phone, birth date or exact dates are ever included.
 */
export interface ChatContext {
  cycleDay?: number;
  cycleLength?: number;
  phase?: string;
  onPeriod?: boolean;
}

export interface ChatPayload {
  language: string;
  messages: { role: ChatRole; content: string }[];
  context?: ChatContext;
}

export const MAX_HISTORY = 20; // messages sent with each question
export const MAX_INPUT_CHARS = 1000; // one message

/** Cuts a message to the allowed length. */
export const clampInput = (text: string) => text.trim().slice(0, MAX_INPUT_CHARS);

/**
 * Prepares what is sent to the server: the last messages only, starting with a question from her,
 * and with consecutive messages of the same sender joined (a failed question followed by a new one).
 */
export function buildPayload(
  messages: ChatMessage[],
  language: string,
  context?: ChatContext
): ChatPayload {
  const recent = messages.slice(-MAX_HISTORY);
  const first = recent.findIndex((m) => m.role === 'user');
  const usable = first === -1 ? [] : recent.slice(first);

  const merged: { role: ChatRole; content: string }[] = [];
  for (const m of usable) {
    const content = clampInput(m.content);
    if (!content) continue;
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${content}`;
    else merged.push({ role: m.role, content });
  }

  const payload: ChatPayload = { language, messages: merged };
  if (context && Object.keys(context).length > 0) payload.context = context;
  return payload;
}

/** Reads the server answer. Throws when it is not what we expect. */
export function parseReply(json: unknown): string {
  const reply =
    typeof json === 'object' && json !== null ? (json as { reply?: unknown }).reply : undefined;
  if (typeof reply !== 'string' || reply.trim() === '') throw new Error('Empty reply');
  return reply.trim();
}