import { Team, Match } from './types';
import { R32_SLOT_TEAM_IDS } from './data/bracket2026';

const emptyStats = (possession = 50) => ({
  goalsScored: 0,
  goalsConceded: 0,
  yellowCards: 0,
  redCards: 0,
  shots: 0,
  possession,
});

function t(
  id: string,
  name: string,
  englishName: string,
  code: string,
  group: string,
  rank: number,
  starPlayer: string,
  coach: string,
  bestFinish: string,
  possession = 50,
): Team {
  return {
    id,
    name,
    englishName,
    code,
    group,
    rank,
    starPlayer,
    coach,
    bestFinish,
    stats: emptyStats(possession),
  };
}

/** All 48 qualified teams — groups A–L per FIFA World Cup 2026 draw */
export const INITIAL_TEAMS: Team[] = [
  // Group A
  t('mx', 'Mexico', 'Mexico', 'mx', 'A', 16, 'Santiago Giménez', 'Javier Aguirre', 'Tứ kết (1970, 1986)', 52),
  t('za', 'Nam Phi', 'South Africa', 'za', 'A', 59, 'Percy Tau', 'Hugo Broos', 'Vòng bảng (2002, 2010)', 46),
  t('kr', 'Hàn Quốc', 'South Korea', 'kr', 'A', 22, 'Son Heung-min', 'Hong Myung-bo', 'Hạng tư (2002)', 54),
  t('cz', 'Séc', 'Czech Republic', 'cz', 'A', 31, 'Patrik Schick', 'Ivan Hašek', 'Á quân (1934, 1962)', 50),
  // Group B
  t('ca', 'Canada', 'Canada', 'ca', 'B', 35, 'Alphonso Davies', 'Jesse Marsch', 'Vòng bảng (1986, 2022)', 50),
  t('ba', 'Bosnia', 'Bosnia and Herzegovina', 'ba', 'B', 62, 'Edin Džeko', 'Sergej Barbarez', 'Vòng bảng (2014)', 47),
  t('qa', 'Qatar', 'Qatar', 'qa', 'B', 40, 'Almoez Ali', 'Carlos Queiroz', 'Vòng bảng (2022)', 48),
  t('ch', 'Thụy Sĩ', 'Switzerland', 'ch', 'B', 15, 'Granit Xhaka', 'Murat Yakin', 'Tứ kết (1934, 1938, 1954)', 53),
  // Group C
  t('br', 'Brazil', 'Brazil', 'br', 'C', 5, 'Vinícius Júnior', 'Dorival Júnior', 'Vô địch (5 lần)', 60),
  t('ma', 'Ma-rốc', 'Morocco', 'ma', 'C', 14, 'Achraf Hakimi', 'Walid Regragui', 'Hạng tư (2022)', 48),
  t('ht', 'Haiti', 'Haiti', 'ht', 'C', 84, 'Duckens Nazon', 'Sébastien Migné', 'Vòng bảng (1974)', 44),
  t('gb-sct', 'Scotland', 'Scotland', 'gb-sct', 'C', 36, 'Scott McTominay', 'Steve Clarke', 'Vòng bảng (8 lần)', 49),
  // Group D
  t('us', 'Mỹ', 'USA', 'us', 'D', 18, 'Christian Pulisic', 'Mauricio Pochettino', 'Hạng ba (1930)', 53),
  t('py', 'Paraguay', 'Paraguay', 'py', 'D', 56, 'Miguel Almirón', 'Gustavo Alfaro', 'Tứ kết (2010)', 46),
  t('au', 'Úc', 'Australia', 'au', 'D', 24, 'Nestory Irankunda', 'Tony Popovic', 'Vòng 16 đội (2006, 2022)', 50),
  t('tr', 'Thổ Nhĩ Kỳ', 'Turkiye', 'tr', 'D', 38, 'Arda Güler', 'Vincenzo Montella', 'Hạng ba (2002)', 51),
  // Group E
  t('de', 'Đức', 'Germany', 'de', 'E', 11, 'Jamal Musiala', 'Julian Nagelsmann', 'Vô địch (4 lần)', 58),
  t('cw', 'Curaçao', 'Curaçao', 'cw', 'E', 88, 'Leandro Bacuna', 'Dick Advocaat', 'Lần đầu (2026)', 43),
  t('ci', 'Côte d\'Ivoire', 'Ivory Coast', 'ci', 'E', 32, 'Sébastien Haller', 'Emerse Fae', 'Vòng bảng (2006, 2010, 2014)', 49),
  t('ec', 'Ecuador', 'Ecuador', 'ec', 'E', 27, 'Piero Hincapié', 'Sebastián Beccacece', 'Vòng 16 đội (2006)', 49),
  // Group F
  t('nl', 'Hà Lan', 'Netherlands', 'nl', 'F', 7, 'Cody Gakpo', 'Ronald Koeman', 'Á quân (3 lần)', 55),
  t('jp', 'Nhật Bản', 'Japan', 'jp', 'F', 15, 'Kaoru Mitoma', 'Hajime Moriyasu', 'Vòng 16 đội (4 lần)', 54),
  t('se', 'Thụy Điển', 'Sweden', 'se', 'F', 28, 'Alexander Isak', 'Jon Dahl Tomasson', 'Á quân (1958)', 52),
  t('tn', 'Tunisia', 'Tunisia', 'tn', 'F', 41, 'Youssef Msakni', 'Samuel Zauber', 'Vòng bảng (1978, 1998, 2002, 2018)', 48),
  // Group G
  t('be', 'Bỉ', 'Belgium', 'be', 'G', 8, 'Kevin De Bruyne', 'Domenico Tedesco', 'Hạng ba (2018)', 56),
  t('eg', 'Ai Cập', 'Egypt', 'eg', 'G', 30, 'Mohamed Salah', 'Hossam Hassan', 'Vòng bảng (4 lần)', 51),
  t('ir', 'Iran', 'Iran', 'ir', 'G', 20, 'Mehdi Taremi', 'Amir Ghalenoei', 'Vòng bảng (6 lần)', 47),
  t('nz', 'New Zealand', 'New Zealand', 'nz', 'G', 93, 'Chris Wood', 'Anthony Hudson', 'Vòng bảng (1982, 2010)', 42),
  // Group H
  t('es', 'Tây Ban Nha', 'Spain', 'es', 'H', 3, 'Lamine Yamal', 'Luis de la Fuente', 'Vô địch (2010)', 62),
  t('cv', 'Cape Verde', 'Cape Verde', 'cv', 'H', 65, 'Ryan Mendes', 'Bubista', 'Lần đầu (2026)', 45),
  t('sa', 'Ả Rập Xê Út', 'Saudi Arabia', 'sa', 'H', 59, 'Salem Al-Dawsari', 'Hervé Renard', 'Vòng 16 đội (1994)', 46),
  t('uy', 'Uruguay', 'Uruguay', 'uy', 'H', 11, 'Federico Valverde', 'Marcelo Bielsa', 'Vô địch (1930, 1950)', 54),
  // Group I
  t('fr', 'Pháp', 'France', 'fr', 'I', 2, 'Kylian Mbappé', 'Didier Deschamps', 'Vô địch (1998, 2018)', 56),
  t('sn', 'Senegal', 'Senegal', 'sn', 'I', 21, 'Sadio Mané', 'Pape Thiaw', 'Tứ kết (2002)', 49),
  t('iq', 'Iraq', 'Iraq', 'iq', 'I', 55, 'Aymen Hussein', 'Jesús Casas', 'Vòng bảng (1986)', 46),
  t('no', 'Na Uy', 'Norway', 'no', 'I', 44, 'Erling Haaland', 'Ståle Solbakken', 'Vòng 16 đội (1998)', 51),
  // Group J
  t('ar', 'Argentina', 'Argentina', 'ar', 'J', 1, 'Lionel Messi', 'Lionel Scaloni', 'Vô địch (3 lần)', 61),
  t('dz', 'Algeria', 'Algeria', 'dz', 'J', 37, 'Riyad Mahrez', 'Vladimir Petković', 'Vòng 16 đội (2014)', 52),
  t('at', 'Áo', 'Austria', 'at', 'J', 22, 'David Alaba', 'Ralf Rangnick', 'Hạng ba (1954)', 51),
  t('jo', 'Jordan', 'Jordan', 'jo', 'J', 71, 'Musa Al-Taamari', 'Hussein Ammouta', 'Lần đầu (2026)', 44),
  // Group K
  t('pt', 'Bồ Đào Nha', 'Portugal', 'pt', 'K', 6, 'Cristiano Ronaldo', 'Roberto Martínez', 'Hạng ba (1966)', 57),
  t('pl', 'Ba Lan', 'Poland', 'pl', 'K', 26, 'Robert Lewandowski', 'Michał Probierz', 'Hạng ba (1974, 1982)', 50),
  t('uz', 'Uzbekistan', 'Uzbekistan', 'uz', 'K', 66, 'Eldor Shomurodov', 'Slavisa Jokanovic', 'Lần đầu (2026)', 45),
  t('co', 'Colombia', 'Colombia', 'co', 'K', 10, 'Luis Díaz', 'Néstor Lorenzo', 'Tứ kết (2014)', 54),
  // Group L
  t('gb-eng', 'Anh', 'England', 'gb-eng', 'L', 4, 'Jude Bellingham', 'Thomas Tuchel', 'Vô địch (1966)', 59),
  t('hr', 'Croatia', 'Croatia', 'hr', 'L', 12, 'Luka Modrić', 'Zlatko Dalić', 'Á quân (2018)', 53),
  t('gh', 'Ghana', 'Ghana', 'gh', 'L', 64, 'Mohammed Kudus', 'Otto Addo', 'Tứ kết (2010)', 48),
  t('pa', 'Panama', 'Panama', 'pa', 'L', 48, 'José Fajardo', 'Thomas Christiansen', 'Vòng bảng (2018)', 45),
];

