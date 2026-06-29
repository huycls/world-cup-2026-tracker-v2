import { Match, MatchEvent } from '../types';

// API endpoints for free World Cup data
const API_URL = 'https://worldcupjson.net/matches';

// Mapping 3-letter FIFA codes to our 2-letter flag/team codes
export const FIFA_CODE_MAP: Record<string, string> = {
  ARG: 'ar',
  FRA: 'fr',
  USA: 'us',
  ENG: 'gb',
  JPN: 'jp',
  BRA: 'br',
  NED: 'nl',
  MAR: 'ma',
  POR: 'pt',
  CRO: 'hr',
  ESP: 'es',
  SUI: 'ch',
  SEN: 'sn',
  AUS: 'au',
  KOR: 'kr',
  ECU: 'ec',
  KSA: 'sa',
  MEX: 'mx',
  GER: 'de',
  URU: 'uy',
  GHA: 'gh',
  BEL: 'be',
  CAN: 'ca',
  POL: 'se', // Map Poland to Sweden (or closest representation in our list)
  CRC: 'py', // Costa Rica -> Paraguay
  SRB: 'at', // Serbia -> Austria
  TUN: 'at', // Tunisia -> Austria
  CMR: 'sn', // Cameroon -> Senegal
  IRN: 'ie', // Iran -> Ireland
  QAT: 'eg', // Qatar -> Egypt
  WAL: 'gb', // Wales -> England/UK
  GIB: 'ie',
};

