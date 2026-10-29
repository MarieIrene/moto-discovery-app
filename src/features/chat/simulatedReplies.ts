import { ChatSide } from './conversations';

/**
 * Sample drivers and passengers have no one behind them, so in this demo they answer with a short
 * canned reply. A real app would deliver messages through a server and push notifications.
 */
export function simulatedReply(text: string, replier: ChatSide): string {
  const t = text.toLowerCase();
  const has = (...words: string[]) => words.some((w) => new RegExp(`\\b${w}\\b`).test(t));

  if (replier === 'driver') {
    if (has('how much', 'price', 'cost', 'angahe', 'amafaranga', 'rwf', 'frw')) return 'Tell me where you are going and I will tell you the price before we leave.';
    if (has('where are you', 'uri he', 'how long', 'minutes', 'far')) return 'I am close by. About 5 minutes to reach you.';
    if (has('thank', 'murakoze', 'ok', 'sawa')) return 'Murakoze! See you soon.';
    if (has('hello', 'hi', 'muraho', 'mwiriwe', 'mwaramutse', 'available')) return 'Muraho! Yes, I am available. Where should I pick you up?';
    if (has('helmet', 'kasike')) return 'Yes, I have a clean helmet for you.';
    return 'Okay, I am on my way. Wait by the road and I will call you when I arrive.';
  }
  if (has('price', 'rwf', 'frw', 'amafaranga')) return 'Okay, that price is fine for me.';
  if (has('minutes', 'coming', 'on my way', 'ndaje')) return 'Okay, I am waiting by the road.';
  if (has('where', 'uri he')) return 'I am next to the bus park, near the pharmacy.';
  return 'Murakoze! I will wait for you.';
}

/** A short "typing" pause that grows a little with the length of the reply. */
export function replyDelayMs(reply: string): number {
  return Math.min(3500, 1200 + reply.length * 25);
}
