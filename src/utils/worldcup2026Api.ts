import { Match, MatchEvent, Team } from '../types';
import { getBracketAdvanceTarget, FIFA_R32_VISUAL_ORDER } from '../data/bracket2026';

const API_BASE = 'https://worldcup26.ir';

const CACHE_KEY = 'wc2026_schedule_data';
const CACHE_AT_KEY = 'wc2026_schedule_fetched_at';

export interface Wc2026Game {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers?: string | null;
  away_scorers?: string | null;
  group: string;
  matchday: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
}

export interface Wc2026Stadium {
  id: string;
  name_en: string;
  city_en: string;
  country_en: string;
  region?: string;
}

export interface Wc2026ScheduleCache {
  games: Wc2026Game[];
  stadiums: Wc2026Stadium[];
}

const KNOCKOUT_TYPES = new Set(['r32', 'r16', 'qf', 'sf', 'final']);

function gameIdToBracketMeta(gameId: string): {
  round: number;
  index: number;
  bracketId: string;
} | null {
  const id = parseInt(gameId, 10);
  if (id >= 73 && id <= 88) return { round: 0, index: id - 73, bracketId: `r32-${id - 73}` };
  if (id >= 89 && id <= 96) return { round: 1, index: id - 89, bracketId: `r16-${id - 89}` };
  if (id >= 97 && id <= 100) return { round: 2, index: id - 97, bracketId: `qf-${id - 97}` };
  if (id >= 101 && id <= 102) return { round: 3, index: id - 101, bracketId: `sf-${id - 101}` };
  if (id === 104) return { round: 4, index: 0, bracketId: 'final-0' };
  return null;
}

function createBracketSkeleton(): Match[] {
  const empty = (
    id: string,
    round: number,
    index: number,
  ): Match => ({
    id,
    round,
    index,
    team1Id: null,
    team2Id: null,
    team1Name: undefined,
    team2Name: undefined,
    team1Code: null,
    team2Code: null,
    score1: null,
    score2: null,
    status: 'scheduled',
    time: '',
    utcTimestamp: 0,
    events: [],
  });

  const matches: Match[] = [];
  for (let i = 0; i < 16; i++) matches.push(empty(`r32-${i}`, 0, i));
  for (let i = 0; i < 8; i++) matches.push(empty(`r16-${i}`, 1, i));
  for (let i = 0; i < 4; i++) matches.push(empty(`qf-${i}`, 2, i));
  for (let i = 0; i < 2; i++) matches.push(empty(`sf-${i}`, 3, i));
  matches.push(empty('final-0', 4, 0));
  return matches;
}

function getMatchWinnerId(match: Match): string | null {
  if (match.status !== 'finished' || match.score1 === null || match.score2 === null) {
    return null;
  }
  const pickWinner = (slot: 1 | 2): string | null => {
    const id = slot === 1 ? match.team1Id : match.team2Id;
    const code = slot === 1 ? match.team1Code : match.team2Code;
    if (id) return id;
    if (code && code !== 'xx') return code;
    return null;
  };

  if (match.penalties1 !== undefined && match.penalties2 !== undefined) {
    if (match.penalties1 === match.penalties2) return null;
    return match.penalties1 > match.penalties2 ? pickWinner(1) : pickWinner(2);
  }
  if (match.score1 === match.score2) return null;
  return match.score1 > match.score2 ? pickWinner(1) : pickWinner(2);
}

function copyTeamSlot(
  target: Match,
  slot: 1 | 2,
  sourceId: string | null,
  sourceName?: string,
  sourceCode?: string | null,
  overwrite = false,
): void {
  if (!sourceId) return;
  if (slot === 1) {
    if (overwrite || !target.team1Id) target.team1Id = sourceId;
    if (sourceName && (overwrite || !target.team1Name)) target.team1Name = sourceName;
    if (sourceCode && (overwrite || !target.team1Code)) target.team1Code = sourceCode;
  } else {
    if (overwrite || !target.team2Id) target.team2Id = sourceId;
    if (sourceName && (overwrite || !target.team2Name)) target.team2Name = sourceName;
    if (sourceCode && (overwrite || !target.team2Code)) target.team2Code = sourceCode;
  }
}

