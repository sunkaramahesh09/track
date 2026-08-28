import { fromDayKey, weekdayOf, type DayKey } from "./date";

export interface Motivation {
  quote: string;
  author: string;
  focus: string;
}

const QUOTES: { quote: string; author: string }[] = [
  { quote: "Consistency beats intensity.", author: "Track" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { quote: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { quote: "Hard choices, easy life. Easy choices, hard life.", author: "Jerzy Gregorek" },
  { quote: "The obstacle is the way.", author: "Marcus Aurelius" },
  { quote: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", author: "Stephen King" },
  { quote: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { quote: "The magic you're looking for is in the work you're avoiding.", author: "Unknown" },
  { quote: "Motivation gets you going. Habit keeps you growing.", author: "John C. Maxwell" },
  { quote: "Nothing will work unless you do.", author: "Maya Angelou" },
  { quote: "Compound interest is the eighth wonder of the world. It applies to skill too.", author: "Unknown" },
  { quote: "Slow is smooth. Smooth is fast.", author: "Unknown" },
  { quote: "You will never always be motivated. You must learn to be disciplined.", author: "Unknown" },
];

const FOCUS_BY_WEEKDAY: Record<number, string> = {
  0: "Review the week honestly. Decide one thing to change.",
  1: "Networks day. Start strong — Monday sets the tone.",
  2: "OOPS day. Explain every concept out loud as if in an interview.",
  3: "OS day. Midweek is where consistency is really tested.",
  4: "DBMS day. Write the queries, don't just read them.",
  5: "Revision day. Retrieval beats re-reading.",
  6: "Revision day. Close the loops you left open this week.",
};

/**
 * Deterministic per-day pick, so the quote is stable through the day and
 * identical on the server and the client.
 */
export function motivationFor(day: DayKey): Motivation {
  const seed = Math.floor(fromDayKey(day).getTime() / 86_400_000);
  const pick = QUOTES[((seed % QUOTES.length) + QUOTES.length) % QUOTES.length];
  return { ...pick, focus: FOCUS_BY_WEEKDAY[weekdayOf(day)] };
}
