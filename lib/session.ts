import type { RespondentType } from "./referral";
import type { ScreeningScores } from "./scoring";

/**
 * In-memory screening session — deliberately module-scoped state only.
 * Nothing here touches localStorage, cookies, or the URL: a hard refresh
 * wipes the session, which is the intended privacy behaviour for an
 * anonymous screening.
 */

let sessionUuid: string | null = null;
let result: ScreeningScores | null = null;
let respondentType: RespondentType = "pelajar";

/** Called from the consent gate; starts a fresh anonymous session. */
export function startSession(type: RespondentType = "pelajar"): string {
  sessionUuid = crypto.randomUUID();
  result = null;
  respondentType = type;
  return sessionUuid;
}

export function getSessionUuid(): string | null {
  return sessionUuid;
}

export function getSessionUserType(): RespondentType {
  return respondentType;
}

export function setSessionUserType(type: RespondentType): void {
  respondentType = type;
}

export function setScreeningResult(scores: ScreeningScores): void {
  result = scores;
}

export function getScreeningResult(): ScreeningScores | null {
  return result;
}
