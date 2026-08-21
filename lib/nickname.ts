export const NICKNAME_MIN_LENGTH = 3;
export const NICKNAME_MAX_LENGTH = 24;
export const GENERATED_NICKNAME_PREFIX = "member-";

const nicknamePattern = /^[a-z0-9][a-z0-9_-]*$/;

export function normalizeNickname(value: string) {
  return value.trim().toLowerCase();
}

export function getNicknameValidationError(value: string) {
  const nickname = normalizeNickname(value);

  if (nickname.length < NICKNAME_MIN_LENGTH || nickname.length > NICKNAME_MAX_LENGTH) {
    return `Nickname must be between ${NICKNAME_MIN_LENGTH} and ${NICKNAME_MAX_LENGTH} characters.`;
  }

  if (!nicknamePattern.test(nickname)) {
    return "Use lowercase letters, numbers, hyphens, or underscores, starting with a letter or number.";
  }

  if (isGeneratedNickname(nickname)) {
    return `Nicknames beginning with ${GENERATED_NICKNAME_PREFIX} are reserved for existing accounts.`;
  }

  return null;
}

export function isGeneratedNickname(value: string) {
  return normalizeNickname(value).startsWith(GENERATED_NICKNAME_PREFIX);
}

export function getPrivateFallbackNickname(userId: string) {
  const safeId = userId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(-12);
  return `${GENERATED_NICKNAME_PREFIX}${safeId || "community"}`;
}
