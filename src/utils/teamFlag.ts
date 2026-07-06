export const TEAM_FLAG_PLACEHOLDER = '/team-flag-placeholder.svg';

const PLACEHOLDER_CODES = new Set(['xx', 'tbd']);

export function isPlaceholderTeamCode(code: string | null | undefined): boolean {
  if (!code?.trim()) return true;
  return PLACEHOLDER_CODES.has(code.trim().toLowerCase());
}

export function getTeamFlagUrl(code: string | null | undefined): string {
  if (isPlaceholderTeamCode(code)) return TEAM_FLAG_PLACEHOLDER;
  return `https://flagcdn.com/w80/${code!.trim().toLowerCase()}.png`;
}
