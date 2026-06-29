export interface Team {
  id: string;
  name: string;
  englishName: string;
  code: string; // ISO 2-letter code for FlagCDN
  group: string;
  rank: number;
  starPlayer: string;
  coach: string;
  bestFinish: string;
  stats: {
    goalsScored: number;
    goalsConceded: number;
    yellowCards: number;
    redCards: number;
    shots: number;
    possession: number; // Average percentage
  };
}

export interface MatchEvent {
  id: string;
  time: number; // Minute of the match
  type: 'goal' | 'yellow_card' | 'red_card' | 'penalty_shootout';
  teamId: string;
  playerName: string;
  detail?: string;
}

export interface Match {
  id: string;
  round: number; // -1: Group, 0: R32, 1: R16, 2: QF, 3: SF, 4: Final
  index: number; // Index in that round
  team1Id: string | null;
  team2Id: string | null;
  team1Name?: string;
  team2Name?: string;
  team1Code?: string | null;
  team2Code?: string | null;
  score1: number | null;
  score2: number | null;
  penalties1?: number;
  penalties2?: number;
  status: 'scheduled' | 'live' | 'finished';
  time: string; // Vietnamese time formatted, e.g., "02:00 - 18/06/2026"
  utcTimestamp: number; // Timestamp for scheduling
  liveMinute?: number;
  venue?: { stadium: string; city: string };
  group?: string;
  events: MatchEvent[];
}

export interface LiveNotification {
  id: string;
  matchId: string;
  team1Name: string;
  team2Name: string;
  team1Code: string;
  team2Code: string;
  type: 'goal' | 'start' | 'end' | 'card';
  title: string;
  description: string;
  time: string; // Local clock time of notification
  read: boolean;
}

export interface TournamentStats {
  totalGoals: number;
  topScorers: { name: string; team: string; teamCode: string; goals: number }[];
  yellowCards: number;
  redCards: number;
}