function propagateBracketWinners(matches: Match[]): Match[] {
  const result = matches.map((m) => ({ ...m }));
  const findMatch = (round: number, index: number) =>
    result.find((m) => m.round === round && m.index === index);

  for (const match of result) {
    const winnerId = getMatchWinnerId(match);
    if (!winnerId) continue;

    const isTeam1Winner = match.team1Id === winnerId;
    const winnerName = isTeam1Winner ? match.team1Name : match.team2Name;
    const winnerCode = isTeam1Winner ? match.team1Code : match.team2Code;

    const advance = getBracketAdvanceTarget(match.round, match.index);
    if (!advance) continue;

    const parent = findMatch(advance.nextRound, advance.nextIndex);
    if (!parent) continue;

    copyTeamSlot(parent, advance.slot, winnerId, winnerName ?? undefined, winnerCode, true);
  }

  return result;
}

const TYPE_TO_ROUND: Record<string, number> = {
  group: -1,
  r32: 0,
  r16: 1,
  qf: 2,
  sf: 3,
  final: 4,
  third: 5,
};

/** Stadium region → UTC offset (summer, host local time) */
const REGION_UTC_OFFSET: Record<string, number> = {
  Central: -6,
  Eastern: -4,
  Western: -7,
};

const TEAM_NAME_TO_FLAG: Record<string, string> = {
  Mexico: 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Czech Republic': 'cz',
  Canada: 'ca',
  'Bosnia and Herzegovina': 'ba',
  'Bosnia & Herzegovina': 'ba',
  Qatar: 'qa',
  Switzerland: 'ch',
  Brazil: 'br',
  Morocco: 'ma',
  Haiti: 'ht',
  Scotland: 'gb-sct',
  Paraguay: 'py',
  Australia: 'au',
  Germany: 'de',
  Curaçao: 'cw',
  Netherlands: 'nl',
  Japan: 'jp',
  'Ivory Coast': 'ci',
  Ecuador: 'ec',
  Tunisia: 'tn',
  Spain: 'es',
  'Cape Verde': 'cv',
  Belgium: 'be',
  Egypt: 'eg',
  'Saudi Arabia': 'sa',
  Uruguay: 'uy',
  Iran: 'ir',
  'New Zealand': 'nz',
  France: 'fr',
  Senegal: 'sn',
  Norway: 'no',
  'United States': 'us',
  USA: 'us',
  Colombia: 'co',
  Portugal: 'pt',
  Croatia: 'hr',
  Austria: 'at',
  Algeria: 'dz',
  Argentina: 'ar',
  Ghana: 'gh',
  England: 'gb-eng',
  Panama: 'pa',
  Uzbekistan: 'uz',
  Jordan: 'jo',
  Turkey: 'tr',
  Turkiye: 'tr',
  Iraq: 'iq',
  Sweden: 'se',
  'Democratic Republic of the Congo': 'cd',
  'DR Congo': 'cd',
};

function readCache(): Wc2026ScheduleCache | null {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Wc2026ScheduleCache;
    if (parsed.games?.length) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function writeCache(data: Wc2026ScheduleCache): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_AT_KEY, Date.now().toString());
}

async function fetchJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { signal });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`worldcup26.ir ${response.status}: ${body || response.statusText}`);
  }
  return response.json();
}

/** Fetch all WC 2026 matches + stadiums from worldcup26.ir */
export async function fetchWorldCupSchedule(): Promise<Wc2026ScheduleCache> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const [gamesRes, stadiumsRes] = await Promise.all([
      fetchJson<{ games: Wc2026Game[] }>('/get/games', controller.signal),
      fetchJson<{ stadiums: Wc2026Stadium[] }>('/get/stadiums', controller.signal),
    ]);

    clearTimeout(timeoutId);

    const data: Wc2026ScheduleCache = {
      games: gamesRes.games ?? [],
      stadiums: stadiumsRes.stadiums ?? [],
    };

    if (data.games.length === 0) {
      throw new Error('API trả về 0 trận đấu');
    }

    writeCache(data);
    return data;
  } catch (error) {
    console.warn('Could not fetch worldcup26.ir schedule, trying cache:', error);
    const cached = readCache();
    if (cached) return cached;
    throw error;
  }
}

