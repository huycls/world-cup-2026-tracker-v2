import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Team, Match, TournamentStats } from "../types";
import {
  Award,
  Flame,
  AlertCircle,
  Shield,
  TrendingUp,
  Sparkles,
  Footprints,
  HelpCircle,
} from "lucide-react";

interface StatsPanelProps {
  teams: Team[];
  matches: Match[];
  tournamentStats: TournamentStats;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  teams,
  matches,
  tournamentStats,
}) => {
  // 1. Calculate champion if final is finished
  const champion = useMemo(() => {
    const finalMatch = matches.find((m) => m.round === 4);
    if (finalMatch && finalMatch.status === "finished") {
      const winnerId =
        (finalMatch.score1 ?? 0) > (finalMatch.score2 ?? 0)
          ? finalMatch.team1Id
          : (finalMatch.score1 ?? 0) < (finalMatch.score2 ?? 0)
            ? finalMatch.team2Id
            : (finalMatch.penalties1 ?? 0) > (finalMatch.penalties2 ?? 0)
              ? finalMatch.team1Id
              : finalMatch.team2Id;

      return teams.find((t) => t.id === winnerId) || null;
    }
    return null;
  }, [matches, teams]);

  // 2. Calculate top defensive teams (least goals conceded, among teams that have played)
  const topDefense = useMemo(() => {
    return [...teams]
      .filter((t) => t.stats.goalsScored > 0 || t.stats.goalsConceded > 0) // played at least one match
      .sort((a, b) => a.stats.goalsConceded - b.stats.goalsConceded)
      .slice(0, 3);
  }, [teams]);

  // 3. Calculate most aggressive attacking teams (most goals scored)
  const topAttack = useMemo(() => {
    return [...teams]
      .filter((t) => t.stats.goalsScored > 0)
      .sort((a, b) => b.stats.goalsScored - a.stats.goalsScored)
      .slice(0, 3);
  }, [teams]);

  return (
    <div className="flex flex-col h-full bg-[#111] border border-[#D4AF37]/30 rounded-xl p-4 shadow-2xl">
      {/* 1. Champion Showcase Banner (Displays with spectacular golden animations when final finishes) */}
      <AnimatePresence>
        {champion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-gradient-to-b from-[#D4AF37]/20 to-amber-600/5 border border-[#D4AF37] rounded-xl p-4 text-center overflow-hidden mb-4 shadow-2xl shadow-[#D4AF37]/10">
            {/* Ambient golden dust particles simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent)] animate-pulse" />
            <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-1 animate-bounce" />

            <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
              Nhà Vô Địch World Cup ${champion.year}
            </h4>

            <div className="flex items-center justify-center gap-2 mt-2 mb-1">
              <img
                src={`https://flagcdn.com/w80/${champion.code}.png`}
                alt=""
                referrerPolicy="no-referrer"
                className="w-10 h-7 rounded object-cover border border-[#D4AF37] shadow-md"
              />
              <span className="text-xl font-black text-white font-sans tracking-wide uppercase">
                {champion.name}
              </span>
            </div>

            <p className="text-xs text-yellow-300/80 font-medium">
              HLV {champion.coach} đưa tuyển {champion.name} lên đỉnh thế giới!
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] bg-black/80 p-2 rounded-lg border border-[#D4AF37]/10">
              <div>
                <span className="text-neutral-500 block">Số bàn thắng</span>
                <span className="text-[#D4AF37] font-bold font-mono text-xs">
                  {champion.stats.goalsScored} bàn
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Ngôi sao sáng</span>
                <span className="text-white font-bold truncate block">
                  {champion.starPlayer}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Global Tournament Aggregated Statistics Dashboard */}
      <div className="mb-4">
        <h4 className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" /> Thống Kê Tổng
          Quan
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {/* Total Goals */}
          <div className="bg-black/50 border border-[#D4AF37]/15 rounded-xl p-2 text-center">
            <span className="text-[9px] text-neutral-500 uppercase block tracking-wider font-semibold">
              Bàn Thắng
            </span>
            <span className="text-xl font-bold font-mono text-[#D4AF37] drop-shadow-[0_0_6px_rgba(212,175,55,0.2)] block my-0.5">
              {tournamentStats.totalGoals}
            </span>
            <span className="text-[9px] text-neutral-500 block">
              ⚽{" "}
              {matches.filter((m) => m.status === "finished").length > 0
                ? (
                    tournamentStats.totalGoals /
                    matches.filter((m) => m.status === "finished").length
                  ).toFixed(1)
                : "0.0"}{" "}
              / trận
            </span>
          </div>

          {/* Yellow Cards */}
          <div className="bg-black/50 border border-[#D4AF37]/15 rounded-xl p-2 text-center">
            <span className="text-[9px] text-neutral-500 uppercase block tracking-wider font-semibold">
              Thẻ Vàng
            </span>
            <span className="text-xl font-bold font-mono text-yellow-500 block my-0.5">
              {tournamentStats.yellowCards}
            </span>
            <span className="text-[9px] text-yellow-600 block font-bold">
              🟨 Cảnh cáo
            </span>
          </div>

          {/* Red Cards */}
          <div className="bg-black/50 border border-[#D4AF37]/15 rounded-xl p-2 text-center">
            <span className="text-[9px] text-neutral-500 uppercase block tracking-wider font-semibold">
              Thẻ Đỏ
            </span>
            <span className="text-xl font-bold font-mono text-red-500 block my-0.5">
              {tournamentStats.redCards}
            </span>
            <span className="text-[9px] text-red-600 block font-bold">🟥</span>
          </div>
        </div>
      </div>

      {/* 3. Top Scorers List (Vua Phá Lưới) - Updates live! */}
      <div className="flex-1 flex flex-col min-h-[200px] overflow-hidden border-t border-[#D4AF37]/20 pt-3">
        <h4 className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Footprints className="w-3.5 h-3.5 text-[#D4AF37]" /> Số bàn thắng
          vòng Knockout
        </h4>

        {/* Scorers Scrolling container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-neutral-900 max-h-[300px]">
          {tournamentStats.topScorers.length > 0 ? (
            tournamentStats.topScorers.slice(0, 8).map((player, idx) => (
              <div
                key={`${player.name}-${player.teamCode}`}
                className="flex items-center justify-between bg-black/30 hover:bg-black/60 border border-neutral-800/60 rounded-xl p-2 transition-all duration-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank Indicator */}
                  <span
                    className={`w-5 h-5 flex items-center justify-center font-mono text-[10px] font-black rounded-full ${
                      idx === 0
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md shadow-[#D4AF37]/10"
                        : idx === 1
                          ? "bg-neutral-400 text-neutral-950"
                          : idx === 2
                            ? "bg-amber-600 text-amber-50"
                            : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                    }`}>
                    {idx + 1}
                  </span>

                  {/* Player Name and Flag */}
                  <div className="min-w-0">
                    <div className="font-bold text-neutral-200 text-xs truncate">
                      {player.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <img
                        src={`https://flagcdn.com/w80/${player.teamCode}.png`}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-3.5 h-2.5 rounded object-cover border border-neutral-800"
                      />
                      <span className="text-[9px] text-neutral-500 font-medium">
                        {player.team}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Goals Count badge */}
                <div className="flex items-center gap-1">
                  <span className="font-mono font-black text-[#D4AF37] text-sm">
                    {player.goals}
                  </span>
                  <span className="text-[10px] text-neutral-500">bàn</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-600 border border-dashed border-neutral-800 rounded-xl">
              <Award className="w-8 h-8 text-neutral-800 mb-1.5" />
              <p className="text-xs italic">Chưa có dữ liệu bàn thắng</p>
              <p className="text-[9px] text-neutral-700 mt-0.5">
                Các cầu thủ ghi bàn sẽ được cập nhật trực tiếp tại đây
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Attack vs Defense Standouts lists */}
      {matches.filter((m) => m.status === "finished").length > 0 && (
        <div className="border-t border-[#D4AF37]/20 pt-3 mt-3 grid grid-cols-2 gap-3">
          {/* Strongest Attack */}
          <div>
            <h5 className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
              <Flame className="w-3 h-3 text-red-500" /> Tấn Công
            </h5>
            <div className="space-y-1">
              {topAttack.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-[11px] bg-black/40 p-1.5 rounded border border-neutral-900">
                  <span className="flex items-center gap-1 font-semibold text-neutral-300 truncate max-w-[70px]">
                    <img
                      src={`https://flagcdn.com/w80/${t.code}.png`}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-3 h-2 rounded object-cover"
                    />
                    {t.name}
                  </span>
                  <span className="font-mono font-bold text-[#D4AF37]">
                    {t.stats.goalsScored}b
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Strongest Defense */}
          <div>
            <h5 className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
              <Shield className="w-3 h-3 text-blue-400" /> Phòng Thủ
            </h5>
            <div className="space-y-1">
              {topDefense.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-[11px] bg-black/40 p-1.5 rounded border border-neutral-900">
                  <span className="flex items-center gap-1 font-semibold text-neutral-300 truncate max-w-[70px]">
                    <img
                      src={`https://flagcdn.com/w80/${t.code}.png`}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-3 h-2 rounded object-cover"
                    />
                    {t.name}
                  </span>
                  <span className="font-mono font-bold text-blue-400">
                    {t.stats.goalsConceded}b
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
