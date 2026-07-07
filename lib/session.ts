import type { ScreeningScores } from "./scoring";

/**
 * In-memory screening session — deliberately module-scoped state only.
 * Nothing here touches localStorage, cookies, or the URL: a hard refresh
 * wipes the session, which is the intended privacy behaviour for an
 * anonymous screening.
 */

let sessionUuid: string | null = null;
let result: ScreeningScores | null = null;

/** Called from the consent gate; starts a fresh anonymous session. */
export function startSession(): string {
  sessionUuid = crypto.randomUUID();
  result = null;
  return sessionUuid;
}

export function getSessionUuid(): string | null {
  return sessionUuid;
}

export function setScreeningResult(scores: ScreeningScores): void {
  result = scores;
}

export function getScreeningResult(): ScreeningScores | null {
  return result;
}