export function formatVietnamTime(utcTimestamp: number): string {
  const vnDate = new Date(utcTimestamp + 7 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${pad(vnDate.getUTCDate())}/${pad(vnDate.getUTCMonth() + 1)}/${vnDate.getUTCFullYear()}`;
  const timeStr = `${pad(vnDate.getUTCHours())}:${pad(vnDate.getUTCMinutes())}`;
  return `${timeStr} - ${dateStr} (UTC+7)`;
}

function parseLocalDate(localDate: string, utcOffsetHours: number): number {
  const [datePart, timePart] = localDate.trim().split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return Date.UTC(year, month - 1, day, hour - utcOffsetHours, minute);
}

function buildStadiumMap(stadiums: Wc2026Stadium[]): Map<string, Wc2026Stadium> {
  return new Map(stadiums.map((s) => [s.id, s]));
}

function buildTeamLookup(teams: Team[]): Map<string, string> {
  const lookup = new Map<string, string>();
  teams.forEach((t) => {
    lookup.set(t.englishName.toLowerCase(), t.id);
    lookup.set(t.name.toLowerCase(), t.id);
    lookup.set(t.code.toLowerCase(), t.id);
  });
  for (const [alias, id] of Object.entries(TEAM_NAME_TO_FLAG)) {
    lookup.set(alias.toLowerCase(), id);
  }
  return lookup;
}

function resolveTeamId(name: string, lookup: Map<string, string>): string | null {
  if (!name || /winner|runner|loser|3rd group/i.test(name)) return null;
  return lookup.get(name.toLowerCase()) ?? null;
}

function getTeamFlagCode(name: string, teamId: string | null, teams: Team[]): string | null {
  if (teamId) {
    const team = teams.find((t) => t.id === teamId);
    if (team) return team.code;
  }
  return TEAM_NAME_TO_FLAG[name] ?? null;
}

function formatGroupLabel(group: string, type: string): string | undefined {
  if (type === 'group' && /^[A-L]$/i.test(group)) return `Group ${group.toUpperCase()}`;
  if (type === 'group') return group;
  return undefined;
}

function mapGameStatus(game: Wc2026Game): Match['status'] {
  if (game.finished?.toUpperCase() === 'TRUE') return 'finished';
  const elapsed = (game.time_elapsed ?? '').toLowerCase();
  if (elapsed && elapsed !== 'notstarted' && elapsed !== 'finished') return 'live';
  return 'scheduled';
}

function parseLiveMinute(timeElapsed: string): number | undefined {
  const match = timeElapsed.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

function parseScorerEvents(
  scorersRaw: string | null | undefined,
  teamId: string | null,
  prefix: string,
): MatchEvent[] {
  if (!scorersRaw || scorersRaw === 'null') return [];

  const events: MatchEvent[] = [];
  const pattern = /([^,{"]+?)\s+(\d+(?:\+\d+)?)'/g;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = pattern.exec(scorersRaw)) !== null) {
    const playerName = match[1].replace(/[\\"{}]/g, '').trim();
    const minuteMatch = match[2].match(/\d+/);
    events.push({
      id: `evt-${prefix}-${idx++}`,
      time: minuteMatch ? parseInt(minuteMatch[0], 10) : 0,
      type: 'goal',
      teamId: teamId ?? '',
      playerName: playerName || 'Cầu thủ',
      detail: scorersRaw.includes('(p)') || scorersRaw.includes('(P)') ? 'Penalty' : undefined,
    });
  }

  return events;
}

function getTeamDisplayName(
  nameEn: string | undefined,
  label: string | undefined,
  teamId: string,
): string | null {
  if (nameEn) return nameEn;
  if (label) return label;
  if (teamId && teamId !== '0') return null;
  return null;
}

function mapGameToMatch(
  game: Wc2026Game,
  stadiumMap: Map<string, Wc2026Stadium>,
  lookup: Map<string, string>,
  teams: Team[],
): Match {
  const homeName =
    getTeamDisplayName(game.home_team_name_en, game.home_team_label, game.home_team_id) ?? 'TBD';
  const awayName =
    getTeamDisplayName(game.away_team_name_en, game.away_team_label, game.away_team_id) ?? 'TBD';

  const team1Id = game.home_team_id !== '0' ? resolveTeamId(homeName, lookup) : null;
  const team2Id = game.away_team_id !== '0' ? resolveTeamId(awayName, lookup) : null;

  const stadium = stadiumMap.get(game.stadium_id);
  const utcOffset = REGION_UTC_OFFSET[stadium?.region ?? 'Eastern'] ?? -4;
  const utcTimestamp = parseLocalDate(game.local_date, utcOffset);

  const score1 = game.home_score !== '' ? parseInt(game.home_score, 10) : null;
  const score2 = game.away_score !== '' ? parseInt(game.away_score, 10) : null;
  const status = mapGameStatus(game);

  const events = [
    ...parseScorerEvents(game.home_scorers, team1Id, `h-${game.id}`),
    ...parseScorerEvents(game.away_scorers, team2Id, `a-${game.id}`),
  ].sort((a, b) => a.time - b.time);

  return {
    id: `wc26-${game.id}`,
    round: TYPE_TO_ROUND[game.type] ?? -1,
    index: parseInt(game.id, 10),
    team1Id,
    team2Id,
    team1Name: homeName,
    team2Name: awayName,
    team1Code: getTeamFlagCode(homeName, team1Id, teams),
    team2Code: getTeamFlagCode(awayName, team2Id, teams),
    score1: Number.isNaN(score1!) ? null : score1,
    score2: Number.isNaN(score2!) ? null : score2,
    status,
    liveMinute: status === 'live' ? parseLiveMinute(game.time_elapsed) : undefined,
    time: formatVietnamTime(utcTimestamp),
    utcTimestamp,
    venue: stadium
      ? { stadium: stadium.name_en, city: `${stadium.city_en}, ${stadium.country_en}` }
      : undefined,
    group: formatGroupLabel(game.group, game.type),
    events,
  };
}

export function mapScheduleToMatches(
  data: Wc2026ScheduleCache,
  teams: Team[],
): Match[] {
  const stadiumMap = buildStadiumMap(data.stadiums);
  const lookup = buildTeamLookup(teams);

  return data.games
    .map((g) => mapGameToMatch(g, stadiumMap, lookup, teams))
    .sort((a, b) => a.utcTimestamp - b.utcTimestamp);
}

/** Knockout schedule only (R32 → Final) for the Lịch thi đấu tab */
export function mapScheduleToKnockoutMatches(
  data: Wc2026ScheduleCache,
  teams: Team[],
): Match[] {
  return mapScheduleToMatches(data, teams).filter((m) => m.round >= 0);
}

/** Bracket tree (r32-0 … final-0) synced from API results */
export function mapScheduleToBracketMatches(
  data: Wc2026ScheduleCache,
  teams: Team[],
): Match[] {
  const stadiumMap = buildStadiumMap(data.stadiums);
  const lookup = buildTeamLookup(teams);
  const skeleton = createBracketSkeleton();
  const byBracketId = new Map(skeleton.map((m) => [m.id, { ...m }]));

  for (const game of data.games) {
    if (!KNOCKOUT_TYPES.has(game.type)) continue;
    const meta = gameIdToBracketMeta(game.id);
    if (!meta) continue;

    const mapped = mapGameToMatch(game, stadiumMap, lookup, teams);
    byBracketId.set(meta.bracketId, {
      ...mapped,
      id: meta.bracketId,
      round: meta.round,
      index: meta.index,
    });
  }

  return propagateBracketWinners(Array.from(byBracketId.values()));
}

export function buildOuterRingTeams(r32Matches: Match[], teams: Team[]): Team[] {
  const byIndex = new Map(r32Matches.map((m) => [m.index, m]));
  const slots: Team[] = [];

  const placeholder = (
    key: string,
    name: string,
    code: string | null,
  ): Team => ({
    id: key,
    name,
    englishName: name,
    code: code ?? 'xx',
    group: '?',
    rank: 999,
    starPlayer: '—',
    coach: '—',
    bestFinish: '—',
    stats: {
      goalsScored: 0,
      goalsConceded: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 0,
      possession: 50,
    },
  });

  for (const r32Idx of FIFA_R32_VISUAL_ORDER) {
    const match = byIndex.get(r32Idx);
    if (!match) {
      slots.push(
        placeholder(`r32-${r32Idx}-t1`, 'Chờ xác định', null),
        placeholder(`r32-${r32Idx}-t2`, 'Chờ xác định', null),
      );
      continue;
    }
    for (const slot of [1, 2] as const) {
      const id = slot === 1 ? match.team1Id : match.team2Id;
      const name = slot === 1 ? match.team1Name : match.team2Name;
      const code = slot === 1 ? match.team1Code : match.team2Code;
      const known = id ? teams.find((t) => t.id === id) : null;
      if (known) {
        slots.push(known);
      } else {
        slots.push(
          placeholder(
            id ?? `${match.id}-t${slot}`,
            name ?? 'Chờ xác định',
            code,
          ),
        );
      }
    }
  }

  return slots;
}
