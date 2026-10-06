import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ChatMessage, MAX_HISTORY, MAX_INPUT_CHARS, buildPayload, clampInput, parseReply } from './chat';

const m = (role: 'user' | 'assistant', content: string, id = content): ChatMessage => ({
  id,
  role,
  content,
});

test('buildPayload: keeps the order and the language', () => {
  const p = buildPayload([m('user', 'hi'), m('assistant', 'hello'), m('user', 'cramps?')], 'ar');
  assert.equal(p.language, 'ar');
  assert.deepEqual(p.messages, [
    { role: 'user', content: 'hi' },
    { role: 'assistant', content: 'hello' },
    { role: 'user', content: 'cramps?' },
  ]);
  assert.equal(p.context, undefined);
});

test('buildPayload: only the last messages are sent and it starts with her question', () => {
  const many: ChatMessage[] = [];
  for (let i = 0; i < 40; i++) many.push(m(i % 2 === 0 ? 'user' : 'assistant', `m${i}`, `id${i}`));
  const p = buildPayload(many, 'en');
  assert.ok(p.messages.length <= MAX_HISTORY);
  assert.equal(p.messages[0].role, 'user');
});

test('buildPayload: messages of the same sender in a row are joined', () => {
  const p = buildPayload([m('user', 'first', 'a'), m('user', 'second', 'b')], 'en');
  assert.equal(p.messages.length, 1);
  assert.equal(p.messages[0].content, 'first\n\nsecond');
});

test('buildPayload: very long and empty messages are handled', () => {
  const p = buildPayload([m('user', 'x'.repeat(MAX_INPUT_CHARS + 500), 'a'), m('user', '   ', 'b')], 'en');
  assert.equal(p.messages.length, 1);
  assert.equal(p.messages[0].content.length, MAX_INPUT_CHARS);
  assert.deepEqual(buildPayload([m('assistant', 'hi')], 'en').messages, []);
});

test('buildPayload: the cycle information is added only when given', () => {
  const ctx = { cycleDay: 3, cycleLength: 28, phase: 'menstrual', onPeriod: true };
  assert.deepEqual(buildPayload([m('user', 'q')], 'en', ctx).context, ctx);
  assert.equal(buildPayload([m('user', 'q')], 'en', {}).context, undefined);
});

test('clampInput trims spaces', () => {
  assert.equal(clampInput('  hello  '), 'hello');
});

test('parseReply: accepts a text answer and rejects anything else', () => {
  assert.equal(parseReply({ reply: '  Hello  ' }), 'Hello');
  assert.throws(() => parseReply({}));
  assert.throws(() => parseReply({ reply: '   ' }));
  assert.throws(() => parseReply(null));
  assert.throws(() => parseReply('text'));
});