const teamById = new Map(INITIAL_TEAMS.map((team) => [team.id, team]));

/** 32 teams in FIFA R32 outer-ring order (for bracket visualization) */
export function getBracketTeams(): Team[] {
  return R32_SLOT_TEAM_IDS.map((id) => {
    const team = teamById.get(id);
    if (!team) throw new Error(`Bracket team not found: ${id}`);
    return team;
  });
}

// Generate match times starting from June 11, 2026
export function generateMatchTime(round: number, index: number): string {
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

export function generateInitialMatches(): Match[] {
  const matches: Match[] = [];
  const bracketTeams = getBracketTeams();

  for (let i = 0; i < 16; i++) {
    const t1 = bracketTeams[2 * i];
    const t2 = bracketTeams[2 * i + 1];
    matches.push({
      id: `r32-${i}`,
      round: 0,
      index: i,
      team1Id: t1.id,
      team2Id: t2.id,
      score1: null,
      score2: null,
      status: 'scheduled',
      time: generateMatchTime(0, i),
      utcTimestamp: new Date('2026-06-28T12:00:00Z').getTime() + i * 4 * 60 * 60 * 1000,
      events: [],
    });
  }

  for (let i = 0; i < 8; i++) {
    matches.push({
      id: `r16-${i}`,
      round: 1,
      index: i,
      team1Id: null,
      team2Id: null,
      score1: null,
      score2: null,
      status: 'scheduled',
      time: generateMatchTime(1, i),
      utcTimestamp: new Date('2026-07-04T21:00:00Z').getTime() + i * 12 * 60 * 60 * 1000,
      events: [],
    });
  }

  for (let i = 0; i < 4; i++) {
    matches.push({
      id: `qf-${i}`,
      round: 2,
      index: i,
      team1Id: null,
      team2Id: null,
      score1: null,
      score2: null,
      status: 'scheduled',
      time: generateMatchTime(2, i),
      utcTimestamp: new Date('2026-07-09T21:00:00Z').getTime() + i * 24 * 60 * 60 * 1000,
      events: [],
    });
  }

  for (let i = 0; i < 2; i++) {
    matches.push({
      id: `sf-${i}`,
      round: 3,
      index: i,
      team1Id: null,
      team2Id: null,
      score1: null,
      score2: null,
      status: 'scheduled',
      time: generateMatchTime(3, i),
      utcTimestamp: new Date('2026-07-14T02:00:00Z').getTime() + i * 24 * 60 * 60 * 1000,
      events: [],
    });
  }

  matches.push({
    id: 'final-0',
    round: 4,
    index: 0,
    team1Id: null,
    team2Id: null,
    score1: null,
    score2: null,
    status: 'scheduled',
    time: generateMatchTime(4, 0),
    utcTimestamp: new Date('2026-07-19T02:00:00Z').getTime(),
    events: [],
  });

  return matches;
}

export const SAMPLE_SCORERS_BY_TEAM: Record<string, string[]> = {
  de: ['Jamal Musiala', 'Kai Havertz', 'Niclas Füllkrug', 'Florian Wirtz'],
  fr: ['Kylian Mbappé', 'Antoine Griezmann', 'Olivier Giroud', 'Ousmane Dembélé'],
  br: ['Vinícius Júnior', 'Rodrygo', 'Raphinha'],
  ar: ['Lionel Messi', 'Lautaro Martínez', 'Julián Álvarez', 'Alexis Mac Allister'],
  'gb-eng': ['Harry Kane', 'Bukayo Saka', 'Phil Foden', 'Jude Bellingham'],
  es: ['Lamine Yamal', 'Álvaro Morata', 'Nico Williams', 'Dani Olmo'],
  pt: ['Cristiano Ronaldo', 'Bruno Fernandes', 'Rafael Leão'],
  nl: ['Cody Gakpo', 'Memphis Depay', 'Xavi Simons'],
  hr: ['Luka Modrić', 'Andre Kramarić', 'Ivan Perišić'],
  be: ['Kevin De Bruyne', 'Romelu Lukaku', 'Leandro Trossard'],
  jp: ['Kaoru Mitoma', 'Takefusa Kubo', 'Takumi Minamino'],
  kr: ['Son Heung-min', 'Hwang Hee-chan', 'Lee Kang-in'],
  ma: ['Achraf Hakimi', 'Youssef En-Nesyri', 'Hakim Ziyech'],
  sn: ['Sadio Mané', 'Nicolas Jackson', 'Ismaïla Sarr'],
  gh: ['Mohammed Kudus', 'Inaki Williams', 'Jordan Ayew'],
  us: ['Christian Pulisic', 'Folarin Balogun', 'Timothy Weah'],
  mx: ['Santiago Giménez', 'Henry Martín', 'Luis Chávez'],
  ca: ['Alphonso Davies', 'Jonathan David', 'Cyle Larin'],
  ec: ['Enner Valencia', 'Moises Caicedo', 'Kendry Páez'],
  no: ['Erling Haaland', 'Martin Ødegaard', 'Alexander Sørloth'],
  ch: ['Granit Xhaka', 'Xherdan Shaqiri', 'Breel Embolo'],
  co: ['Luis Díaz', 'James Rodríguez', 'Jhon Durán'],
  eg: ['Mohamed Salah', 'Mostafa Mohamed', 'Trézéguet'],
  uy: ['Federico Valverde', 'Darwin Núñez', 'Luis Suárez'],
  at: ['David Alaba', 'Marcel Sabitzer', 'Christoph Baumgartner'],
  se: ['Alexander Isak', 'Viktor Gyökeres', 'Dejan Kulusevski'],
  py: ['Miguel Almirón', 'Antonio Sanabria', 'Gustavo Gómez'],
  au: ['Nestory Irankunda', 'Mathew Ryan', 'Jackson Irvine'],
  dz: ['Riyad Mahrez', 'Saïd Benrahma', 'Amine Gouiri'],
  sa: ['Salem Al-Dawsari', 'Firas Al-Buraikan', 'Saleh Al-Shehri'],
  tr: ['Arda Güler', 'Hakan Çalhanoğlu', 'Kenan Yıldız'],
  ci: ['Sébastien Haller', 'Franck Kessié', 'Nicolas Pépé'],
  ir: ['Mehdi Taremi', 'Sardar Azmoun', 'Alireza Jahanbakhsh'],
  pl: ['Robert Lewandowski', 'Piotr Zieliński', 'Kamil Glik'],
};

export const DEFAULT_SCORERS = [
  'Gabriel Martinelli',
  'Julian Brandt',
  'Mateo Kovačić',
  'Alexis Sanchez',
  'Alphonso Davies',
];