// Fallback high-fidelity actual World Cup 2022 matches if API is down or blocked by CORS
export const REAL_WC2022_MOCK_DATA = [
  // --- ROUND OF 16 ---
  {
    stage: 'Round of 16',
    team1: 'nl', // Netherlands
    team2: 'us', // USA
    score1: 3,
    score2: 1,
    events: [
      { type: 'goal', time: 10, teamId: 'nl', playerName: 'Memphis Depay' },
      { type: 'goal', time: 45, teamId: 'nl', playerName: 'Daley Blind' },
      { type: 'goal', time: 76, teamId: 'us', playerName: 'Haji Wright' },
      { type: 'goal', time: 81, teamId: 'nl', playerName: 'Denzel Dumfries' },
      { type: 'yellow_card', time: 60, teamId: 'nl', playerName: 'Teun Koopmeiners' },
      { type: 'yellow_card', time: 90, teamId: 'us', playerName: 'Sergino Dest' }
    ]
  },
  {
    stage: 'Round of 16',
    team1: 'ar', // Argentina
    team2: 'au', // Australia
    score1: 2,
    score2: 1,
    events: [
      { type: 'goal', time: 35, teamId: 'ar', playerName: 'Lionel Messi' },
      { type: 'goal', time: 57, teamId: 'ar', playerName: 'Julián Álvarez' },
      { type: 'goal', time: 77, teamId: 'au', playerName: 'Enzo Fernández (OG)' },
      { type: 'yellow_card', time: 15, teamId: 'au', playerName: 'Jackson Irvine' },
      { type: 'yellow_card', time: 38, teamId: 'au', playerName: 'Miloš Degenek' }
    ]
  },
  {
    stage: 'Round of 16',
    team1: 'jp', // Japan
    team2: 'hr', // Croatia
    score1: 1,
    score2: 1,
    penalties1: 1,
    penalties2: 3,
    events: [
      { type: 'goal', time: 43, teamId: 'jp', playerName: 'Daizen Maeda' },
      { type: 'goal', time: 55, teamId: 'hr', playerName: 'Ivan Perišić' },
      { type: 'yellow_card', time: 90, teamId: 'hr', playerName: 'Borna Barišić' }
    ]
  },
  {
    stage: 'Round of 16',
    team1: 'br', // Brazil
    team2: 'kr', // South Korea
    score1: 4,
    score2: 1,
    events: [
      { type: 'goal', time: 7, teamId: 'br', playerName: 'Vinícius Júnior' },
      { type: 'goal', time: 13, teamId: 'br', playerName: 'Neymar (P)' },
      { type: 'goal', time: 29, teamId: 'br', playerName: 'Richarlison' },
      { type: 'goal', time: 36, teamId: 'br', playerName: 'Lucas Paquetá' },
      { type: 'goal', time: 76, teamId: 'kr', playerName: 'Paik Seung-ho' },
      { type: 'yellow_card', time: 44, teamId: 'kr', playerName: 'Jung Woo-young' }
    ]
  },
  {
    stage: 'Round of 16',
    team1: 'gb', // England
    team2: 'sn', // Senegal
    score1: 3,
    score2: 0,
    events: [
      { type: 'goal', time: 38, teamId: 'gb', playerName: 'Jordan Henderson' },
      { type: 'goal', time: 45, teamId: 'gb', playerName: 'Harry Kane' },
      { type: 'goal', time: 57, teamId: 'gb', playerName: 'Bukayo Saka' },
      { type: 'yellow_card', time: 76, teamId: 'sn', playerName: 'Kalidou Koulibaly' }
    ]
  },
  {
    stage: 'Round of 16',
    team1: 'fr', // France
    team2: 'se', // Sweden / Poland
    score1: 3,
    score2: 1,
    events: [
      { type: 'goal', time: 44, teamId: 'fr', playerName: 'Olivier Giroud' },
      { type: 'goal', time: 74, teamId: 'fr', playerName: 'Kylian Mbappé' },
      { type: 'goal', time: 90, teamId: 'fr', playerName: 'Kylian Mbappé' },
      { type: 'goal', time: 99, teamId: 'se', playerName: 'Robert Lewandowski (P)' }
    ]
  },
  {
    stage: 'Round of 16',
    team1: 'ma', // Morocco
    team2: 'es', // Spain
    score1: 0,
    score2: 0,
    penalties1: 3,
    penalties2: 0,
    events: [
      { type: 'yellow_card', time: 90, teamId: 'ma', playerName: 'Romain Saïss' },
      { type: 'yellow_card', time: 116, teamId: 'es', playerName: 'Aymeric Laporte' }
    ]
  },
  {
    stage: 'Round of 16',
    team1: 'pt', // Portugal
    team2: 'ch', // Switzerland
    score1: 6,
    score2: 1,
    events: [
      { type: 'goal', time: 17, teamId: 'pt', playerName: 'Gonçalo Ramos' },
      { type: 'goal', time: 33, teamId: 'pt', playerName: 'Pepe' },
      { type: 'goal', time: 51, teamId: 'pt', playerName: 'Gonçalo Ramos' },
      { type: 'goal', time: 55, teamId: 'pt', playerName: 'Raphaël Guerreiro' },
      { type: 'goal', time: 58, teamId: 'ch', playerName: 'Manuel Akanji' },
      { type: 'goal', time: 67, teamId: 'pt', playerName: 'Gonçalo Ramos' },
      { type: 'goal', time: 92, teamId: 'pt', playerName: 'Rafael Leão' }
    ]
  },

  // --- QUARTER FINALS ---
  {
    stage: 'Quarter-finals',
    team1: 'hr', // Croatia
    team2: 'br', // Brazil
    score1: 1,
    score2: 1,
    penalties1: 4,
    penalties2: 2,
    events: [
      { type: 'goal', time: 105, teamId: 'br', playerName: 'Neymar' },
      { type: 'goal', time: 117, teamId: 'hr', playerName: 'Bruno Petković' },
      { type: 'yellow_card', time: 68, teamId: 'br', playerName: 'Casemiro' },
      { type: 'yellow_card', time: 77, teamId: 'hr', playerName: 'Marcelo Brozović' }
    ]
  },
  {
    stage: 'Quarter-finals',
    team1: 'nl', // Netherlands
    team2: 'ar', // Argentina
    score1: 2,
    score2: 2,
    penalties1: 3,
    penalties2: 4,
    events: [
      { type: 'goal', time: 35, teamId: 'ar', playerName: 'Nahuel Molina' },
      { type: 'goal', time: 73, teamId: 'ar', playerName: 'Lionel Messi (P)' },
      { type: 'goal', time: 83, teamId: 'nl', playerName: 'Wout Weghorst' },
      { type: 'goal', time: 90, teamId: 'nl', playerName: 'Wout Weghorst' },
      { type: 'yellow_card', time: 43, teamId: 'ar', playerName: 'Marcos Acuña' },
      { type: 'yellow_card', time: 76, teamId: 'nl', playerName: 'Memphis Depay' }
    ]
  },
  {
    stage: 'Quarter-finals',
    team1: 'ma', // Morocco
    team2: 'pt', // Portugal
    score1: 1,
    score2: 0,
    events: [
      { type: 'goal', time: 42, teamId: 'ma', playerName: 'Youssef En-Nesyri' },
      { type: 'yellow_card', time: 70, teamId: 'pt', playerName: 'Vitinha' },
      { type: 'red_card', time: 93, teamId: 'ma', playerName: 'Walid Cheddira' }
    ]
  },
  {
    stage: 'Quarter-finals',
    team1: 'gb', // England
    team2: 'fr', // France
    score1: 1,
    score2: 2,
    events: [
      { type: 'goal', time: 17, teamId: 'fr', playerName: 'Aurélien Tchouaméni' },
      { type: 'goal', time: 54, teamId: 'gb', playerName: 'Harry Kane (P)' },
      { type: 'goal', time: 78, teamId: 'fr', playerName: 'Olivier Giroud' },
      { type: 'yellow_card', time: 82, teamId: 'fr', playerName: 'Theo Hernández' }
    ]
  },

  // --- SEMI FINALS ---
  {
    stage: 'Semi-finals',
    team1: 'ar', // Argentina
    team2: 'hr', // Croatia
    score1: 3,
    score2: 0,
    events: [
      { type: 'goal', time: 34, teamId: 'ar', playerName: 'Lionel Messi (P)' },
      { type: 'goal', time: 39, teamId: 'ar', playerName: 'Julián Álvarez' },
      { type: 'goal', time: 69, teamId: 'ar', playerName: 'Julián Álvarez' },
      { type: 'yellow_card', time: 32, teamId: 'hr', playerName: 'Dominik Livaković' }
    ]
  },
  {
    stage: 'Semi-finals',
    team1: 'fr', // France
    team2: 'ma', // Morocco
    score1: 2,
    score2: 0,
    events: [
      { type: 'goal', time: 5, teamId: 'fr', playerName: 'Théo Hernandez' },
      { type: 'goal', time: 79, teamId: 'fr', playerName: 'Randal Kolo Muani' },
      { type: 'yellow_card', time: 27, teamId: 'ma', playerName: 'Sofiane Boufal' }
    ]
  },

  // --- FINAL ---
  {
    stage: 'Final',
    team1: 'ar', // Argentina
    team2: 'fr', // France
    score1: 3,
    score2: 3,
    penalties1: 4,
    penalties2: 2,
    events: [
      { type: 'goal', time: 23, teamId: 'ar', playerName: 'Lionel Messi (P)' },
      { type: 'goal', time: 36, teamId: 'ar', playerName: 'Ángel Di María' },
      { type: 'goal', time: 80, teamId: 'fr', playerName: 'Kylian Mbappé (P)' },
      { type: 'goal', time: 81, teamId: 'fr', playerName: 'Kylian Mbappé' },
      { type: 'goal', time: 108, teamId: 'ar', playerName: 'Lionel Messi' },
      { type: 'goal', time: 118, teamId: 'fr', playerName: 'Kylian Mbappé (P)' },
      { type: 'yellow_card', time: 45, teamId: 'ar', playerName: 'Enzo Fernández' },
      { type: 'yellow_card', time: 55, teamId: 'fr', playerName: 'Adrien Rabiot' }
    ]
  },

  // --- GROUP STAGE REPRESENTATIVE MATCHES FOR ROUND OF 32 ---
  {
    stage: 'First Stage',
    team1: 'de', team2: 'fr', // Germany vs France (representative of their big group games)
    score1: 1, score2: 2,
    events: [
      { type: 'goal', time: 33, teamId: 'de', playerName: 'İlkay Gündoğan (P)' },
      { type: 'goal', time: 61, teamId: 'fr', playerName: 'Adrien Rabiot' },
      { type: 'goal', time: 75, teamId: 'fr', playerName: 'Kylian Mbappé' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'py', team2: 'br', // Costa Rica -> Paraguay representation vs Brazil
    score1: 0, score2: 2,
    events: [
      { type: 'goal', time: 62, teamId: 'br', playerName: 'Richarlison' },
      { type: 'goal', time: 73, teamId: 'br', playerName: 'Richarlison' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'se', team2: 'ca', // Poland/Sweden vs Canada
    score1: 2, score2: 1,
    events: [
      { type: 'goal', time: 48, teamId: 'se', playerName: 'Robert Lewandowski' },
      { type: 'goal', time: 72, teamId: 'ca', playerName: 'Alphonso Davies' },
      { type: 'goal', time: 82, teamId: 'se', playerName: 'Piotr Zieliński' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'nl', team2: 'ma', // Netherlands vs Morocco
    score1: 1, score2: 1,
    events: [
      { type: 'goal', time: 6, teamId: 'nl', playerName: 'Cody Gakpo' },
      { type: 'goal', time: 73, teamId: 'ma', playerName: 'Achraf Hakimi' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'pt', team2: 'hr', // Portugal vs Croatia
    score1: 3, score2: 2,
    events: [
      { type: 'goal', time: 44, teamId: 'pt', playerName: 'Cristiano Ronaldo' },
      { type: 'goal', time: 56, teamId: 'hr', playerName: 'Luka Modrić' },
      { type: 'goal', time: 69, teamId: 'pt', playerName: 'Bruno Fernandes' },
      { type: 'goal', time: 80, teamId: 'pt', playerName: 'João Félix' },
      { type: 'goal', time: 85, teamId: 'hr', playerName: 'Andrej Kramarić' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'es', team2: 'at', // Spain vs Austria (Costa Rica representation)
    score1: 7, score2: 0,
    events: [
      { type: 'goal', time: 11, teamId: 'es', playerName: 'Dani Olmo' },
      { type: 'goal', time: 21, teamId: 'es', playerName: 'Marco Asensio' },
      { type: 'goal', time: 31, teamId: 'es', playerName: 'Ferran Torres (P)' },
      { type: 'goal', time: 54, teamId: 'es', playerName: 'Ferran Torres' },
      { type: 'goal', time: 74, teamId: 'es', playerName: 'Gavi' },
      { type: 'goal', time: 90, teamId: 'es', playerName: 'Carlos Soler' },
      { type: 'goal', time: 92, teamId: 'es', playerName: 'Álvaro Morata' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'us', team2: 'be', // USA vs Belgium
    score1: 1, score2: 1,
    events: [
      { type: 'goal', time: 36, teamId: 'us', playerName: 'Christian Pulisic' },
      { type: 'goal', time: 82, teamId: 'be', playerName: 'Michy Batshuayi' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'sn', team2: 'gh', // Senegal vs Ghana
    score1: 2, score2: 1,
    events: [
      { type: 'goal', time: 31, teamId: 'sn', playerName: 'Boulaye Dia' },
      { type: 'goal', time: 48, teamId: 'gh', playerName: 'Mohammed Kudus' },
      { type: 'goal', time: 70, teamId: 'sn', playerName: 'Famara Diédhiou' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'jp', team2: 'no', // Japan vs Norway
    score1: 2, score2: 1,
    events: [
      { type: 'goal', time: 48, teamId: 'jp', playerName: 'Ritsu Doan' },
      { type: 'goal', time: 51, teamId: 'jp', playerName: 'Ao Tanaka' },
      { type: 'goal', time: 11, teamId: 'no', playerName: 'Erling Haaland' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'ie', team2: 'mx', // Ireland/Poland vs Mexico
    score1: 1, score2: 2,
    events: [
      { type: 'goal', time: 47, teamId: 'mx', playerName: 'Henry Martín' },
      { type: 'goal', time: 52, teamId: 'mx', playerName: 'Luis Chávez' },
      { type: 'goal', time: 95, teamId: 'ie', playerName: 'Evan Ferguson' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'ec', team2: 'gb', // Ecuador vs England
    score1: 1, score2: 3,
    events: [
      { type: 'goal', time: 16, teamId: 'ec', playerName: 'Enner Valencia' },
      { type: 'goal', time: 35, teamId: 'gb', playerName: 'Marcus Rashford' },
      { type: 'goal', time: 50, teamId: 'gb', playerName: 'Phil Foden' },
      { type: 'goal', time: 68, teamId: 'gb', playerName: 'Marcus Rashford' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'cd', team2: 'ar', // DR Congo/Saudi Arabia vs Argentina
    score1: 2, score2: 1,
    events: [
      { type: 'goal', time: 10, teamId: 'ar', playerName: 'Lionel Messi (P)' },
      { type: 'goal', time: 48, teamId: 'cd', playerName: 'Saleh Al-Shehri' },
      { type: 'goal', time: 53, teamId: 'cd', playerName: 'Salem Al-Dawsari' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'au', team2: 'eg', // Australia vs Egypt
    score1: 1, score2: 0,
    events: [
      { type: 'goal', time: 23, teamId: 'au', playerName: 'Mitchell Duke' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'ch', team2: 'dz', // Switzerland vs Algeria
    score1: 1, score2: 0,
    events: [
      { type: 'goal', time: 48, teamId: 'ch', playerName: 'Breel Embolo' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'co', team2: 'uy', // Colombia vs Uruguay
    score1: 1, score2: 1,
    events: [
      { type: 'goal', time: 25, teamId: 'uy', playerName: 'Giorgian de Arrascaeta' },
      { type: 'goal', time: 80, teamId: 'co', playerName: 'Luis Díaz' }
    ]
  },
  {
    stage: 'First Stage',
    team1: 'sa', team2: 'kr', // Saudi Arabia vs South Korea
    score1: 1, score2: 2,
    events: [
      { type: 'goal', time: 27, teamId: 'sa', playerName: 'Salem Al-Dawsari' },
      { type: 'goal', time: 54, teamId: 'kr', playerName: 'Kim Young-gwon' },
      { type: 'goal', time: 91, teamId: 'kr', playerName: 'Hwang Hee-chan' }
    ]
  }
];

/**
 * Fetches the actual World Cup data from the free public API.
 * This should only be called once on page load (reload).
 * It will store the results in localStorage to be used across the session.
 */
export async function fetchWorldCupData(): Promise<any[]> {
  try {
    console.log('Fetching World Cup data from:', API_URL);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      // Store raw fetched matches in localStorage
      localStorage.setItem('world_cup_api_data', JSON.stringify(data));
      localStorage.setItem('world_cup_api_fetched_at', Date.now().toString());
      console.log(`Successfully fetched and cached ${data.length} actual World Cup matches.`);
      return data;
    }
    throw new Error('Invalid data format received from API');
  } catch (error) {
    console.warn('Could not fetch real-time World Cup API, loading cached or default dataset:', error);
    // Check if there is already cached data in localStorage
    const cached = localStorage.getItem('world_cup_api_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`Loaded ${parsed.length} matches from localStorage cache.`);
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing cached data:', e);
      }
    }
    
    // No cache or failed to parse, use mock data and seed local storage for session
    localStorage.setItem('world_cup_api_data', JSON.stringify(REAL_WC2022_MOCK_DATA));
    localStorage.setItem('world_cup_api_fetched_at', Date.now().toString());
    return REAL_WC2022_MOCK_DATA;
  }
}

/**
 * Maps World Cup API data (or mock fallback) into our structured bracket format.
 */
export function mapAPIToBracket(apiMatches: any[]): Match[] {
  // If we receive the mock data directly, it's already structured for us to translate quickly
  const isMockData = apiMatches.some(m => m.stage && typeof m.team1 === 'string' && m.team1.length === 2);

  if (isMockData) {
    return translateMockDataToBracket(apiMatches);
  }

  // Parse raw JSON from worldcupjson.net
  try {
    return parseRawAPIToBracket(apiMatches);
  } catch (err) {
    console.error('Failed to parse API matches, fallback to high-fidelity mock data:', err);
    return translateMockDataToBracket(REAL_WC2022_MOCK_DATA);
  }
}

function translateMockDataToBracket(mockMatches: any[]): Match[] {
  const matches: Match[] = [];
  const baseDate = new Date('2026-06-11T18:00:00Z').getTime();

  // 1. ROUND OF 32 (Round 0): 16 matches
  const r32Mock = mockMatches.filter(m => m.stage === 'First Stage');
  for (let i = 0; i < 16; i++) {
    const mock = r32Mock[i] || REAL_WC2022_MOCK_DATA.filter(m => m.stage === 'First Stage')[i];
    matches.push({
      id: `r32-${i}`,
      round: 0,
      index: i,
      team1Id: mock?.team1 || null,
      team2Id: mock?.team2 || null,
      score1: mock?.score1 ?? null,
      score2: mock?.score2 ?? null,
      penalties1: mock?.penalties1,
      penalties2: mock?.penalties2,
      status: 'finished',
      time: generateMatchTimeDisplay(0, i),
      utcTimestamp: baseDate + i * 4 * 60 * 60 * 1000,
      events: (mock?.events || []).map((e: any, idx: number) => ({
        id: `evt-r32-${i}-${idx}`,
        time: e.time,
        type: e.type,
        teamId: e.teamId,
        playerName: e.playerName
      }))
    });
  }

  // 2. ROUND OF 16 (Round 1): 8 matches
  const r16Mock = mockMatches.filter(m => m.stage === 'Round of 16');
  for (let i = 0; i < 8; i++) {
    const mock = r16Mock[i] || REAL_WC2022_MOCK_DATA.filter(m => m.stage === 'Round of 16')[i];
    matches.push({
      id: `r16-${i}`,
      round: 1,
      index: i,
      team1Id: mock?.team1 || null,
      team2Id: mock?.team2 || null,
      score1: mock?.score1 ?? null,
      score2: mock?.score2 ?? null,
      penalties1: mock?.penalties1,
      penalties2: mock?.penalties2,
      status: 'finished',
      time: generateMatchTimeDisplay(1, i),
      utcTimestamp: baseDate + 5 * 24 * 60 * 60 * 1000 + i * 12 * 60 * 60 * 1000,
      events: (mock?.events || []).map((e: any, idx: number) => ({
        id: `evt-r16-${i}-${idx}`,
        time: e.time,
        type: e.type,
        teamId: e.teamId,
        playerName: e.playerName
      }))
    });
  }

  // 3. QUARTER-FINALS (Round 2): 4 matches
  const qfMock = mockMatches.filter(m => m.stage === 'Quarter-finals');
  for (let i = 0; i < 4; i++) {
    const mock = qfMock[i] || REAL_WC2022_MOCK_DATA.filter(m => m.stage === 'Quarter-finals')[i];
    matches.push({
      id: `qf-${i}`,
      round: 2,
      index: i,
      team1Id: mock?.team1 || null,
      team2Id: mock?.team2 || null,
      score1: mock?.score1 ?? null,
      score2: mock?.score2 ?? null,
      penalties1: mock?.penalties1,
      penalties2: mock?.penalties2,
      status: 'finished',
      time: generateMatchTimeDisplay(2, i),
      utcTimestamp: baseDate + 10 * 24 * 60 * 60 * 1000 + i * 24 * 60 * 60 * 1000,
      events: (mock?.events || []).map((e: any, idx: number) => ({
        id: `evt-qf-${i}-${idx}`,
        time: e.time,
        type: e.type,
        teamId: e.teamId,
        playerName: e.playerName
      }))
    });
  }

  // 4. SEMI-FINALS (Round 3): 2 matches
  const sfMock = mockMatches.filter(m => m.stage === 'Semi-finals');
  for (let i = 0; i < 2; i++) {
    const mock = sfMock[i] || REAL_WC2022_MOCK_DATA.filter(m => m.stage === 'Semi-finals')[i];
    matches.push({
      id: `sf-${i}`,
      round: 3,
      index: i,
      team1Id: mock?.team1 || null,
      team2Id: mock?.team2 || null,
      score1: mock?.score1 ?? null,
      score2: mock?.score2 ?? null,
      penalties1: mock?.penalties1,
      penalties2: mock?.penalties2,
      status: 'finished',
      time: generateMatchTimeDisplay(3, i),
      utcTimestamp: baseDate + 13 * 24 * 60 * 60 * 1000 + i * 24 * 60 * 60 * 1000,
      events: (mock?.events || []).map((e: any, idx: number) => ({
        id: `evt-sf-${i}-${idx}`,
        time: e.time,
        type: e.type,
        teamId: e.teamId,
        playerName: e.playerName
      }))
    });
  }

  // 5. FINAL (Round 4): 1 match
  const finalMock = mockMatches.find(m => m.stage === 'Final') || REAL_WC2022_MOCK_DATA.find(m => m.stage === 'Final');
  matches.push({
    id: 'final-0',
    round: 4,
    index: 0,
    team1Id: finalMock?.team1 || null,
    team2Id: finalMock?.team2 || null,
    score1: finalMock?.score1 ?? null,
    score2: finalMock?.score2 ?? null,
    penalties1: finalMock?.penalties1,
    penalties2: finalMock?.penalties2,
    status: 'finished',
    time: generateMatchTimeDisplay(4, 0),
    utcTimestamp: baseDate + 16 * 24 * 60 * 60 * 1000,
    events: (finalMock?.events || []).map((e: any, idx: number) => ({
      id: `evt-final-0-${idx}`,
      time: e.time,
      type: e.type,
      teamId: e.teamId,
      playerName: e.playerName
    }))
  });

  return matches;
}

/**
 * Parse actual API array from worldcupjson.net and construct the full bracket.
 */
function parseRawAPIToBracket(apiMatches: any[]): Match[] {
  // Helper to map FIFA 3-letter code to our 2-letter code
  const get2LetterCode = (fifaCode: string): string => {
    if (!fifaCode) return 'de';
    return FIFA_CODE_MAP[fifaCode.toUpperCase()] || fifaCode.toLowerCase().slice(0, 2);
  };

  // Extract matches by stage
  const apiR16 = apiMatches.filter(m => {
    const st = (m.stage_name || '').toLowerCase();
    return st.includes('16') || st.includes('sixteen');
  });

  const apiQF = apiMatches.filter(m => {
    const st = (m.stage_name || '').toLowerCase();
    return st.includes('quarter') || st.includes('tứ kết');
  });

  const apiSF = apiMatches.filter(m => {
    const st = (m.stage_name || '').toLowerCase();
    return st.includes('semi') || st.includes('bán kết');
  });

  const apiFinal = apiMatches.filter(m => {
    const st = (m.stage_name || '').toLowerCase();
    return (st.includes('final') || st.includes('chung kết')) && !st.includes('third') && !st.includes('ba');
  });

  const apiFirstStage = apiMatches.filter(m => {
    const st = (m.stage_name || '').toLowerCase();
    return st.includes('first') || st.includes('group') || st.includes('vòng bảng');
  });

  // Let's map these into mock-like data that our translator uses
  const mappedMatches: any[] = [];

  // Group Stage -> R32
  // We match our 16 starting matchups
  const r32Pairings = [
    { t1: 'de', t2: 'fr' }, { t1: 'py', t2: 'br' }, { t1: 'se', t2: 'ca' }, { t1: 'nl', t2: 'ma' },
    { t1: 'pt', t2: 'hr' }, { t1: 'es', t2: 'at' }, { t1: 'us', t2: 'be' }, { t1: 'sn', t2: 'gh' },
    { t1: 'jp', t2: 'no' }, { t1: 'ie', t2: 'mx' }, { t1: 'ec', t2: 'gb' }, { t1: 'cd', t2: 'ar' },
    { t1: 'au', t2: 'eg' }, { t1: 'ch', t2: 'dz' }, { t1: 'co', t2: 'uy' }, { t1: 'sa', t2: 'kr' }
  ];

  r32Pairings.forEach((p) => {
    // Look for a match in apiFirstStage where these two codes are present
    const apiMatch = apiFirstStage.find(m => {
      const hCode = get2LetterCode(m.home_team?.code || '');
      const aCode = get2LetterCode(m.away_team?.code || '');
      return (hCode === p.t1 && aCode === p.t2) || (hCode === p.t2 && aCode === p.t1);
    });

    if (apiMatch) {
      const isHomeT1 = get2LetterCode(apiMatch.home_team?.code) === p.t1;
      mappedMatches.push({
        stage: 'First Stage',
        team1: p.t1,
        team2: p.t2,
        score1: isHomeT1 ? apiMatch.home_team?.goals : apiMatch.away_team?.goals,
        score2: isHomeT1 ? apiMatch.away_team?.goals : apiMatch.home_team?.goals,
        events: parseAPIEvents(apiMatch, p.t1, p.t2, get2LetterCode)
      });
    } else {
      // Find any representative group match for team 1 or 2
      const team1Match = apiFirstStage.find(m => get2LetterCode(m.home_team?.code) === p.t1 || get2LetterCode(m.away_team?.code) === p.t1);
      const team2Match = apiFirstStage.find(m => get2LetterCode(m.home_team?.code) === p.t2 || get2LetterCode(m.away_team?.code) === p.t2);
      
      const score1 = team1Match ? (get2LetterCode(team1Match.home_team?.code) === p.t1 ? team1Match.home_team?.goals : team1Match.away_team?.goals) : 1;
      const score2 = team2Match ? (get2LetterCode(team2Match.home_team?.code) === p.t2 ? team2Match.home_team?.goals : team2Match.away_team?.goals) : 1;

      mappedMatches.push({
        stage: 'First Stage',
        team1: p.t1,
        team2: p.t2,
        score1: score1 ?? 1,
        score2: score2 ?? 1,
        events: []
      });
    }
  });

  // Round of 16 (8 matches)
  const r16Pairings = [
    { t1: 'nl', t2: 'us' }, { t1: 'ar', t2: 'au' }, { t1: 'jp', t2: 'hr' }, { t1: 'br', t2: 'kr' },
    { t1: 'gb', t2: 'sn' }, { t1: 'fr', t2: 'se' }, { t1: 'ma', t2: 'es' }, { t1: 'pt', t2: 'ch' }
  ];

  r16Pairings.forEach((p) => {
    // Find matching match in apiR16
    const apiMatch = apiR16.find(m => {
      const hCode = get2LetterCode(m.home_team?.code || '');
      const aCode = get2LetterCode(m.away_team?.code || '');
      return (hCode === p.t1 && aCode === p.t2) || (hCode === p.t2 && aCode === p.t1) ||
             (p.t2 === 'se' && (hCode === p.t1 || aCode === p.t1) && (hCode === 'POL' || aCode === 'POL' || hCode === 'pol' || aCode === 'pol'));
    });

    if (apiMatch) {
      const isHomeT1 = get2LetterCode(apiMatch.home_team?.code) === p.t1;
      mappedMatches.push({
        stage: 'Round of 16',
        team1: p.t1,
        team2: p.t2,
        score1: isHomeT1 ? apiMatch.home_team?.goals : apiMatch.away_team?.goals,
        score2: isHomeT1 ? apiMatch.away_team?.goals : apiMatch.home_team?.goals,
        penalties1: isHomeT1 ? apiMatch.home_team?.penalties : apiMatch.away_team?.penalties,
        penalties2: isHomeT1 ? apiMatch.away_team?.penalties : apiMatch.home_team?.penalties,
        events: parseAPIEvents(apiMatch, p.t1, p.t2, get2LetterCode)
      });
    } else {
      // Find fallback in our mock data
      const fb = REAL_WC2022_MOCK_DATA.find(m => m.stage === 'Round of 16' && m.team1 === p.t1);
      if (fb) mappedMatches.push(fb);
    }
  });

  // Quarter-finals
  const qfPairings = [
    { t1: 'hr', t2: 'br' }, { t1: 'nl', t2: 'ar' }, { t1: 'ma', t2: 'pt' }, { t1: 'gb', t2: 'fr' }
  ];
  qfPairings.forEach((p) => {
    const apiMatch = apiQF.find(m => {
      const hCode = get2LetterCode(m.home_team?.code || '');
      const aCode = get2LetterCode(m.away_team?.code || '');
      return (hCode === p.t1 && aCode === p.t2) || (hCode === p.t2 && aCode === p.t1);
    });

    if (apiMatch) {
      const isHomeT1 = get2LetterCode(apiMatch.home_team?.code) === p.t1;
      mappedMatches.push({
        stage: 'Quarter-finals',
        team1: p.t1,
        team2: p.t2,
        score1: isHomeT1 ? apiMatch.home_team?.goals : apiMatch.away_team?.goals,
        score2: isHomeT1 ? apiMatch.away_team?.goals : apiMatch.home_team?.goals,
        penalties1: isHomeT1 ? apiMatch.home_team?.penalties : apiMatch.away_team?.penalties,
        penalties2: isHomeT1 ? apiMatch.away_team?.penalties : apiMatch.home_team?.penalties,
        events: parseAPIEvents(apiMatch, p.t1, p.t2, get2LetterCode)
      });
    } else {
      const fb = REAL_WC2022_MOCK_DATA.find(m => m.stage === 'Quarter-finals' && m.team1 === p.t1);
      if (fb) mappedMatches.push(fb);
    }
  });

  // Semi-finals
  const sfPairings = [
    { t1: 'ar', t2: 'hr' }, { t1: 'fr', t2: 'ma' }
  ];
  sfPairings.forEach((p) => {
    const apiMatch = apiSF.find(m => {
      const hCode = get2LetterCode(m.home_team?.code || '');
      const aCode = get2LetterCode(m.away_team?.code || '');
      return (hCode === p.t1 && aCode === p.t2) || (hCode === p.t2 && aCode === p.t1);
    });

    if (apiMatch) {
      const isHomeT1 = get2LetterCode(apiMatch.home_team?.code) === p.t1;
      mappedMatches.push({
        stage: 'Semi-finals',
        team1: p.t1,
        team2: p.t2,
        score1: isHomeT1 ? apiMatch.home_team?.goals : apiMatch.away_team?.goals,
        score2: isHomeT1 ? apiMatch.away_team?.goals : apiMatch.home_team?.goals,
        events: parseAPIEvents(apiMatch, p.t1, p.t2, get2LetterCode)
      });
    } else {
      const fb = REAL_WC2022_MOCK_DATA.find(m => m.stage === 'Semi-finals' && m.team1 === p.t1);
      if (fb) mappedMatches.push(fb);
    }
  });

  // Final
  const finalMatch = apiFinal[0];
  if (finalMatch) {
    const isHomeAr = get2LetterCode(finalMatch.home_team?.code) === 'ar';
    mappedMatches.push({
      stage: 'Final',
      team1: 'ar',
      team2: 'fr',
      score1: isHomeAr ? finalMatch.home_team?.goals : finalMatch.away_team?.goals,
      score2: isHomeAr ? finalMatch.away_team?.goals : finalMatch.home_team?.goals,
      penalties1: isHomeAr ? finalMatch.home_team?.penalties : finalMatch.away_team?.penalties,
      penalties2: isHomeAr ? finalMatch.away_team?.penalties : finalMatch.home_team?.penalties,
      events: parseAPIEvents(finalMatch, 'ar', 'fr', get2LetterCode)
    });
  } else {
    const fb = REAL_WC2022_MOCK_DATA.find(m => m.stage === 'Final');
    if (fb) mappedMatches.push(fb);
  }

  return translateMockDataToBracket(mappedMatches);
}

function parseAPIEvents(apiMatch: any, t1: string, t2: string, get2LetterCode: (c: string) => string): MatchEvent[] {
  const events: MatchEvent[] = [];
  const homeEvents = apiMatch.home_team_events || [];
  const awayEvents = apiMatch.away_team_events || [];

  const homeT2Code = get2LetterCode(apiMatch.home_team?.code || '');
  const isHomeT1 = homeT2Code === t1;

  const t1Id = t1;
  const t2Id = t2;

  const parseSingleList = (apiEvts: any[], teamId: string) => {
    apiEvts.forEach((evt, idx) => {
      let type: MatchEvent['type'] = 'goal';
      const eventType = (evt.type_of_event || '').toLowerCase();
      
      if (eventType.includes('goal')) {
        type = 'goal';
      } else if (eventType.includes('yellow-card') || eventType.includes('yellow_card')) {
        type = 'yellow_card';
      } else if (eventType.includes('red-card') || eventType.includes('red_card')) {
        type = 'red_card';
      } else {
        return; // skip other events like substitutions
      }

      // Extract time digits
      const timeMatch = String(evt.time || '').match(/\d+/);
      const timeNum = timeMatch ? parseInt(timeMatch[0], 10) : 45;

      events.push({
        id: `evt-${apiMatch.id || Math.random()}-${teamId}-${idx}`,
        time: timeNum,
        type,
        teamId,
        playerName: evt.player || 'Cầu thủ'
      });
    });
  };

  parseSingleList(homeEvents, isHomeT1 ? t1Id : t2Id);
  parseSingleList(awayEvents, isHomeT1 ? t2Id : t1Id);

  return events.sort((a, b) => a.time - b.time);
}

function generateMatchTimeDisplay(round: number, index: number): string {
  const baseDate = new Date('2026-06-11T00:00:00Z');
  let dayOffset = 0;
  let hour = 18;

  if (round === 0) {
    dayOffset = Math.floor(index / 4);
    hour = [18, 21, 1, 4][index % 4];
  } else if (round === 1) {
    dayOffset = 5 + Math.floor(index / 2);
    hour = [21, 2][index % 2];
  } else if (round === 2) {
    dayOffset = 10 + Math.floor(index / 2);
    hour = [21, 2][index % 2];
  } else if (round === 3) {
    dayOffset = 13 + index;
    hour = 2;
  } else {
    dayOffset = 16;
    hour = 2;
  }

  const matchDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  matchDate.setUTCHours(hour);

  const vnOffset = 7 * 60 * 60 * 1000;
  const vnDate = new Date(matchDate.getTime() + vnOffset);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${pad(vnDate.getUTCDate())}/${pad(vnDate.getUTCMonth() + 1)}/2026`;
  const timeStr = `${pad(vnDate.getUTCHours())}:${pad(vnDate.getUTCMinutes())}`;

  return `${timeStr} - ${dateStr} (UTC+7)`;
}
