import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CircularBracket } from "./components/CircularBracket";
import { LiveTicker } from "./components/LiveTicker";
import { StatsPanel } from "./components/StatsPanel";
import { ScheduleView } from "./components/ScheduleView";
import { Team, Match } from "./types";
import { INITIAL_TEAMS, getBracketTeams } from "./data";
import { Trophy, HelpCircle, AlertCircle, Info } from "lucide-react";
import {
  fetchWorldCupSchedule,
  mapScheduleToKnockoutMatches,
  mapScheduleToBracketMatches,
  buildOuterRingTeams,
  type Wc2026ScheduleCache,
} from "./utils/worldcup2026Api";

export default function App() {
  const [activeTab, setActiveTab] = useState<"bracket" | "schedule">("bracket");
  const [teams] = useState<Team[]>(INITIAL_TEAMS);

  const [scheduleData, setScheduleData] = useState<Wc2026ScheduleCache | null>(null);
  const [isFetchingFixtures, setIsFetchingFixtures] = useState(false);
  const [fixturesError, setFixturesError] = useState<string | null>(null);

  const [hoveredTeam, setHoveredTeam] = useState<Team | null>(null);
  const [hoveredMatch, setHoveredMatch] = useState<Match | null>(null);

  const [systemTime, setSystemTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTimeStr = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const utc = systemTime.getTime() + systemTime.getTimezoneOffset() * 60000;
    const utc7 = new Date(utc + 3600000 * 7);
    return `${pad(utc7.getHours())}:${pad(utc7.getMinutes())}:${pad(utc7.getSeconds())}`;
  }, [systemTime]);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      setIsFetchingFixtures(true);
      try {
        const data = await fetchWorldCupSchedule();
        if (isMounted) {
          setScheduleData(data);
          setFixturesError(null);
        }
      } catch (err) {
        console.error("Failed to load World Cup schedule:", err);
        if (isMounted) {
          setFixturesError(
            err instanceof Error ? err.message : "Không thể tải lịch thi đấu WC 2026",
          );
        }
      } finally {
        if (isMounted) setIsFetchingFixtures(false);
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, []);

  const bracketMatches = useMemo(() => {
    if (!scheduleData) return [];
    return mapScheduleToBracketMatches(scheduleData, teams);
  }, [scheduleData, teams]);

  const scheduleMatches = useMemo(() => {
    if (!scheduleData) return [];
    return mapScheduleToKnockoutMatches(scheduleData, teams);
  }, [scheduleData, teams]);

  const outerRingTeams = useMemo(() => {
    const r32 = bracketMatches.filter((m) => m.round === 0);
    if (r32.length > 0) return buildOuterRingTeams(r32, teams);
    return getBracketTeams();
  }, [bracketMatches, teams]);

  const teamsWithLiveStats = useMemo(() => {
    const teamMap = new Map<string, Team>();
    teams.forEach((t) => {
      teamMap.set(t.id, {
        ...t,
        stats: {
          goalsScored: 0,
          goalsConceded: 0,
          yellowCards: 0,
          redCards: 0,
          shots: 0,
          possession: t.stats.possession,
        },
      });
    });

    bracketMatches.forEach((m) => {
      const t1 = teamMap.get(m.team1Id || "");
      const t2 = teamMap.get(m.team2Id || "");

      if (m.score1 !== null && m.score2 !== null) {
        if (t1) {
          t1.stats.goalsScored += m.score1;
          t1.stats.goalsConceded += m.score2;
        }
        if (t2) {
          t2.stats.goalsScored += m.score2;
          t2.stats.goalsConceded += m.score1;
        }
      }

      m.events.forEach((evt) => {
        const t = teamMap.get(evt.teamId);
        if (t) {
          if (evt.type === "yellow_card") t.stats.yellowCards++;
          if (evt.type === "red_card") t.stats.redCards++;
        }
      });
    });

    return Array.from(teamMap.values());
  }, [teams, bracketMatches]);

  const tournamentStats = useMemo(() => {
    let totalGoals = 0;
    let yellowCards = 0;
    let redCards = 0;
    const scorerMap: Record<
      string,
      { name: string; team: string; teamCode: string; goals: number }
    > = {};

    bracketMatches.forEach((m) => {
      m.events.forEach((evt) => {
        if (evt.type === "goal") {
          totalGoals++;
          const playerKey = `${evt.playerName}-${evt.teamId}`;
          const team = teams.find((t) => t.id === evt.teamId);
          if (team) {
            if (!scorerMap[playerKey]) {
              scorerMap[playerKey] = {
                name: evt.playerName,
                team: team.name,
                teamCode: team.code,
                goals: 0,
              };
            }
            scorerMap[playerKey].goals++;
          }
        } else if (evt.type === "yellow_card") {
          yellowCards++;
        } else if (evt.type === "red_card") {
          redCards++;
        }
      });
    });

    return {
      totalGoals,
      topScorers: Object.values(scorerMap).sort((a, b) => b.goals - a.goals),
      yellowCards,
      redCards,
    };
  }, [bracketMatches, teams]);

  const getRoundName = (round: number) => {
    switch (round) {
      case 0:
        return "Vòng 32 Đội";
      case 1:
        return "Vòng 16 Đội";
      case 2:
        return "Vòng Tứ Kết";
      case 3:
        return "Vòng Bán Kết";
      case 4:
        return "Trận Chung Kết";
      default:
        return "World Cup";
    }
  };

  const currentRoundLabel = useMemo(() => {
    if (!bracketMatches.length) return isFetchingFixtures ? "Đang tải…" : "Chờ dữ liệu";
    const live = bracketMatches.filter((m) => m.status === "live");
    if (live.length > 0) return getRoundName(live[0].round);
    const upcoming = bracketMatches
      .filter((m) => m.status === "scheduled")
      .sort((a, b) => a.utcTimestamp - b.utcTimestamp);
    if (upcoming.length > 0) return getRoundName(upcoming[0].round);
    return "Kết thúc";
  }, [bracketMatches, isFetchingFixtures]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      <header className="border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-md sticky top-0 z-40 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#D4AF37] rounded-full flex items-center justify-center font-bold text-xs text-[#D4AF37]">
            2026
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] font-display text-white uppercase leading-none">
              FIFA WORLD CUP
            </h1>
            <p className="text-[10px] text-[#D4AF37]/80 font-medium tracking-wider uppercase mt-1 hidden sm:block">
              RADIAL KNOCKOUT TRACKER
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest font-medium">
          <button
            onClick={() => setActiveTab("bracket")}
            className={`cursor-pointer transition-colors pb-1 uppercase tracking-widest outline-none ${
              activeTab === "bracket"
                ? "text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold"
                : "text-neutral-400 hover:text-white"
            }`}>
            Bản Đồ Nhánh
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`cursor-pointer transition-colors pb-1 uppercase tracking-widest outline-none ${
              activeTab === "schedule"
                ? "text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold"
                : "text-neutral-400 hover:text-white"
            }`}>
            Lịch Thi Đấu
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
              Vòng hiện tại
            </span>
            <span className="text-xs font-bold text-[#D4AF37]">{currentRoundLabel}</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-[#D4AF37]/20" />
          <div className="text-right">
            <p className="text-[10px] uppercase text-[#D4AF37]/60 tracking-widest font-semibold leading-none">
              GIỜ VIỆT NAM (UTC+7)
            </p>
            <p className="text-lg font-mono text-white font-bold leading-none mt-1.5">
              {currentTimeStr}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-6 max-w-md mx-auto lg:hidden">
          <div className="flex p-1 bg-black/40 border border-[#D4AF37]/20 rounded-xl w-full">
            <button
              onClick={() => setActiveTab("bracket")}
              className={`flex-1 py-1.5 text-xs font-sans font-bold uppercase transition-all rounded-lg cursor-pointer ${
                activeTab === "bracket"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md"
                  : "text-neutral-400"
              }`}>
              Sơ đồ
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex-1 py-1.5 text-xs font-sans font-bold uppercase transition-all rounded-lg cursor-pointer ${
                activeTab === "schedule"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md"
                  : "text-neutral-400"
              }`}>
              Lịch thi đấu
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "bracket" ? (
            <motion.div
              key="bracket-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-3 flex flex-col gap-6">
                <LiveTicker matches={bracketMatches} teams={teamsWithLiveStats} />
              </div>

              <div className="lg:col-span-6 flex flex-col items-center justify-center relative bg-radial-gradient py-6 px-2 rounded-2xl border border-[#D4AF37]/10 overflow-visible">
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />

                <div className="w-full text-center mb-3 relative z-10">
                  <h2 className="text-lg font-black font-display tracking-[0.1em] text-white flex items-center justify-center gap-2">
                    SƠ ĐỒ THI ĐẤU RADIAL KNOCKOUT
                  </h2>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto mt-0.5 px-2">
                    Cập nhật tự động từ kết quả lịch thi đấu (vòng 32 trở đi). Rê chuột để xem chi tiết.
                  </p>
                </div>

                {fixturesError && !bracketMatches.length ? (
                  <div className="relative z-10 flex flex-col items-center gap-3 py-12 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-sm text-red-400">{fixturesError}</p>
                  </div>
                ) : isFetchingFixtures && !bracketMatches.length ? (
                  <div className="relative z-10 py-16 text-neutral-500 text-sm">Đang tải sơ đồ…</div>
                ) : (
                  <div className="w-full relative z-10">
                    <CircularBracket
                      teams={teamsWithLiveStats}
                      outerRingTeams={outerRingTeams}
                      matches={bracketMatches}
                      onHoverTeam={setHoveredTeam}
                      onHoverMatch={setHoveredMatch}
                      hoveredTeam={hoveredTeam}
                      hoveredMatch={hoveredMatch}
                    />
                  </div>
                )}
              </div>

              <div className="lg:col-span-3 flex flex-col gap-6">
                <StatsPanel
                  teams={teamsWithLiveStats}
                  matches={bracketMatches}
                  tournamentStats={tournamentStats}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="schedule-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}>
              <ScheduleView
                teams={teamsWithLiveStats}
                matches={scheduleMatches}
                isLoading={isFetchingFixtures}
                error={fixturesError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-8 border-t border-[#D4AF37]/20 pt-6 pb-8 text-center text-xs text-neutral-500">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              Múi giờ đồng bộ theo giờ Việt Nam (UTC+7). Dữ liệu từ worldcup26.ir.
            </span>
          </div>
          <p>© 2026 World Cup Tracker Applet.</p>
        </footer>
      </main>
    </div>
  );
}
