import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Match, Team } from '../types';
import { Flame, CheckCircle2 } from 'lucide-react';

interface LiveTickerProps {
  matches: Match[];
  teams: Team[];
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ matches, teams }) => {
  const liveMatches = matches.filter((m) => m.status === 'live');
  const finishedMatchesCount = matches.filter((m) => m.status === 'finished').length;
  const totalMatchesCount = matches.length;

  const getRoundName = (round: number) => {
    switch (round) {
      case 0: return 'Vòng 32 Đội';
      case 1: return 'Vòng 16 Đội';
      case 2: return 'Vòng Tứ Kết';
      case 3: return 'Vòng Bán Kết';
      case 4: return 'Trận Chung Kết';
      default: return 'World Cup';
    }
  };

  const getTeamDisplay = (match: Match, slot: 1 | 2) => {
    const id = slot === 1 ? match.team1Id : match.team2Id;
    const name = slot === 1 ? match.team1Name : match.team2Name;
    const code = slot === 1 ? match.team1Code : match.team2Code;
    const team = id ? teams.find((t) => t.id === id) : null;
    return {
      name: team?.name ?? name ?? 'Chờ xác định',
      code: team?.code ?? code ?? 'xx',
    };
  };

  const recentFinished = matches
    .filter((m) => m.status === 'finished')
    .sort((a, b) => b.utcTimestamp - a.utcTimestamp)
    .slice(0, 8);

  return (
    <div className="flex flex-col h-full bg-[#111] border border-[#D4AF37]/30 rounded-xl p-4 shadow-2xl">
      <div className="border-b border-[#D4AF37]/20 pb-4 mb-4">
        <h3 className="text-xs uppercase tracking-widest font-display font-semibold text-[#D4AF37] flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#D4AF37]" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
          </span>
          KNOCKOUT LIVE
        </h3>
        <p className="text-[10px] text-neutral-400 font-mono">
          Hoàn thành: {finishedMatchesCount}/{totalMatchesCount} trận
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-[180px] overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-500" /> Trận Đấu Trực Tiếp
          </h4>
          {liveMatches.length > 0 && (
            <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse uppercase">
              {liveMatches.length} Trận
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-900">
          <AnimatePresence mode="popLayout">
            {liveMatches.length > 0 ? (
              liveMatches.map((m) => {
                const t1 = getTeamDisplay(m, 1);
                const t2 = getTeamDisplay(m, 2);
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-black/50 border-l-4 border-red-500 rounded-r-lg p-3 shadow"
                  >
                    <div className="flex justify-between items-center text-[10px] text-neutral-500 mb-1.5 font-mono">
                      <span>{getRoundName(m.round)}</span>
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                        TRỰC TIẾP {m.liveMinute}'
                      </span>
                    </div>
                    <div className="grid grid-cols-7 items-center gap-1">
                      <div className="col-span-2 flex flex-col items-center">
                        <img
                          src={`https://flagcdn.com/w80/${t1.code}.png`}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-8 h-5 rounded object-cover shadow border border-neutral-800"
                        />
                        <span className="text-[11px] font-bold text-white mt-1 truncate max-w-[64px] text-center">
                          {t1.name}
                        </span>
                      </div>
                      <div className="col-span-3 text-center">
                        <div className="text-base font-bold font-mono tracking-tight text-[#D4AF37]">
                          {m.score1} - {m.score2}
                        </div>
                      </div>
                      <div className="col-span-2 flex flex-col items-center">
                        <img
                          src={`https://flagcdn.com/w80/${t2.code}.png`}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-8 h-5 rounded object-cover shadow border border-neutral-800"
                        />
                        <span className="text-[11px] font-bold text-white mt-1 truncate max-w-[64px] text-center">
                          {t2.name}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-neutral-500 border border-dashed border-[#D4AF37]/20 rounded-xl bg-black/25">
                <Flame className="w-8 h-8 text-neutral-800 mb-1.5" />
                <p className="text-xs">Không có trận đấu trực tiếp</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-h-[140px] border-t border-[#D4AF37]/20 pt-3">
          <h4 className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Kết Quả Gần Đây
          </h4>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-neutral-900 max-h-[300px]">
            {recentFinished.length > 0 ? (
              recentFinished.map((m) => {
                const t1 = getTeamDisplay(m, 1);
                const t2 = getTeamDisplay(m, 2);
                return (
                  <div
                    key={`recent-${m.id}`}
                    className="rounded-lg p-2.5 border border-neutral-800 bg-black/30 text-xs"
                  >
                    <div className="text-[9px] text-neutral-500 font-mono mb-1">
                      {getRoundName(m.round)}
                    </div>
                    <div className="font-bold text-neutral-200">
                      {t1.name} {m.score1} - {m.score2} {t2.name}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-neutral-600 italic text-center py-4">
                Chưa có kết quả knockout
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
