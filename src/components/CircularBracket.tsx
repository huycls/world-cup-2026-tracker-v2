import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Team, Match } from '../types';
import { Trophy, Clock, HelpCircle, Flame, Star, Award, ShieldAlert, Zap } from 'lucide-react';

interface CircularBracketProps {
  teams: Team[];
  outerRingTeams: Team[];
  matches: Match[];
  onHoverTeam: (team: Team | null) => void;
  onHoverMatch: (match: Match | null) => void;
  hoveredTeam: Team | null;
  hoveredMatch: Match | null;
}

export const CircularBracket: React.FC<CircularBracketProps> = ({
  teams,
  outerRingTeams,
  matches,
  onHoverTeam,
  onHoverMatch,
  hoveredTeam,
  hoveredMatch,
}) => {
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const cx = 450;
  const cy = 450;

  // Define radius for each layer of the bracket
  const R_FLAGS = 390; // Outer circle of flags (Layer 0)
  const R_R16 = 305;   // Round of 16 entries (Layer 1 nodes)
  const R_QF = 225;    // Quarter-final entries (Layer 2 nodes)
  const R_SF = 145;    // Semi-final entries (Layer 3 nodes)
  const R_FINAL = 80;  // Final entries (Layer 4 nodes)

  // 1. Calculate angles for all 32 teams (Layer 0)
  // Left side: teams 0-15 (angles around PI / 180 degrees)
  // Right side: teams 16-31 (angles around 0 / 360 degrees)
  const teamAngles = useMemo(() => {
    const angles: number[] = [];
    for (let i = 0; i < 32; i++) {
      if (i < 16) {
        // Left side: spread around PI (180deg), spanning from 100deg (1.74 rad) to 260deg (4.54 rad)
        // Center of left side is PI (3.14 rad). Let's distribute symmetrically.
        const fraction = (i - 7.5) / 8; // from -7.5/8 to 7.5/8 (-0.93 to 0.93)
        angles.push(Math.PI + fraction * 1.35);
      } else {
        // Right side: spread around 0, spanning from -80deg (-1.4 rad) to 80deg (1.4 rad)
        const fraction = ((i - 16) - 7.5) / 8;
        angles.push(0 + fraction * 1.35);
      }
    }
    return angles;
  }, []);

  const teamIdToOuterIndex = useMemo(() => {
    const map: Record<string, number> = {};
    outerRingTeams.forEach((t, idx) => {
      map[t.id] = idx;
    });
    return map;
  }, [outerRingTeams]);

  // Helper to trace active paths based on hovered team or match
  const activePathDetails = useMemo(() => {
    const activeSegments = new Set<string>(); // Format: "round-index-child"
    const activeNodes = new Set<string>(); // Format: "round-index"

    if (hoveredTeam) {
      const idx = teamIdToOuterIndex[hoveredTeam.id];
      if (idx !== undefined) {
        let currIdx = idx;
        activeNodes.add(`r32-${currIdx}`);

        // R32 segment (leads to R16)
        const r32MatchIdx = Math.floor(currIdx / 2);
        activeSegments.add(`0-${r32MatchIdx}-${currIdx % 2}`);
        activeNodes.add(`r16-${r32MatchIdx}`);

        // R16 segment (leads to QF)
        const r16MatchIdx = Math.floor(r32MatchIdx / 2);
        activeSegments.add(`1-${r16MatchIdx}-${r32MatchIdx % 2}`);
        activeNodes.add(`qf-${r16MatchIdx}`);

        // QF segment (leads to SF)
        const qfMatchIdx = Math.floor(r16MatchIdx / 2);
        activeSegments.add(`2-${qfMatchIdx}-${r16MatchIdx % 2}`);
        activeNodes.add(`sf-${qfMatchIdx}`);

        // SF segment (leads to Final)
        const sfMatchIdx = Math.floor(qfMatchIdx / 2);
        activeSegments.add(`3-${sfMatchIdx}-${qfMatchIdx % 2}`);
        activeNodes.add(`final-0`);

        // Final segment (leads to Trophy)
        activeSegments.add(`4-0-${sfMatchIdx}`);
      }
    } else if (hoveredMatch) {
      // Highlight the match itself and its ancestry down to the outer rings
      const { round, index } = hoveredMatch;
      activeNodes.add(`${round === 0 ? 'r32' : round === 1 ? 'r16' : round === 2 ? 'qf' : round === 3 ? 'sf' : 'final'}-${index}`);
      
      // Let's activate segments connecting to this match
      if (round > 0) {
        // Activate children segments
        const childRound = round - 1;
        const childIdx1 = index * 2;
        const childIdx2 = index * 2 + 1;
        activeSegments.add(`${childRound}-${index}-0`);
        activeSegments.add(`${childRound}-${index}-1`);
      }
    }

    return { activeSegments, activeNodes };
  }, [hoveredTeam, hoveredMatch, teamIdToOuterIndex]);

  // Recursively calculate node angles for each round
  // Round 0: 32 teams (angles computed above)
  // Round 1 (R16): 16 nodes (midpoint of adjacent R32 nodes)
  const r16Angles = useMemo(() => {
    const angles: number[] = [];
    for (let i = 0; i < 16; i++) {
      angles.push((teamAngles[2 * i] + teamAngles[2 * i + 1]) / 2);
    }
    return angles;
  }, [teamAngles]);

  // Round 2 (QF): 8 nodes (midpoint of adjacent R16 nodes)
  const qfAngles = useMemo(() => {
    const angles: number[] = [];
    for (let i = 0; i < 8; i++) {
      angles.push((r16Angles[2 * i] + r16Angles[2 * i + 1]) / 2);
    }
    return angles;
  }, [r16Angles]);

  // Round 3 (SF): 4 nodes (midpoint of adjacent QF nodes)
  const sfAngles = useMemo(() => {
    const angles: number[] = [];
    for (let i = 0; i < 4; i++) {
      angles.push((qfAngles[2 * i] + qfAngles[2 * i + 1]) / 2);
    }
    return angles;
  }, [qfAngles]);

  // Round 4 (Final): 2 nodes (midpoint of adjacent SF nodes)
  // Left finalist (idx 0) and Right finalist (idx 1)
  const finalAngles = useMemo(() => {
    return [
      (sfAngles[0] + sfAngles[1]) / 2, // Left Finalist (will be ~PI)
      (sfAngles[2] + sfAngles[3]) / 2  // Right Finalist (will be ~0)
    ];
  }, [sfAngles]);

  // Convert Polar to Cartesian coordinates
  const polarToCartesian = (radius: number, angle: number) => {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  // Generate SVG path for step-like connections
  // R_child: radius of child, R_parent: radius of parent,
  // thetaA, thetaB: angles of children, thetaP: angle of parent
  const drawBracketPath = (
    r_child: number,
    r_parent: number,
    thetaA: number,
    thetaB: number,
    thetaP: number,
    roundIndex: number,
    matchIndex: number
  ) => {
    // Intermediate radius where the line bends into an arc
    const r_mid = r_parent + (r_child - r_parent) * 0.45;

    const A = polarToCartesian(r_child, thetaA);
    const Amid = polarToCartesian(r_mid, thetaA);
    const B = polarToCartesian(r_child, thetaB);
    const Bmid = polarToCartesian(r_mid, thetaB);
    const P = polarToCartesian(r_parent, thetaP);
    const Pmid = polarToCartesian(r_mid, thetaP);

    // Is segment A active?
    const isSegAActive = activePathDetails.activeSegments.has(`${roundIndex}-${matchIndex}-0`);
    const isSegBActive = activePathDetails.activeSegments.has(`${roundIndex}-${matchIndex}-1`);

    // We split into two separate paths to style them individually (active vs inactive!)
    const pathA = `M ${A.x} ${A.y} L ${Amid.x} ${Amid.y} A ${r_mid} ${r_mid} 0 0 ${thetaA < thetaB ? 1 : 0} ${Pmid.x} ${Pmid.y} L ${P.x} ${P.y}`;
    const pathB = `M ${B.x} ${B.y} L ${Bmid.x} ${Bmid.y} A ${r_mid} ${r_mid} 0 0 ${thetaA < thetaB ? 0 : 1} ${Pmid.x} ${Pmid.y} L ${P.x} ${P.y}`;

    return { pathA, pathB, isSegAActive, isSegBActive };
  };

  // Find a team by its ID safely
  const findTeam = (id: string | null) => {
    if (!id) return null;
    return teams.find((t) => t.id === id) || outerRingTeams.find((t) => t.id === id) || null;
  };

  const getMatchTeamDisplay = (match: Match, slot: 1 | 2) => {
    const id = slot === 1 ? match.team1Id : match.team2Id;
    const name = slot === 1 ? match.team1Name : match.team2Name;
    const code = slot === 1 ? match.team1Code : match.team2Code;
    const known = findTeam(id);
    if (known) return known;
    if (!name) return null;
    return {
      id: id ?? `${match.id}-t${slot}`,
      name,
      englishName: name,
      code: code ?? 'xx',
      group: '?',
      rank: 999,
      starPlayer: '—',
      coach: '—',
      bestFinish: '—',
      stats: { goalsScored: 0, goalsConceded: 0, yellowCards: 0, redCards: 0, shots: 0, possession: 50 },
    } as Team;
  };

  // Track cursor movement for Tooltips
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15,
    });
  };

  return (
    <div 
      className="relative w-full aspect-square max-w-[760px] mx-auto bg-black/10 rounded-2xl border border-[#D4AF37]/20 p-2 overflow-hidden shadow-2xl backdrop-blur-md"
      onMouseMove={handleMouseMove}
    >
      {/* SVG Canvas for Bracket Lines */}
      <svg 
        viewBox="0 0 900 900" 
        className="w-full h-full select-none"
      >
        <defs>
          {/* Circular Clip for Flags */}
          <clipPath id="circle-clip">
            <circle cx="0" cy="0" r="16" />
          </clipPath>

          {/* Mini flag clip for inner nodes */}
          <clipPath id="mini-flag-clip">
            <circle cx="0" cy="0" r="8" />
          </clipPath>
          
          {/* Drop Shadows and Glow Filters */}
          <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="live-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 1 0" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle radar ticks/background circles */}
        <circle cx={cx} cy={cy} r={R_FLAGS} className="stroke-neutral-900 fill-none" strokeWidth="1" strokeDasharray="5,5" />
        <circle cx={cx} cy={cy} r={R_R16} className="stroke-neutral-900 fill-none" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R_QF} className="stroke-neutral-900 fill-none" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R_SF} className="stroke-neutral-900 fill-none" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R_FINAL} className="stroke-neutral-900/60 fill-none" strokeWidth="1" />

        {/* 1. Draw bracket connections: Round of 32 to Round of 16 */}
        {Array.from({ length: 16 }).map((_, i) => {
          const { pathA, pathB, isSegAActive, isSegBActive } = drawBracketPath(
            R_FLAGS,
            R_R16,
            teamAngles[2 * i],
            teamAngles[2 * i + 1],
            r16Angles[i],
            0,
            i
          );
          return (
            <g key={`r32-lines-${i}`}>
              <path
                d={pathA}
                fill="none"
                className={`transition-all duration-300 ${
                  isSegAActive 
                    ? 'stroke-yellow-400 stroke-[2.5px] drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
                    : 'stroke-neutral-800 hover:stroke-neutral-700 stroke-[1.5px]'
                }`}
              />
              <path
                d={pathB}
                fill="none"
                className={`transition-all duration-300 ${
                  isSegBActive 
                    ? 'stroke-yellow-400 stroke-[2.5px] drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
                    : 'stroke-neutral-800 hover:stroke-neutral-700 stroke-[1.5px]'
                }`}
              />
            </g>
          );
        })}

        {/* 2. Draw bracket connections: Round of 16 to Quarter-finals */}
        {Array.from({ length: 8 }).map((_, i) => {
          const { pathA, pathB, isSegAActive, isSegBActive } = drawBracketPath(
            R_R16,
            R_QF,
            r16Angles[2 * i],
            r16Angles[2 * i + 1],
            qfAngles[i],
            1,
            i
          );
          return (
            <g key={`r16-lines-${i}`}>
              <path
                d={pathA}
                fill="none"
                className={`transition-all duration-300 ${
                  isSegAActive 
                    ? 'stroke-yellow-400 stroke-[2.5px] drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
                    : 'stroke-neutral-800 hover:stroke-neutral-700 stroke-[1.5px]'
                }`}
              />
              <path
                d={pathB}
                fill="none"
                className={`transition-all duration-300 ${
                  isSegBActive 
                    ? 'stroke-yellow-400 stroke-[2.5px] drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
                    : 'stroke-neutral-800 hover:stroke-neutral-700 stroke-[1.5px]'
                }`}
              />
            </g>
          );
        })}

        {/* 3. Draw bracket connections: Quarter-finals to Semi-finals */}
        {Array.from({ length: 4 }).map((_, i) => {
          const { pathA, pathB, isSegAActive, isSegBActive } = drawBracketPath(
            R_QF,
            R_SF,
            qfAngles[2 * i],
            qfAngles[2 * i + 1],
            sfAngles[i],
            2,
            i
          );
          return (
            <g key={`qf-lines-${i}`}>
              <path
                d={pathA}
                fill="none"
                className={`transition-all duration-300 ${
                  isSegAActive 
                    ? 'stroke-yellow-400 stroke-[2.5px] drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
                    : 'stroke-neutral-800 hover:stroke-neutral-700 stroke-[1.5px]'
                }`}
              />
              <path
                d={pathB}
                fill="none"
                className={`transition-all duration-300 ${
                  isSegBActive 
                    ? 'stroke-yellow-400 stroke-[2.5px] drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
                    : 'stroke-neutral-800 hover:stroke-neutral-700 stroke-[1.5px]'
                }`}
              />
            </g>
          );
        })}

        {/* 4. Draw bracket connections: Semi-finals to Final */}
        {Array.from({ length: 2 }).map((_, i) => {
          const { pathA, pathB, isSegAActive, isSegBActive } = drawBracketPath(
            R_SF,
            R_FINAL,
            sfAngles[2 * i],
            sfAngles[2 * i + 1],
            finalAngles[i],
            3,
            i
          );
          return (
            <g key={`sf-lines-${i}`}>
              <path
                d={pathA}
                fill="none"
                className={`transition-all duration-300 ${
                  isSegAActive 
                    ? 'stroke-yellow-400 stroke-[2.5px] drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
                    : 'stroke-neutral-800 hover:stroke-neutral-700 stroke-[1.5px]'
                }`}
              />
              <path
                d={pathB}
                fill="none"
                className={`transition-all duration-300 ${
                  isSegBActive 
                    ? 'stroke-yellow-400 stroke-[2.5px] drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
                    : 'stroke-neutral-800 hover:stroke-neutral-700 stroke-[1.5px]'
                }`}
              />
            </g>
          );
        })}

        {/* 5. Draw Finalists to Center Trophy horizontal stems */}
        {(() => {
          const leftFinalP = polarToCartesian(R_FINAL, finalAngles[0]);
          const rightFinalP = polarToCartesian(R_FINAL, finalAngles[1]);
          const isLeftFinalActive = activePathDetails.activeSegments.has('4-0-0');
          const isRightFinalActive = activePathDetails.activeSegments.has('4-0-1');

          return (
            <g>
              {/* Left Finalist to Final node stem */}
              <path
                d={`M ${leftFinalP.x} ${leftFinalP.y} L ${cx - 40} ${cy} L ${cx - 40} ${cy - 115} L ${cx} ${cy - 115}`}
                fill="none"
                className={`transition-all duration-300 ${
                  isLeftFinalActive
                    ? 'stroke-yellow-400 stroke-[3px] drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]'
                    : 'stroke-neutral-800 stroke-[1.5px]'
                }`}
              />
              {/* Right Finalist to Final node stem */}
              <path
                d={`M ${rightFinalP.x} ${rightFinalP.y} L ${cx + 40} ${cy} L ${cx + 40} ${cy - 115} L ${cx} ${cy - 115}`}
                fill="none"
                className={`transition-all duration-300 ${
                  isRightFinalActive
                    ? 'stroke-yellow-400 stroke-[3px] drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]'
                    : 'stroke-neutral-800 stroke-[1.5px]'
                }`}
              />
            </g>
          );
        })()}

        {/* --- Interactive Team Flags (Layer 0) --- */}
        {outerRingTeams.map((team, idx) => {
          const pos = polarToCartesian(R_FLAGS, teamAngles[idx]);
          const isHovered = hoveredTeam?.id === team.id;
          const isHighlighted = activePathDetails.activeNodes.size > 0 && !activePathDetails.activeNodes.has(`r32-${idx}`) && !isHovered;

          return (
            <g
              key={`flag-node-${team.id}-${idx}`}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="select-none transition-all duration-200 cursor-default"
              onMouseEnter={() => onHoverTeam(team)}
              onMouseLeave={() => onHoverTeam(null)}
            >
              {/* Gold border/glow around active flag */}
              <circle
                cx="0"
                cy="0"
                r="20"
                className={`fill-neutral-900 transition-all duration-300 ${
                  isHovered 
                    ? 'stroke-yellow-400 stroke-2 shadow-lg drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]' 
                    : 'stroke-neutral-700 stroke-[1.5px]'
                }`}
                style={{ opacity: isHighlighted ? 0.3 : 1 }}
              />
              {/* Circular cropped Flag Image */}
              <image
                href={`https://flagcdn.com/w80/${team.code}.png`}
                x="-16"
                y="-16"
                height="32"
                width="32"
                clipPath="url(#circle-clip)"
                preserveAspectRatio="xMidYMid slice"
                referrerPolicy="no-referrer"
                className="transition-all duration-300"
                style={{ opacity: isHighlighted ? 0.4 : 1 }}
              />
              
              {/* Symmetrical Label Overlay on hover or active */}
              {isHovered && (
                <g transform="translate(0, -28)">
                  <rect
                    x="-40"
                    y="-12"
                    width="80"
                    height="20"
                    rx="4"
                    className="fill-black stroke-yellow-500/50 stroke-[1px]"
                  />
                  <text
                    x="0"
                    y="2"
                    textAnchor="middle"
                    className="fill-yellow-400 text-[10px] font-sans font-bold"
                  >
                    {team.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* --- Center FIFA World Cup Trophy (Layered behind match nodes) --- */}
        {(() => (
            <g
              transform={`translate(${cx - 40}, ${cy - 45})`}
              className="pointer-events-none transition-all duration-300"
            >
              <circle cx="40" cy="45" r="48" className="fill-radial from-yellow-500/25 to-transparent stroke-none" />
              <image
                href="/src/assets/images/worldcup_trophy_1782699459275.jpg"
                x="0"
                y="0"
                height="90"
                width="80"
                className="drop-shadow-[0_0_12px_rgba(234,179,8,0.7)]"
                referrerPolicy="no-referrer"
              />
            </g>
          ))()}

        {/* --- Interactive Match Nodes --- */}
        {/* We place interactive capsule nodes with flag avatars to represent matches */}
        {matches.map((match) => {
          // Identify the position of the match
          let pos = { x: 0, y: 0 };

          if (match.round === 4) {
            // Final is plotted straight above the trophy
            pos.x = cx;
            pos.y = cy - 115;
          } else {
            let radius = 0;
            let angle = 0;

            if (match.round === 0) {
              // Round of 32 represents the junctions of outer circle
              radius = (R_FLAGS + R_R16) * 0.55;
              angle = r16Angles[match.index];
            } else if (match.round === 1) {
              radius = (R_R16 + R_QF) * 0.55;
              angle = qfAngles[match.index];
            } else if (match.round === 2) {
              radius = (R_QF + R_SF) * 0.55;
              angle = sfAngles[match.index];
            } else if (match.round === 3) {
              radius = (R_SF + R_FINAL) * 0.55;
              angle = finalAngles[match.index];
            }
            pos = polarToCartesian(radius, angle);
          }

          const isHovered = hoveredMatch?.id === match.id;
          const isActiveNode = activePathDetails.activeNodes.has(match.id);

          const t1 = getMatchTeamDisplay(match, 1);
          const t2 = getMatchTeamDisplay(match, 2);

          if (match.round === 0) {
            // Round of 32 (R32): Simpler representation (interactive dot) to prevent flag redundancy
            return (
              <g
                key={`match-node-${match.id}`}
                transform={`translate(${pos.x}, ${pos.y}) scale(${isHovered ? 1.3 : 1})`}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => onHoverMatch(match)}
                onMouseLeave={() => onHoverMatch(null)}
              >
                {/* Outer pulsing ring for LIVE matches */}
                {match.status === 'live' && (
                  <circle
                    cx="0"
                    cy="0"
                    r="10"
                    className="fill-none stroke-red-500 stroke-2 animate-ping"
                    opacity="0.8"
                  />
                )}

                {/* Smaller dot */}
                <circle
                  cx="0"
                  cy="0"
                  r="6"
                  className={`transition-all duration-300 ${
                    match.status === 'live'
                      ? 'fill-red-500 stroke-red-400 stroke-2'
                      : match.status === 'finished'
                      ? 'fill-[#D4AF37] stroke-black stroke-[0.5px]'
                      : isActiveNode
                      ? 'fill-yellow-400 stroke-black stroke-[0.5px]'
                      : 'fill-neutral-800 stroke-neutral-700 stroke-[0.5px] hover:stroke-[#D4AF37]'
                  }`}
                  style={{
                    filter: isHovered || match.status === 'live' ? 'url(#gold-glow)' : 'none',
                  }}
                />

                {/* Score label inside node when finished or live */}
                {match.status !== 'scheduled' && match.score1 !== null && match.score2 !== null && (
                  <g transform="translate(0, 12)">
                    <rect
                      x="-14"
                      y="-5"
                      width="28"
                      height="10"
                      rx="2"
                      className="fill-black/95 stroke-[#D4AF37]/30 stroke-[0.5px]"
                    />
                    <text
                      x="0"
                      y="2.5"
                      textAnchor="middle"
                      className="fill-yellow-400 font-mono text-[7px] font-extrabold"
                    >
                      {match.score1}-{match.score2}
                    </text>
                  </g>
                )}
              </g>
            );
          }

          // Round > 0: capsule with team flags
          return (
            <g
              key={`match-node-${match.id}`}
              transform={`translate(${pos.x}, ${pos.y}) scale(${isHovered ? 1.35 : 1})`}
              className="transition-all duration-300 cursor-default"
              onMouseEnter={() => onHoverMatch(match)}
              onMouseLeave={() => onHoverMatch(null)}
            >
              {/* Outer pulsing ring for LIVE matches */}
              {match.status === 'live' && (
                <rect
                  x="-45"
                  y="-25"
                  width="90"
                  height="50"
                  rx="25"
                  className="fill-none stroke-red-500 stroke-2 animate-ping"
                  opacity="0.8"
                />
              )}

              {/* Match capsule background */}
              <rect
                x="-45"
                y="-25"
                width="90"
                height="50"
                rx="25"
                className={`transition-all duration-300 ${
                  match.status === 'live'
                    ? 'fill-neutral-950 stroke-red-500 stroke-[2px]'
                    : match.status === 'finished'
                    ? 'fill-neutral-950 stroke-[#D4AF37] stroke-[1.5px]'
                    : isActiveNode
                    ? 'fill-neutral-950 stroke-yellow-400 stroke-[1.5px]'
                    : 'fill-neutral-950 stroke-neutral-700 stroke-[1px] hover:stroke-[#D4AF37]'
                }`}
                style={{
                  filter: isHovered || match.status === 'live' ? 'url(#gold-glow)' : 'none',
                }}
              />

              {/* Team 1 flag avatar */}
              <g transform="translate(-20, 0)" className="group/t1">
                <circle cx="0" cy="0" r="20" className="fill-neutral-900 stroke-neutral-800 stroke-[0.5px]" />
                {t1 ? (
                  <image
                    href={`https://flagcdn.com/w80/${t1.code}.png`}
                    x="-16"
                    y="-16"
                    height="32"
                    width="32"
                    clipPath="url(#circle-clip)"
                    preserveAspectRatio="xMidYMid slice"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    className="fill-neutral-600 font-sans text-[14px] font-black pointer-events-none"
                  >
                    ?
                  </text>
                )}
              </g>

              {/* Team 2 flag avatar */}
              <g transform="translate(20, 0)" className="group/t2">
                <circle cx="0" cy="0" r="20" className="fill-neutral-900 stroke-neutral-800 stroke-[0.5px]" />
                {t2 ? (
                  <image
                    href={`https://flagcdn.com/w80/${t2.code}.png`}
                    x="-16"
                    y="-16"
                    height="32"
                    width="32"
                    clipPath="url(#circle-clip)"
                    preserveAspectRatio="xMidYMid slice"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    className="fill-neutral-600 font-sans text-[14px] font-black pointer-events-none"
                  >
                    ?
                  </text>
                )}
              </g>

              {/* Score label inside node when finished or live */}
              {match.status !== 'scheduled' && match.score1 !== null && match.score2 !== null && (
                <g transform="translate(0, 32)">
                  <rect
                    x="-24"
                    y="-8"
                    width="48"
                    height="16"
                    rx="4"
                    className="fill-black/95 stroke-[#D4AF37]/40 stroke-[0.5px]"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    className="fill-yellow-400 font-mono text-[10px] font-black"
                  >
                    {match.score1}-{match.score2}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* ======================================================== */}
      {/* 2. REAL-TIME INTERACTIVE FLOATING TOOLTIPS & OVERLAYS */}
      {/* ======================================================== */}
      <AnimatePresence>
        {/* A. Hovering FLAG: Team Details Tooltip */}
        {hoveredTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: tooltipPos.x,
              top: tooltipPos.y,
              pointerEvents: 'none',
              zIndex: 50,
            }}
            className="w-72 bg-neutral-950/95 border border-yellow-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center gap-3 border-b border-yellow-500/20 pb-2 mb-3">
              <img
                src={`https://flagcdn.com/w80/${hoveredTeam.code}.png`}
                alt={hoveredTeam.name}
                referrerPolicy="no-referrer"
                className="w-10 h-7 rounded object-cover border border-neutral-800 shadow"
              />
              <div>
                <h4 className="font-sans font-bold text-yellow-400 text-base leading-tight">
                  {hoveredTeam.name}
                </h4>
                <p className="font-sans text-xs text-neutral-400 font-medium">
                  {hoveredTeam.englishName}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-yellow-500/80" /> Thứ hạng FIFA:
                </span>
                <span className="font-bold text-white font-mono">#{hoveredTeam.rank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-yellow-500/80" /> Bảng đấu:
                </span>
                <span className="font-bold text-yellow-400 font-mono">Bảng {hoveredTeam.group}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500/80" /> Ngôi sao:
                </span>
                <span className="font-bold text-white text-right truncate max-w-[140px]">
                  {hoveredTeam.starPlayer}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-yellow-500/80" /> Huấn luyện viên:
                </span>
                <span className="font-semibold text-neutral-200">{hoveredTeam.coach}</span>
              </div>
              <div className="border-t border-neutral-900 pt-2 mt-2">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                  Chỉ số sức mạnh
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-neutral-900/60 p-1 rounded border border-neutral-800/40">
                    <div className="text-red-400 font-bold font-mono">88</div>
                    <div className="text-neutral-500">Tấn công</div>
                  </div>
                  <div className="bg-neutral-900/60 p-1 rounded border border-neutral-800/40">
                    <div className="text-yellow-400 font-bold font-mono">85</div>
                    <div className="text-neutral-500">Trung tuyến</div>
                  </div>
                  <div className="bg-neutral-900/60 p-1 rounded border border-neutral-800/40">
                    <div className="text-blue-400 font-bold font-mono">84</div>
                    <div className="text-neutral-500">Phòng ngự</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2 mt-3 text-[11px] text-neutral-300">
                <span className="text-yellow-500 font-bold">Thành tích tốt nhất: </span>
                {hoveredTeam.bestFinish}
              </div>
            </div>
          </motion.div>
        )}

        {/* B. Hovering MATCH NODE: Match Details Tooltip */}
        {hoveredMatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: tooltipPos.x,
              top: tooltipPos.y,
              pointerEvents: 'none',
              zIndex: 50,
            }}
            className="w-80 bg-neutral-950/98 border border-yellow-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]"
          >
            <div className="text-center text-[10px] text-yellow-500 font-bold uppercase tracking-wider mb-2 border-b border-neutral-900 pb-1">
              {hoveredMatch.round === 0 && 'Vòng 32 Đội'}
              {hoveredMatch.round === 1 && 'Vòng 16 Đội'}
              {hoveredMatch.round === 2 && 'Vòng Tứ Kết'}
              {hoveredMatch.round === 3 && 'Vòng Bán Kết'}
              {hoveredMatch.round === 4 && 'Trận Chung Kết (World Cup 2026)'}
              <span className="mx-1">•</span> Trận {hoveredMatch.index + 1}
            </div>

            {/* Match Teams & Score Grid */}
            {(() => {
              const ht1 = getMatchTeamDisplay(hoveredMatch, 1);
              const ht2 = getMatchTeamDisplay(hoveredMatch, 2);
              return (
            <div className="grid grid-cols-7 gap-1 items-center py-2 mb-2">
              <div className="col-span-2 text-center">
                {ht1 ? (
                  <>
                    <img
                      src={`https://flagcdn.com/w80/${ht1.code}.png`}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-10 h-7 rounded object-cover mx-auto mb-1 border border-neutral-800"
                    />
                    <div className="font-bold text-xs text-white truncate">{ht1.name}</div>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-8 h-8 text-neutral-700 mx-auto mb-1" />
                    <div className="text-xs text-neutral-500 italic">Chờ xác định</div>
                  </>
                )}
              </div>

              {/* Score or VS */}
              <div className="col-span-3 text-center">
                {hoveredMatch.status === 'scheduled' ? (
                  <div className="bg-neutral-900 px-2 py-1 rounded text-[10px] text-yellow-500 font-bold border border-neutral-800 inline-block font-sans">
                    VS
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-bold font-mono tracking-tight text-yellow-400">
                      {hoveredMatch.score1} - {hoveredMatch.score2}
                    </div>
                    {hoveredMatch.penalties1 !== undefined && hoveredMatch.penalties2 !== undefined && (
                      <div className="text-[10px] text-neutral-400 font-mono">
                        (Luân lưu: {hoveredMatch.penalties1}-{hoveredMatch.penalties2})
                      </div>
                    )}
                    {hoveredMatch.status === 'live' ? (
                      <span className="inline-flex items-center gap-1 bg-red-600/20 text-red-500 text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse mt-1 border border-red-500/30">
                        <Flame className="w-2.5 h-2.5" /> TRỰC TIẾP {hoveredMatch.liveMinute}'
                      </span>
                    ) : (
                      <span className="inline-block bg-neutral-900 text-neutral-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1">
                        Hết giờ
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="col-span-2 text-center">
                {ht2 ? (
                  <>
                    <img
                      src={`https://flagcdn.com/w80/${ht2.code}.png`}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-10 h-7 rounded object-cover mx-auto mb-1 border border-neutral-800"
                    />
                    <div className="font-bold text-xs text-white truncate">{ht2.name}</div>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-8 h-8 text-neutral-700 mx-auto mb-1" />
                    <div className="text-xs text-neutral-500 italic">Chờ xác định</div>
                  </>
                )}
              </div>
            </div>
              );
            })()}

            {/* Time / Date */}
            <div className="flex items-center justify-center gap-1 bg-neutral-900/60 p-1.5 rounded-lg border border-neutral-800/40 text-[11px] text-neutral-400 mb-2">
              <Clock className="w-3.5 h-3.5 text-yellow-500/80" />
              <span>{hoveredMatch.time}</span>
            </div>

            {/* Goal scorer details from API */}
            {hoveredMatch.events && hoveredMatch.events.length > 0 ? (
              <div className="border-t border-neutral-900 pt-2 mt-2">
                <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" /> Diễn biến chính:
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                  {hoveredMatch.events.map((evt) => {
                    const evtTeam = findTeam(evt.teamId);
                    return (
                      <div key={evt.id} className="flex justify-between text-[11px] py-0.5">
                        <span className="text-neutral-400 font-mono">[{evt.time}']</span>
                        <span className="font-semibold text-neutral-200">
                          {evt.playerName}{' '}
                          {evt.type === 'goal' ? '⚽' : evt.type === 'yellow_card' ? '🟨' : '🟥'}
                        </span>
                        <span className="text-yellow-500 font-mono text-[10px]">
                          ({evtTeam?.name})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
