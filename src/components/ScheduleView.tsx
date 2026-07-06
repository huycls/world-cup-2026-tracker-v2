import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Team, Match, MatchEvent } from "../types";
import {
  Trophy,
  Clock,
  MapPin,
  User,
  ArrowRight,
  Activity,
  RefreshCw,
  AlertCircle,
  Zap,
} from "lucide-react";
import { getMatchVenue, getTeamLineup } from "../utils/matchHelpers";

interface ScheduleViewProps {
  teams: Team[];
  matches: Match[];
  isLoading?: boolean;
  error?: string | null;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  teams,
  matches,
  isLoading = false,
  error = null,
}) => {
  const [selectedRound, setSelectedRound] = useState<number | "all">("all");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const findTeam = (id: string | null) => {
    if (!id) return null;
    return teams.find((t) => t.id === id) || null;
  };

  const getRoundName = (round: number) => {
    switch (round) {
      case -1:
        return "Vòng Bảng";
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
      case 5:
        return "Tranh Hạng Ba";
      default:
        return "World Cup";
    }
  };

  const getTeamDisplay = (match: Match, slot: 1 | 2) => {
    const id = slot === 1 ? match.team1Id : match.team2Id;
    const name = slot === 1 ? match.team1Name : match.team2Name;
    const code = slot === 1 ? match.team1Code : match.team2Code;
    const team = findTeam(id);
    return {
      team,
      name: team?.name ?? name ?? null,
      code: team?.code ?? code ?? null,
    };
  };

  const getVenue = (match: Match) =>
    match.venue ?? getMatchVenue(match.round, match.index);

  const getEventLabel = (evt: MatchEvent) => {
    switch (evt.type) {
      case "goal":
        return "Bàn thắng";
      case "yellow_card":
        return "Thẻ vàng";
      case "red_card":
        return "Thẻ đỏ";
      case "penalty_shootout":
        return "Luân lưu";
      default:
        return "Sự kiện";
    }
  };

  const getEventIcon = (evt: MatchEvent) => {
    switch (evt.type) {
      case "goal":
        return "⚽";
      case "yellow_card":
        return "🟨";
      case "red_card":
        return "🟥";
      default:
        return "•";
    }
  };

  const renderMatchEvents = (
    match: Match,
    compact = false,
  ): React.ReactNode => {
    if (
      match.events.length === 0 ||
      (match.status !== "finished" && match.status !== "live")
    ) {
      return null;
    }

    return (
      <div
        className={
          compact
            ? "mt-2 pt-2 border-t border-neutral-900/60 space-y-1"
            : "space-y-1.5"
        }>
        {match.events.map((evt) => {
          const evtTeam = findTeam(evt.teamId);
          return (
            <div
              key={evt.id}
              className={`flex items-center gap-2 text-[11px] ${
                compact
                  ? "text-neutral-400"
                  : "p-2 rounded-lg bg-black/40 border border-neutral-800/50"
              }`}>
              <span className="font-mono text-[#D4AF37] font-bold shrink-0 w-8">
                {evt.time}'
              </span>
              {evtTeam?.code && (
                <img
                  src={`https://flagcdn.com/w80/${evtTeam.code}.png`}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-4 h-3 rounded-sm object-cover border border-neutral-800 shrink-0"
                />
              )}
              <span className="shrink-0">{getEventIcon(evt)}</span>
              <span
                className={`truncate ${compact ? "text-neutral-300" : "font-semibold text-white"}`}>
                {evt.playerName}
              </span>
              {!compact && (
                <span className="text-neutral-500 text-[10px] ml-auto shrink-0">
                  {evt.detail ?? getEventLabel(evt)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Filtered matches
  const filteredMatches = useMemo(() => {
    let list = [...matches];
    if (selectedRound !== "all") {
      list = list.filter((m) => m.round === selectedRound);
    }
    // Chronological order — real schedule from API
    return list.sort((a, b) => a.utcTimestamp - b.utcTimestamp);
  }, [matches, selectedRound]);

  // Set default selected match if not set
  useMemo(() => {
    if (filteredMatches.length > 0) {
      // If current selected match is not in filtered list, pick the first one
      const exists = filteredMatches.some((m) => m.id === selectedMatchId);
      if (!exists) {
        setSelectedMatchId(filteredMatches[0].id);
      }
    } else {
      setSelectedMatchId(null);
    }
  }, [filteredMatches, selectedMatchId]);

  const activeMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId) || null;
  }, [matches, selectedMatchId]);

  const team1 = useMemo(
    () => (activeMatch ? findTeam(activeMatch.team1Id) : null),
    [activeMatch, teams],
  );
  const team2 = useMemo(
    () => (activeMatch ? findTeam(activeMatch.team2Id) : null),
    [activeMatch, teams],
  );

  const venueInfo = useMemo(() => {
    if (!activeMatch) return null;
    return (
      activeMatch.venue ?? getMatchVenue(activeMatch.round, activeMatch.index)
    );
  }, [activeMatch]);

  const lineup1 = useMemo(() => (team1 ? getTeamLineup(team1) : []), [team1]);
  const lineup2 = useMemo(() => (team2 ? getTeamLineup(team2) : []), [team2]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {isLoading && matches.length === 0 ? (
        <div className="lg:col-span-12 flex flex-col items-center justify-center py-24 text-neutral-400">
          <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
          <p className="text-sm font-semibold">
            Đang tải lịch thi đấu WC 2026...
          </p>
          <p className="text-xs text-neutral-600 mt-1">Nguồn: worldcup26.ir</p>
        </div>
      ) : error && matches.length === 0 ? (
        <div className="lg:col-span-12 flex flex-col items-center justify-center py-24 text-neutral-400">
          <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
          <p className="text-sm font-semibold text-red-400">{error}</p>
          <p className="text-xs text-neutral-600 mt-1">
            Không thể tải lịch thi đấu từ API. Vui lòng thử tải lại trang.
          </p>
        </div>
      ) : (
        <>
          <div className="lg:col-span-12 flex items-center justify-between px-1 mb-1">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
              Lịch knockout · {matches.length} trận
            </p>
            <p className="text-[10px] text-[#D4AF37]/60 font-mono">
              worldcup26.ir
            </p>
          </div>
          {/* LEFT COLUMN: Match Cards List (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Filter Round Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-black/40 border border-[#D4AF37]/20 rounded-xl">
              <button
                onClick={() => setSelectedRound("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase transition-all cursor-pointer ${
                  selectedRound === "all"
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}>
                Tất Cả Trận
              </button>
              {[0, 1, 2, 3, 4].map((r) => (
                <button
                  key={`round-tab-${r}`}
                  onClick={() => setSelectedRound(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase transition-all cursor-pointer ${
                    selectedRound === r
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}>
                  {getRoundName(r).replace("Vòng ", "")}
                </button>
              ))}
            </div>

            {/* Matches List */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[640px] pr-2">
              <AnimatePresence mode="popLayout">
                {filteredMatches.map((match) => {
                  const t1Display = getTeamDisplay(match, 1);
                  const t2Display = getTeamDisplay(match, 2);
                  const isSelected = match.id === selectedMatchId;
                  const venue = getVenue(match);

                  return (
                    <motion.div
                      key={`schedule-card-${match.id}`}
                      layoutId={`schedule-card-layout-${match.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedMatchId(match.id)}
                      className={`border rounded-xl p-3.5 transition-all min-h-20 duration-300 cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? "bg-[#111] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                          : "bg-black/40 border-[#D4AF37]/10 hover:border-[#D4AF37]/35 hover:bg-neutral-900/40"
                      }`}>
                      {/* Status Indicator Bar */}
                      <div
                        className={`absolute top-0 left-0 bottom-0 w-1 ${
                          match.status === "live"
                            ? "bg-red-500 animate-pulse"
                            : match.status === "finished"
                              ? "bg-[#D4AF37]"
                              : "bg-neutral-800"
                        }`}
                      />

                      {/* Header Row */}
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 mb-2 font-mono">
                        <div className="flex items-center gap-1.5 font-sans font-bold text-[#D4AF37] tracking-wider uppercase truncate max-w-[85%] leading-none">
                          <span className="leading-none">
                            {getRoundName(match.round)}
                          </span>
                          {match.group && (
                            <span className="text-neutral-500 font-mono text-[9px] normal-case">
                              {match.group}
                            </span>
                          )}
                          {t1Display.name && t2Display.name && (
                            <span className="flex items-center gap-2 text-neutral-300 font-bold normal-case tracking-normal truncate leading-none">
                              <span className="text-neutral-500 font-mono text-xs mx-0.5 leading-none">
                                -
                              </span>
                              <span className="leading-none text-xs">
                                {t1Display.name} vs {t2Display.name}
                              </span>
                              {/* <span className="flex items-center gap-1 shrink-0 ml-1 bg-black/40 px-1 py-0.5 rounded border border-neutral-800/40">
                                {t1Display.code && (
                                  <img
                                    src={`https://flagcdn.com/w80/${t1Display.code}.png`}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-4 h-2.5 rounded-sm object-cover border border-neutral-800 shrink-0"
                                  />
                                )}
                                {t2Display.code && (
                                  <img
                                    src={`https://flagcdn.com/w80/${t2Display.code}.png`}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-4 h-2.5 rounded-sm object-cover border border-neutral-800 shrink-0"
                                  />
                                )}
                              </span> */}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs shrink-0 leading-none">
                          {match.status === "live" ? (
                            <span className="flex items-center gap-1 bg-red-600/20 text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded font-sans font-black tracking-widest animate-pulse leading-none">
                              LIVE {match.liveMinute}'
                            </span>
                          ) : match.status === "finished" ? (
                            <span className="bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded leading-none">
                              FT
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 leading-none">
                              <Clock className="w-3 h-3 text-[#D4AF37]" />{" "}
                              <span className="leading-none">{match.time}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Teams / Score Row */}
                      <div className="grid grid-cols-7 items-center my-2 py-1">
                        {/* Team 1 */}
                        <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                          {t1Display.name ? (
                            <>
                              {t1Display.code && (
                                <img
                                  src={`https://flagcdn.com/w80/${t1Display.code}.png`}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-5 rounded object-cover border border-neutral-800/80 shadow shrink-0"
                                />
                              )}
                              <span className="font-bold text-sm text-white truncate leading-none">
                                {t1Display.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-8 h-5 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 font-bold font-mono text-[9px] shrink-0">
                                ?
                              </div>
                              <span className="text-xs text-neutral-500 italic truncate leading-none">
                                Chờ xác định
                              </span>
                            </>
                          )}
                        </div>

                        {/* Score / VS */}
                        <div className="col-span-1 text-center flex items-center justify-center leading-none">
                          {match.status === "scheduled" ? (
                            <span className="text-[11px] font-mono text-[#D4AF37] font-extrabold opacity-60 leading-none">
                              VS
                            </span>
                          ) : (
                            <div className="text-base font-mono font-bold tracking-tight text-white flex items-center justify-center gap-1 leading-none">
                              <span
                                className={`leading-none ${match.score1! > match.score2! ? "text-[#D4AF37]" : ""}`}>
                                {match.score1}
                              </span>
                              <span className="opacity-40 leading-none">-</span>
                              <span
                                className={`leading-none ${match.score2! > match.score1! ? "text-[#D4AF37]" : ""}`}>
                                {match.score2}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Team 2 */}
                        <div className="col-span-3 flex items-center justify-end gap-2.5 min-w-0 text-right">
                          {t2Display.name ? (
                            <>
                              <span className="font-bold text-sm text-white truncate leading-none">
                                {t2Display.name}
                              </span>
                              {t2Display.code && (
                                <img
                                  src={`https://flagcdn.com/w80/${t2Display.code}.png`}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-5 rounded object-cover border border-neutral-800/80 shadow shrink-0"
                                />
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-neutral-500 italic truncate leading-none">
                                Chờ xác định
                              </span>
                              <div className="w-8 h-5 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 font-bold font-mono text-[9px] shrink-0">
                                ?
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {renderMatchEvents(match, true)}

                      {/* Footer Row */}
                      <div className="flex justify-between items-center text-[10px] text-neutral-500 border-t border-neutral-900/60 pt-2 mt-2">
                        <span className="flex items-center gap-1 truncate max-w-[80%]">
                          <MapPin className="w-3 h-3 text-[#D4AF37]/60" />{" "}
                          {venue.stadium} ({venue.city})
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-[#D4AF37]/50 group-hover:text-[#D4AF37] transition-colors font-bold flex items-center gap-0.5 shrink-0">
                          Chi tiết <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COLUMN: Detail Info, Lineups, Venue Spec (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {activeMatch ? (
                <motion.div
                  key={`match-details-panel-${activeMatch.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#111] border border-[#D4AF37]/30 rounded-xl p-5 flex flex-col h-full shadow-2xl relative overflow-hidden">
                  {/* Top ambient glow */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />

                  {/* Title Header */}
                  <div className="text-center pb-4 border-b border-[#D4AF37]/20 relative z-10 mb-4">
                    <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest uppercase block mb-1">
                      {getRoundName(activeMatch.round)}
                    </span>
                    <h3 className="text-lg font-bold text-white font-display">
                      CHI TIẾT TRẬN ĐẤU
                    </h3>
                  </div>

                  {/* Venue details */}
                  {venueInfo && (
                    <div className="bg-black/60 border border-[#D4AF37]/10 rounded-xl p-3 mb-4 flex items-start gap-3 relative z-10">
                      <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                          ĐỊA ĐIỂM THI ĐẤU
                        </h4>
                        <p className="text-sm font-sans font-extrabold text-[#D4AF37] mt-1">
                          {venueInfo.stadium}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {venueInfo.city}
                        </p>
                        <div className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono mt-1.5 flex gap-3">
                          <span>Sức chứa: ~80,000</span>
                          <span>•</span>
                          <span>Mặt sân: Cỏ tự nhiên</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Match events (goals, cards) */}
                  {(activeMatch.status === "finished" ||
                    activeMatch.status === "live") && (
                    <div className="bg-black/60 border border-[#D4AF37]/10 rounded-xl p-3 mb-4 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider">
                          <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                          Diễn biến trận đấu
                        </div>
                        {activeMatch.status === "finished" && (
                          <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                            {activeMatch.score1} - {activeMatch.score2} FT
                          </span>
                        )}
                        {activeMatch.status === "live" && (
                          <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded animate-pulse">
                            LIVE {activeMatch.liveMinute}'
                          </span>
                        )}
                      </div>
                      {activeMatch.events.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                          {renderMatchEvents(activeMatch)}
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-500 italic">
                          Chưa có dữ liệu diễn biến từ API.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Starting Lineups (Đội hình ra sân) */}
                  <div className="flex-1 flex flex-col min-h-[300px] overflow-hidden relative z-10">
                    <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider border-b border-[#D4AF37]/15 pb-2 mb-3">
                      <Activity className="w-3.5 h-3.5 text-[#D4AF37]" /> Đội
                      Hình Ra Sân (Starting Lineup)
                    </div>

                    {team1 || team2 ? (
                      <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-4">
                        {/* Team 1 Lineup */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2.5 pb-1 border-b border-neutral-900">
                            {team1 ? (
                              <>
                                <img
                                  src={`https://flagcdn.com/w80/${team1.code}.png`}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-5 h-3.5 rounded object-cover"
                                />
                                <span className="font-black text-xs text-[#D4AF37] truncate">
                                  {team1.name}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-neutral-500 italic">
                                Chờ xác định
                              </span>
                            )}
                          </div>

                          {team1 ? (
                            <div className="space-y-1.5">
                              {lineup1.map((p, idx) => (
                                <div
                                  key={`l1-${p.name}-${p.number}-${idx}`}
                                  className={`flex items-center justify-between text-xs p-1.5 rounded transition-colors ${p.isStar ? "bg-[#D4AF37]/5 border-l-2 border-[#D4AF37]" : "bg-black/30 hover:bg-black/50"}`}>
                                  <span className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] font-black shrink-0 ${p.isStar ? "bg-[#D4AF37] text-black" : "bg-neutral-800 text-neutral-400"}`}>
                                      {p.number}
                                    </span>
                                    <span
                                      className={`truncate ${p.isStar ? "font-bold text-white" : "text-neutral-300"}`}>
                                      {p.name}
                                    </span>
                                  </span>
                                  <span className="font-mono text-[9px] font-bold text-neutral-500 bg-neutral-900 px-1 rounded uppercase tracking-wider scale-90">
                                    {p.pos}
                                  </span>
                                </div>
                              ))}
                              <div className="text-[10px] text-neutral-500 italic mt-2.5 pt-2 border-t border-neutral-900/60">
                                HLV: {team1.coach}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-neutral-600 italic">
                              Chi tiết đội hình sẽ được hiển thị khi đội giành
                              vé đi tiếp.
                            </p>
                          )}
                        </div>

                        {/* Team 2 Lineup */}
                        <div>
                          <div className="flex items-center justify-end gap-1.5 mb-2.5 pb-1 border-b border-neutral-900">
                            {team2 ? (
                              <>
                                <span className="font-black text-xs text-[#D4AF37] truncate">
                                  {team2.name}
                                </span>
                                <img
                                  src={`https://flagcdn.com/w80/${team2.code}.png`}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-5 h-3.5 rounded object-cover"
                                />
                              </>
                            ) : (
                              <span className="text-xs text-neutral-500 italic">
                                Chờ xác định
                              </span>
                            )}
                          </div>

                          {team2 ? (
                            <div className="space-y-1.5 text-right">
                              {lineup2.map((p, idx) => (
                                <div
                                  key={`l2-${p.name}-${p.number}-${idx}`}
                                  className={`flex items-center justify-between flex-row-reverse text-xs p-1.5 rounded transition-colors ${p.isStar ? "bg-[#D4AF37]/5 border-r-2 border-[#D4AF37]" : "bg-black/30 hover:bg-black/50"}`}>
                                  <span className="flex items-center flex-row-reverse gap-2 min-w-0">
                                    <span
                                      className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] font-black shrink-0 ${p.isStar ? "bg-[#D4AF37] text-black" : "bg-neutral-800 text-neutral-400"}`}>
                                      {p.number}
                                    </span>
                                    <span
                                      className={`truncate ${p.isStar ? "font-bold text-white" : "text-neutral-300"}`}>
                                      {p.name}
                                    </span>
                                  </span>
                                  <span className="font-mono text-[9px] font-bold text-neutral-500 bg-neutral-900 px-1 rounded uppercase tracking-wider scale-90">
                                    {p.pos}
                                  </span>
                                </div>
                              ))}
                              <div className="text-[10px] text-neutral-500 italic mt-2.5 pt-2 border-t border-neutral-900/60 text-right">
                                HLV: {team2.coach}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-neutral-600 italic text-right">
                              Chi tiết đội hình sẽ được hiển thị khi đội giành
                              vé đi tiếp.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-500 py-12 border border-dashed border-neutral-850 rounded-xl">
                        <User className="w-8 h-8 text-neutral-700 mb-2" />
                        <p className="text-xs">Chưa có thông tin đội hình</p>
                        <p className="text-[10px] text-neutral-600 mt-0.5">
                          Vui lòng chờ xác định hai đội đối đầu
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-6 flex flex-col items-center justify-center text-center text-neutral-500 h-full">
                  <Trophy className="w-10 h-10 text-neutral-700 mb-2" />
                  <p className="text-xs font-semibold">Chọn một trận đấu</p>
                  <p className="text-[10px] text-neutral-600 mt-1">
                    Bấm vào bất kỳ trận đấu nào ở danh sách bên trái để xem đội
                    hình ra sân và thông tin địa điểm.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};
