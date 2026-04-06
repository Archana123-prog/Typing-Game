import { useState, useEffect, useRef, useCallback } from "react";

// ── Cyberpunk color palette ──────────────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;400;600;700&display=swap');

  :root {
    --bg: #050a0f;
    --bg2: #090f1a;
    --panel: #0d1520;
    --panel2: #111d2e;
    --border: #1a3a5c;
    --neon: #00f5ff;
    --neon2: #ff006e;
    --neon3: #7b2fff;
    --gold: #ffd700;
    --green: #00ff88;
    --red: #ff2244;
    --orange: #ff8800;
    --text: #c8e0f4;
    --text2: #4a7a9b;
    --glow: 0 0 20px rgba(0,245,255,0.4);
    --glow2: 0 0 20px rgba(255,0,110,0.4);
    --glow3: 0 0 20px rgba(0,255,136,0.3);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .tb-root {
    font-family: 'Rajdhani', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    position: relative;
    overflow: hidden;
  }

  /* Animated grid background */
  .tb-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .tb-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 0% 100%, rgba(123,47,255,0.05) 0%, transparent 50%),
                radial-gradient(ellipse at 100% 100%, rgba(255,0,110,0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .tb-content { position: relative; z-index: 1; }

  /* ── Header ── */
  .tb-header {
    text-align: center;
    padding: 24px 20px 16px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(0,245,255,0.04) 0%, transparent 100%);
  }

  .tb-logo {
    font-family: 'Orbitron', monospace;
    font-size: clamp(22px, 5vw, 42px);
    font-weight: 900;
    letter-spacing: 6px;
    text-transform: uppercase;
    background: linear-gradient(90deg, var(--neon), var(--neon3), var(--neon2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 12px rgba(0,245,255,0.5));
    animation: logoPulse 3s ease-in-out infinite;
  }

  @keyframes logoPulse {
    0%,100% { filter: drop-shadow(0 0 12px rgba(0,245,255,0.5)); }
    50% { filter: drop-shadow(0 0 24px rgba(0,245,255,0.9)); }
  }

  .tb-tagline {
    font-size: 13px;
    letter-spacing: 4px;
    color: var(--text2);
    margin-top: 4px;
    font-family: 'Share Tech Mono', monospace;
  }

  /* ── Menu Screen ── */
  .tb-menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 32px;
    min-height: calc(100vh - 100px);
  }

  .tb-menu-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    max-width: 700px;
    width: 100%;
  }

  .tb-mode-card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
  }

  .tb-mode-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--card-glow, transparent);
    opacity: 0;
    transition: opacity 0.25s;
    border-radius: 12px;
  }

  .tb-mode-card:hover::before { opacity: 1; }

  .tb-mode-card:hover {
    border-color: var(--card-color, var(--neon));
    transform: translateY(-4px);
    box-shadow: 0 8px 32px var(--card-shadow, rgba(0,245,255,0.2));
  }

  .tb-mode-icon { font-size: 36px; margin-bottom: 12px; }
  .tb-mode-name {
    font-family: 'Orbitron', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--card-color, var(--neon));
    margin-bottom: 8px;
  }
  .tb-mode-desc { font-size: 13px; color: var(--text2); line-height: 1.5; }

  .tb-name-input-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    max-width: 360px;
    width: 100%;
  }

  .tb-name-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    letter-spacing: 3px;
    color: var(--text2);
  }

  .tb-name-input {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--neon);
    font-family: 'Share Tech Mono', monospace;
    font-size: 18px;
    letter-spacing: 3px;
    padding: 12px 20px;
    text-align: center;
    width: 100%;
    outline: none;
    transition: all 0.2s;
  }
  .tb-name-input:focus {
    border-color: var(--neon);
    box-shadow: var(--glow);
  }

  /* ── Buttons ── */
  .tb-btn {
    font-family: 'Orbitron', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
    padding: 14px 36px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    text-transform: uppercase;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .tb-btn-primary {
    background: linear-gradient(135deg, #004466, #006688);
    color: var(--neon);
    border: 1px solid var(--neon);
    box-shadow: var(--glow);
  }
  .tb-btn-primary:hover {
    background: linear-gradient(135deg, #006688, #00aacc);
    box-shadow: 0 0 40px rgba(0,245,255,0.6);
    transform: translateY(-2px);
  }

  .tb-btn-danger {
    background: linear-gradient(135deg, #440011, #660022);
    color: var(--neon2);
    border: 1px solid var(--neon2);
    box-shadow: var(--glow2);
  }
  .tb-btn-danger:hover {
    box-shadow: 0 0 40px rgba(255,0,110,0.6);
    transform: translateY(-2px);
  }

  .tb-btn-ghost {
    background: transparent;
    color: var(--text2);
    border: 1px solid var(--border);
  }
  .tb-btn-ghost:hover { border-color: var(--text2); color: var(--text); }

  .tb-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

  /* ── Lobby ── */
  .tb-lobby {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    gap: 28px;
    min-height: calc(100vh - 100px);
  }

  .tb-lobby-title {
    font-family: 'Orbitron', monospace;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 4px;
    color: var(--neon);
  }

  .tb-room-code {
    background: var(--panel);
    border: 1px solid var(--neon);
    border-radius: 12px;
    padding: 20px 40px;
    text-align: center;
    box-shadow: var(--glow);
  }
  .tb-room-label { font-size: 11px; letter-spacing: 4px; color: var(--text2); margin-bottom: 8px; font-family: 'Share Tech Mono', monospace; }
  .tb-room-id { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 900; color: var(--neon); letter-spacing: 8px; }

  .tb-players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    max-width: 600px;
    width: 100%;
  }

  .tb-player-slot {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px;
    text-align: center;
    transition: all 0.3s;
  }

  .tb-player-slot.filled {
    border-color: var(--green);
    box-shadow: var(--glow3);
  }

  .tb-player-slot.waiting {
    border-style: dashed;
    opacity: 0.5;
  }

  .tb-player-avatar { font-size: 28px; margin-bottom: 8px; }
  .tb-player-name { font-family: 'Share Tech Mono', monospace; font-size: 13px; color: var(--text); }
  .tb-player-badge { font-size: 10px; letter-spacing: 2px; color: var(--text2); margin-top: 4px; }
  .tb-player-ready { color: var(--green); font-size: 10px; letter-spacing: 2px; margin-top: 4px; }

  /* ── Battle Arena ── */
  .tb-arena {
    padding: 16px;
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Health Bars ── */
  .tb-health-section {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 12px;
    align-items: center;
  }

  .tb-fighter {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tb-fighter.right { align-items: flex-end; }

  .tb-fighter-name {
    font-family: 'Orbitron', monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
  }

  .tb-hp-bar-wrap {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
    height: 14px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    position: relative;
  }

  .tb-hp-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
  }

  .tb-hp-bar::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 40%;
    background: rgba(255,255,255,0.2);
    border-radius: 4px 4px 0 0;
  }

  .tb-hp-text {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    color: var(--text2);
  }

  .tb-vs-badge {
    font-family: 'Orbitron', monospace;
    font-size: 20px;
    font-weight: 900;
    color: var(--gold);
    text-shadow: 0 0 20px rgba(255,215,0,0.7);
    animation: vsPulse 1.5s ease-in-out infinite;
    padding: 0 8px;
  }

  @keyframes vsPulse {
    0%,100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* ── Countdown ── */
  .tb-countdown {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    background: rgba(5,10,15,0.85);
    backdrop-filter: blur(4px);
  }

  .tb-countdown-num {
    font-family: 'Orbitron', monospace;
    font-size: clamp(80px, 20vw, 160px);
    font-weight: 900;
    animation: countAnim 0.9s ease-out forwards;
    background: linear-gradient(180deg, var(--neon), var(--neon3));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 40px rgba(0,245,255,0.8));
  }

  @keyframes countAnim {
    0% { transform: scale(1.5); opacity: 0; }
    40% { transform: scale(1); opacity: 1; }
    80% { transform: scale(0.95); opacity: 1; }
    100% { transform: scale(0.8); opacity: 0; }
  }

  /* ── Word Prompt ── */
  .tb-word-display {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    position: relative;
  }

  .tb-word-label { font-size: 11px; letter-spacing: 4px; color: var(--text2); margin-bottom: 12px; font-family: 'Share Tech Mono', monospace; }

  .tb-word-chars {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(20px, 4vw, 32px);
    letter-spacing: 6px;
    line-height: 1.6;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
  }

  .tb-char { transition: color 0.1s; }
  .tb-char.correct { color: var(--green); }
  .tb-char.wrong { color: var(--red); text-decoration: underline; }
  .tb-char.current {
    color: var(--neon);
    background: rgba(0,245,255,0.12);
    border-radius: 3px;
    animation: blink 0.8s step-end infinite;
  }
  .tb-char.pending { color: var(--text2); }

  @keyframes blink {
    0%,100% { background: rgba(0,245,255,0.12); }
    50% { background: transparent; }
  }

  /* ── Typing Input ── */
  .tb-input-zone {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .tb-typing-input {
    flex: 1;
    background: var(--panel);
    border: 2px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'Share Tech Mono', monospace;
    font-size: 20px;
    letter-spacing: 3px;
    padding: 16px 20px;
    outline: none;
    transition: all 0.2s;
    caret-color: var(--neon);
  }

  .tb-typing-input:focus { border-color: var(--neon); box-shadow: var(--glow); }
  .tb-typing-input.correct-input { border-color: var(--green); box-shadow: var(--glow3); }
  .tb-typing-input.wrong-input { border-color: var(--red); animation: shakeInput 0.3s ease; }

  @keyframes shakeInput {
    0%,100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }

  /* ── Stats Row ── */
  .tb-stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .tb-stat {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    text-align: center;
  }

  .tb-stat-val {
    font-family: 'Orbitron', monospace;
    font-size: 22px;
    font-weight: 700;
    color: var(--neon);
  }

  .tb-stat-label { font-size: 10px; letter-spacing: 3px; color: var(--text2); margin-top: 4px; }

  /* ── Combat Feed ── */
  .tb-combat-feed {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    height: 100px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tb-feed-item {
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    color: var(--text2);
    animation: feedIn 0.3s ease;
  }

  @keyframes feedIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .tb-feed-item.hit { color: var(--orange); }
  .tb-feed-item.crit { color: var(--neon2); }
  .tb-feed-item.good { color: var(--green); }
  .tb-feed-item.info { color: var(--neon); }

  /* ── Timer Bar ── */
  .tb-timer-wrap {
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
    overflow: hidden;
  }

  .tb-timer-bar {
    height: 100%;
    border-radius: 3px;
    transition: width 1s linear, background 0.5s;
  }

  /* ── Power-up Panel ── */
  .tb-powers {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .tb-power-btn {
    background: var(--panel2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    color: var(--text2);
    min-width: 70px;
  }

  .tb-power-btn:not(:disabled):hover {
    border-color: var(--power-color, var(--neon));
    box-shadow: 0 0 12px var(--power-shadow, rgba(0,245,255,0.3));
    transform: translateY(-2px);
    color: var(--text);
  }

  .tb-power-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .tb-power-icon { font-size: 22px; }
  .tb-power-key { font-size: 9px; background: rgba(255,255,255,0.08); padding: 2px 5px; border-radius: 3px; }

  /* ── Result Screen ── */
  .tb-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    min-height: calc(100vh - 100px);
    gap: 28px;
    text-align: center;
  }

  .tb-result-banner {
    font-family: 'Orbitron', monospace;
    font-size: clamp(28px, 8vw, 56px);
    font-weight: 900;
    letter-spacing: 6px;
    animation: resultReveal 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes resultReveal {
    from { transform: scale(0.5) rotate(-5deg); opacity: 0; }
    to { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  .tb-result-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    max-width: 400px;
    width: 100%;
  }

  .tb-result-stat {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
  }

  .tb-result-val {
    font-family: 'Orbitron', monospace;
    font-size: 32px;
    font-weight: 700;
  }

  .tb-result-label { font-size: 12px; letter-spacing: 3px; color: var(--text2); margin-top: 6px; }

  .tb-btn-group { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── Damage Float ── */
  .tb-damage-float {
    position: fixed;
    font-family: 'Orbitron', monospace;
    font-weight: 900;
    font-size: 28px;
    pointer-events: none;
    z-index: 999;
    animation: floatUp 1.2s ease-out forwards;
  }

  @keyframes floatUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-80px) scale(0.6); opacity: 0; }
  }

  /* ── Screen flash ── */
  .tb-flash {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 50;
    opacity: 0;
    border-radius: 0;
  }

  .tb-flash.active {
    animation: flashAnim 0.4s ease-out;
  }

  @keyframes flashAnim {
    0% { opacity: 0.35; }
    100% { opacity: 0; }
  }

  /* ── Responsive ── */
  @media (max-width: 500px) {
    .tb-stats-row { grid-template-columns: repeat(2, 1fr); }
    .tb-health-section { grid-template-columns: 1fr auto 1fr; }
    .tb-result-stats { grid-template-columns: 1fr 1fr; }
  }
`;

// ── Constants ─────────────────────────────────────────────────────────────────
const WORD_BANK = [
  "quantum","cipher","nexus","vertex","pixel","cache","node","stack","loop",
  "grid","byte","core","flux","sync","void","data","code","hack","scan","boot",
  "flag","mask","port","root","auth","ping","zero","base","null","true",
  "binary","matrix","vector","scalar","buffer","kernel","socket","thread",
  "deploy","server","client","module","render","syntax","debug","patch",
  "proxy","block","chain","token","forge","blaze","storm","clash","ultra",
  "turbo","hyper","rapid","swift","quick","sharp","power","ghost","blade",
  "laser","cyber","neon","rebel","alpha","delta","omega","sigma"
];

const AVATARS = ["🤖","👾","🧊","🔥","⚡","💎","🎯","🦾","👺","🐉"];
const BOT_NAMES = ["CIPHER_X","N3ON_GHOST","BYTE_BLAZE","ZERO_COOL","D4TA_STORM"];

function getRandWord() { return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]; }
function getPrompt(count = 6) {
  let words = [];
  for (let i = 0; i < count; i++) words.push(getRandWord());
  return words.join(" ");
}

const GAME_DURATION = 60;
const MAX_HP = 100;

// ── Power-up definitions ──────────────────────────────────────────────────────
const POWERS = [
  { id: "shield",  icon: "🛡️", label: "SHIELD",  key: "1", desc: "Block next hit", cooldown: 18, color: "#00f5ff", shadow: "rgba(0,245,255,0.3)" },
  { id: "boost",   icon: "⚡", label: "BOOST",   key: "2", desc: "+2x damage",    cooldown: 15, color: "#ffd700", shadow: "rgba(255,215,0,0.3)" },
  { id: "heal",    icon: "💊", label: "HEAL",    key: "3", desc: "+15 HP",         cooldown: 20, color: "#00ff88", shadow: "rgba(0,255,136,0.3)" },
  { id: "slow",    icon: "🌀", label: "SLOW",    key: "4", desc: "Freeze enemy",   cooldown: 22, color: "#ff006e", shadow: "rgba(255,0,110,0.3)" },
];

// ── AI Opponent simulation ────────────────────────────────────────────────────
function createBot(difficulty = "medium") {
  const wpm = difficulty === "easy" ? 25 : difficulty === "medium" ? 55 : 85;
  return { wpm, variance: 15, name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TypingBattle() {
  const [screen, setScreen] = useState("menu"); // menu | lobby | battle | result
  const [playerName, setPlayerName] = useState("PLAYER_1");
  const [gameMode, setGameMode] = useState("vs_bot");
  const [difficulty, setDifficulty] = useState("medium");

  // Battle state
  const [prompt, setPrompt] = useState("");
  const [typed, setTyped] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [errors, setErrors] = useState(0);
  const [playerHP, setPlayerHP] = useState(MAX_HP);
  const [botHP, setBotHP] = useState(MAX_HP);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [inputClass, setInputClass] = useState("");
  const [shieldActive, setShieldActive] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [cooldowns, setCooldowns] = useState({});
  const [damageFloats, setDamageFloats] = useState([]);
  const [flashColor, setFlashColor] = useState("");
  const [flashActive, setFlashActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [botSlowed, setBotSlowed] = useState(false);
  const [roundsWon, setRoundsWon] = useState(0);
  const [roundsLost, setRoundsLost] = useState(0);

  const inputRef = useRef(null);
  const botIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const feedRef = useRef(null);
  const startTimeRef = useRef(null);
  const correctWordsRef = useRef(0);
  const promptWordsRef = useRef([]);

  const addLog = useCallback((msg, type = "info") => {
    setCombatLog(prev => [...prev.slice(-20), { msg, type, id: Date.now() + Math.random() }]);
    setTimeout(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, 50);
  }, []);

  const spawnFloat = useCallback((text, color, x, y) => {
    const id = Date.now() + Math.random();
    setDamageFloats(prev => [...prev, { id, text, color, x, y }]);
    setTimeout(() => setDamageFloats(prev => prev.filter(f => f.id !== id)), 1300);
  }, []);

  const triggerFlash = useCallback((color) => {
    setFlashColor(color);
    setFlashActive(false);
    requestAnimationFrame(() => setFlashActive(true));
    setTimeout(() => setFlashActive(false), 450);
  }, []);

  // Deal damage to bot
  const dealDamage = useCallback((dmg) => {
    const finalDmg = boostActive ? dmg * 2 : dmg;
    setBotHP(prev => Math.max(0, prev - finalDmg));
    spawnFloat(`-${finalDmg}`, boostActive ? "#ffd700" : "#ff2244", window.innerWidth * 0.7, window.innerHeight * 0.35);
    triggerFlash(boostActive ? "rgba(255,215,0,0.15)" : "rgba(255,34,68,0.15)");
    addLog(boostActive ? `💥 CRIT! You deal ${finalDmg} damage!` : `⚔️ You deal ${finalDmg} damage`, boostActive ? "crit" : "hit");
    setBoostActive(false);
  }, [boostActive, spawnFloat, triggerFlash, addLog]);

  // Bot deals damage to player
  const botDealDamage = useCallback((dmg) => {
    if (shieldActive) {
      addLog("🛡️ SHIELD BLOCKED enemy attack!", "good");
      setShieldActive(false);
      spawnFloat("BLOCKED", "#00f5ff", window.innerWidth * 0.3, window.innerHeight * 0.35);
      return;
    }
    setPlayerHP(prev => Math.max(0, prev - dmg));
    spawnFloat(`-${dmg}`, "#ff8800", window.innerWidth * 0.25, window.innerHeight * 0.35);
    triggerFlash("rgba(255,34,68,0.2)");
    addLog(`💢 Enemy deals ${dmg} damage!`, "hit");
  }, [shieldActive, spawnFloat, triggerFlash, addLog]);

  // Start countdown then battle
  const startBattle = useCallback(() => {
    const words = getPrompt(40);
    setPrompt(words);
    promptWordsRef.current = words.split(" ");
    setTyped("");
    setWordIndex(0);
    setCharIndex(0);
    setCorrectWords(0);
    correctWordsRef.current = 0;
    setTotalTyped(0);
    setErrors(0);
    setPlayerHP(MAX_HP);
    setBotHP(MAX_HP);
    setTimeLeft(GAME_DURATION);
    setCombatLog([]);
    setWpm(0);
    setAccuracy(100);
    setShieldActive(false);
    setBoostActive(false);
    setCooldowns({});
    setBotSlowed(false);
    setInputClass("");

    let c = 3;
    setCountdown(c);
    setScreen("battle");

    const cdInterval = setInterval(() => {
      c--;
      if (c > 0) {
        setCountdown(c);
      } else {
        clearInterval(cdInterval);
        setCountdown(null);
        setIsRunning(true);
        startTimeRef.current = Date.now();
        if (inputRef.current) inputRef.current.focus();
      }
    }, 1000);
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Check end conditions
  useEffect(() => {
    if (!isRunning) return;
    if (playerHP <= 0 || botHP <= 0 || timeLeft <= 0) {
      setIsRunning(false);
      if (playerHP > botHP) setRoundsWon(r => r + 1);
      else if (botHP < playerHP) setRoundsLost(r => r + 1);
      setTimeout(() => setScreen("result"), 500);
    }
  }, [playerHP, botHP, timeLeft, isRunning]);

  // Bot AI
  useEffect(() => {
    if (!isRunning) return;
    const bot = createBot(difficulty);
    const msPerWord = 60000 / (botSlowed ? bot.wpm * 0.4 : bot.wpm + (Math.random() - 0.5) * bot.variance);

    botIntervalRef.current = setInterval(() => {
      if (!isRunning) return;
      const dmg = Math.floor(Math.random() * 8) + 5;
      botDealDamage(dmg);
    }, msPerWord * 2.5);

    return () => clearInterval(botIntervalRef.current);
  }, [isRunning, difficulty, botSlowed, botDealDamage]);

  // Handle typing
  const handleTyping = useCallback((e) => {
    if (!isRunning) return;
    const val = e.target.value;
    const words = promptWordsRef.current;
    const currentWord = words[wordIndex] || "";

    // Space = submit word
    if (val.endsWith(" ")) {
      const attempt = val.trim();
      if (attempt === currentWord) {
        // Correct word!
        const dmg = Math.floor(currentWord.length * 1.8) + Math.floor(Math.random() * 5);
        dealDamage(dmg);
        setInputClass("correct-input");
        setCorrectWords(c => { correctWordsRef.current = c + 1; return c + 1; });
        addLog(`✅ "${currentWord}" — +${dmg} dmg`, "good");
      } else {
        // Wrong word
        const penalty = 6;
        setPlayerHP(prev => Math.max(0, prev - penalty));
        setErrors(err => err + 1);
        setInputClass("wrong-input");
        triggerFlash("rgba(255,34,68,0.15)");
        addLog(`❌ Mistype! -${penalty} HP`, "hit");
      }

      setTimeout(() => setInputClass(""), 300);
      setWordIndex(w => w + 1);
      setCharIndex(0);
      setTyped("");
      setTotalTyped(t => t + 1);

      // Calc WPM & accuracy
      const elapsed = (Date.now() - startTimeRef.current) / 60000;
      if (elapsed > 0) setWpm(Math.round(correctWordsRef.current / elapsed));
      setAccuracy(prev => {
        const tot = totalTyped + 1;
        return tot > 0 ? Math.round((correctWordsRef.current / tot) * 100) : 100;
      });

      // New prompt if near end
      if (wordIndex >= words.length - 5) {
        const extra = getPrompt(20);
        promptWordsRef.current = [...promptWordsRef.current, ...extra.split(" ")];
        setPrompt(prev => prev + " " + extra);
      }
    } else {
      setTyped(val);
      setCharIndex(val.length);
    }
  }, [isRunning, wordIndex, totalTyped, dealDamage, addLog, triggerFlash]);

  // Render word prompt with highlights
  const renderPrompt = useCallback(() => {
    const words = promptWordsRef.current;
    const visible = words.slice(Math.max(0, wordIndex - 2), wordIndex + 8);
    const offset = Math.max(0, wordIndex - 2);

    return visible.map((word, wi) => {
      const globalIdx = wi + offset;
      return (
        <span key={globalIdx} style={{ marginRight: "16px", display: "inline-flex" }}>
          {word.split("").map((ch, ci) => {
            let cls = "pending";
            if (globalIdx < wordIndex) cls = "correct";
            else if (globalIdx === wordIndex) {
              if (ci < typed.length) cls = typed[ci] === ch ? "correct" : "wrong";
              else if (ci === typed.length) cls = "current";
            }
            return <span key={ci} className={`tb-char ${cls}`}>{ch}</span>;
          })}
        </span>
      );
    });
  }, [wordIndex, typed]);

  // Power-up usage
  const usePower = useCallback((power) => {
    if (cooldowns[power.id]) return;
    if (power.id === "shield") {
      setShieldActive(true);
      addLog("🛡️ SHIELD activated!", "info");
    } else if (power.id === "boost") {
      setBoostActive(true);
      addLog("⚡ BOOST ready — next hit x2!", "info");
    } else if (power.id === "heal") {
      setPlayerHP(prev => Math.min(MAX_HP, prev + 15));
      spawnFloat("+15 HP", "#00ff88", window.innerWidth * 0.4, window.innerHeight * 0.5);
      addLog("💊 Healed 15 HP", "good");
    } else if (power.id === "slow") {
      setBotSlowed(true);
      addLog("🌀 Enemy SLOWED!", "crit");
      setTimeout(() => { setBotSlowed(false); addLog("🌀 Enemy speed restored", "info"); }, 5000);
    }
    setCooldowns(prev => ({ ...prev, [power.id]: true }));
    setTimeout(() => setCooldowns(prev => { const n = { ...prev }; delete n[power.id]; return n; }), power.cooldown * 1000);
  }, [cooldowns, addLog, spawnFloat]);

  // Keyboard shortcuts for powers
  useEffect(() => {
    const handler = (e) => {
      if (!isRunning) return;
      POWERS.forEach(p => { if (e.key === p.key) usePower(p); });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning, usePower]);

  const hpColor = (hp) => {
    if (hp > 60) return "#00ff88";
    if (hp > 30) return "#ff8800";
    return "#ff2244";
  };

  const timerColor = timeLeft > 30 ? "#00f5ff" : timeLeft > 10 ? "#ff8800" : "#ff2244";

  return (
    <>
      <style>{STYLE}</style>
      <div className="tb-root">
        {/* Damage floats */}
        {damageFloats.map(f => (
          <div key={f.id} className="tb-damage-float" style={{ color: f.color, left: f.x, top: f.y }}>{f.text}</div>
        ))}
        {/* Screen flash */}
        <div className="tb-flash" style={{ background: flashColor, ...(flashActive ? {} : {}) }}
          key={flashActive ? "active" : "idle"}
          onAnimationEnd={() => setFlashActive(false)} />

        <div className="tb-content">
          {/* HEADER */}
          <div className="tb-header">
            <div className="tb-logo">⚔ TYPE BATTLE ⚔</div>
            <div className="tb-tagline">[ MULTIPLAYER TYPING ARENA — SEASON 1 ]</div>
          </div>

          {/* ── MENU ── */}
          {screen === "menu" && (
            <div className="tb-menu">
              <div className="tb-name-input-wrap">
                <div className="tb-name-label">[ ENTER YOUR CALLSIGN ]</div>
                <input
                  className="tb-name-input"
                  value={playerName}
                  maxLength={16}
                  onChange={e => setPlayerName(e.target.value.toUpperCase())}
                  placeholder="PLAYER_1"
                />
              </div>

              <div className="tb-menu-cards">
                {[
                  { mode: "vs_bot", icon: "🤖", name: "VS BOT", desc: "Battle an AI opponent. Choose your difficulty.", color: "#00f5ff", glow: "linear-gradient(rgba(0,245,255,0.06),transparent)", shadow: "rgba(0,245,255,0.2)" },
                  { mode: "vs_bot_hard", icon: "🔥", name: "HARDCORE", desc: "No mercy mode. Face elite AI.", color: "#ff2244", glow: "linear-gradient(rgba(255,34,68,0.06),transparent)", shadow: "rgba(255,34,68,0.2)" },
                  { mode: "survival", icon: "💀", name: "SURVIVAL", desc: "Last as long as you can. No healing.", color: "#ffd700", glow: "linear-gradient(rgba(255,215,0,0.06),transparent)", shadow: "rgba(255,215,0,0.2)" },
                ].map(card => (
                  <div key={card.mode} className="tb-mode-card"
                    style={{ "--card-color": card.color, "--card-glow": card.glow, "--card-shadow": card.shadow }}
                    onClick={() => {
                      setGameMode(card.mode);
                      setDifficulty(card.mode === "vs_bot_hard" ? "hard" : card.mode === "survival" ? "hard" : "medium");
                      setScreen("lobby");
                    }}>
                    <div className="tb-mode-icon">{card.icon}</div>
                    <div className="tb-mode-name">{card.name}</div>
                    <div className="tb-mode-desc">{card.desc}</div>
                  </div>
                ))}
              </div>

              {/* Leaderboard stub */}
              <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 28px", maxWidth: 400, width: "100%" }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, letterSpacing: 4, color: "var(--gold)", marginBottom: 14 }}>🏆 LEADERBOARD</div>
                {["CIPHER_X — 142 WPM", "N3ON_GHOST — 138 WPM", "BYTE_BLAZE — 121 WPM", "ZERO_COOL — 117 WPM"].map((entry, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13, fontFamily: "'Share Tech Mono',monospace", color: i === 0 ? "var(--gold)" : "var(--text2)" }}>
                    <span>#{i + 1} {entry.split(" — ")[0]}</span>
                    <span style={{ color: "var(--neon)" }}>{entry.split(" — ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LOBBY ── */}
          {screen === "lobby" && (
            <div className="tb-lobby">
              <div className="tb-lobby-title">⚔ BATTLE LOBBY</div>
              <div className="tb-room-code">
                <div className="tb-room-label">[ ROOM CODE ]</div>
                <div className="tb-room-id">{Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
              </div>

              <div className="tb-players-grid">
                <div className="tb-player-slot filled">
                  <div className="tb-player-avatar">{AVATARS[Math.floor(Math.random() * AVATARS.length)]}</div>
                  <div className="tb-player-name">{playerName || "PLAYER_1"}</div>
                  <div className="tb-player-badge">YOU</div>
                  <div className="tb-player-ready">✔ READY</div>
                </div>
                <div className="tb-player-slot filled">
                  <div className="tb-player-avatar">🤖</div>
                  <div className="tb-player-name">{BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]}</div>
                  <div className="tb-player-badge">{difficulty.toUpperCase()} BOT</div>
                  <div className="tb-player-ready">✔ READY</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="tb-btn tb-btn-primary" onClick={startBattle}>⚡ START BATTLE</button>
                <button className="tb-btn tb-btn-ghost" onClick={() => setScreen("menu")}>← BACK</button>
              </div>
            </div>
          )}

          {/* ── BATTLE ── */}
          {screen === "battle" && (
            <>
              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="tb-countdown">
                  <div className="tb-countdown-num" key={countdown}>{countdown === 0 ? "FIGHT!" : countdown}</div>
                </div>
              )}

              <div className="tb-arena">
                {/* Timer bar */}
                <div className="tb-timer-wrap">
                  <div className="tb-timer-bar" style={{
                    width: `${(timeLeft / GAME_DURATION) * 100}%`,
                    background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`,
                    boxShadow: `0 0 8px ${timerColor}`
                  }} />
                </div>

                {/* Health bars */}
                <div className="tb-health-section">
                  {/* Player */}
                  <div className="tb-fighter">
                    <div className="tb-fighter-name" style={{ color: "var(--neon)" }}>{playerName || "PLAYER_1"}</div>
                    <div className="tb-hp-bar-wrap">
                      <div className="tb-hp-bar" style={{
                        width: `${(playerHP / MAX_HP) * 100}%`,
                        background: `linear-gradient(90deg, ${hpColor(playerHP)}, ${hpColor(playerHP)}88)`,
                        boxShadow: `0 0 10px ${hpColor(playerHP)}88`
                      }} />
                    </div>
                    <div className="tb-hp-text">
                      {playerHP}/{MAX_HP} HP
                      {shieldActive && " 🛡️"}
                      {boostActive && " ⚡"}
                    </div>
                  </div>

                  <div className="tb-vs-badge">VS</div>

                  {/* Bot */}
                  <div className="tb-fighter right">
                    <div className="tb-fighter-name" style={{ color: "var(--neon2)", textAlign: "right" }}>
                      {difficulty === "hard" ? "ELITE BOT" : "BOT"}
                    </div>
                    <div className="tb-hp-bar-wrap" style={{ direction: "rtl" }}>
                      <div className="tb-hp-bar" style={{
                        width: `${(botHP / MAX_HP) * 100}%`,
                        background: `linear-gradient(90deg, ${hpColor(botHP)}88, ${hpColor(botHP)})`,
                        boxShadow: `0 0 10px ${hpColor(botHP)}88`
                      }} />
                    </div>
                    <div className="tb-hp-text" style={{ textAlign: "right" }}>
                      {botHP}/{MAX_HP} HP
                      {botSlowed && " 🌀"}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="tb-stats-row">
                  <div className="tb-stat">
                    <div className="tb-stat-val" style={{ color: "var(--neon)" }}>{wpm}</div>
                    <div className="tb-stat-label">WPM</div>
                  </div>
                  <div className="tb-stat">
                    <div className="tb-stat-val" style={{ color: "var(--green)" }}>{accuracy}%</div>
                    <div className="tb-stat-label">ACCURACY</div>
                  </div>
                  <div className="tb-stat">
                    <div className="tb-stat-val" style={{ color: "var(--gold)" }}>{correctWords}</div>
                    <div className="tb-stat-label">WORDS</div>
                  </div>
                  <div className="tb-stat">
                    <div className="tb-stat-val" style={{ color: timeLeft <= 10 ? "var(--red)" : "var(--neon)" }}>{timeLeft}s</div>
                    <div className="tb-stat-label">TIME</div>
                  </div>
                </div>

                {/* Word display */}
                <div className="tb-word-display">
                  <div className="tb-word-label">[ TYPE TO ATTACK ]</div>
                  <div className="tb-word-chars">{renderPrompt()}</div>
                </div>

                {/* Input */}
                <div className="tb-input-zone">
                  <input
                    ref={inputRef}
                    className={`tb-typing-input ${inputClass}`}
                    value={typed}
                    onChange={handleTyping}
                    placeholder={isRunning ? "type here and press space..." : "waiting..."}
                    disabled={!isRunning}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>

                {/* Power-ups */}
                <div className="tb-powers">
                  {POWERS.map(p => (
                    <button
                      key={p.id}
                      className="tb-power-btn"
                      style={{ "--power-color": p.color, "--power-shadow": p.shadow }}
                      onClick={() => usePower(p)}
                      disabled={!!cooldowns[p.id] || !isRunning}
                      title={p.desc}
                    >
                      <span className="tb-power-icon">{p.icon}</span>
                      <span>{p.label}</span>
                      <span className="tb-power-key">[{p.key}]</span>
                      {cooldowns[p.id] && <span style={{ fontSize: 9, color: "var(--text2)" }}>CD</span>}
                    </button>
                  ))}
                </div>

                {/* Combat log */}
                <div className="tb-combat-feed" ref={feedRef}>
                  {combatLog.length === 0 && (
                    <div className="tb-feed-item">&gt; Battle started. Type fast and deal damage!</div>
                  )}
                  {combatLog.map(entry => (
                    <div key={entry.id} className={`tb-feed-item ${entry.type}`}>&gt; {entry.msg}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── RESULT ── */}
          {screen === "result" && (() => {
            const won = playerHP > botHP || (timeLeft <= 0 && playerHP > botHP);
            const draw = playerHP === botHP;
            return (
              <div className="tb-result">
                <div className="tb-result-banner" style={{
                  color: draw ? "var(--gold)" : won ? "var(--green)" : "var(--red)",
                  filter: `drop-shadow(0 0 30px ${draw ? "rgba(255,215,0,0.7)" : won ? "rgba(0,255,136,0.7)" : "rgba(255,34,68,0.7)"})`
                }}>
                  {draw ? "⚡ DRAW" : won ? "🏆 VICTORY" : "💀 DEFEAT"}
                </div>

                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 14, color: "var(--text2)", letterSpacing: 2 }}>
                  {won ? "Enemy eliminated. Excellent typing!" : draw ? "Evenly matched!" : "You were defeated. Train harder."}
                </div>

                <div className="tb-result-stats">
                  <div className="tb-result-stat">
                    <div className="tb-result-val" style={{ color: "var(--neon)" }}>{wpm}</div>
                    <div className="tb-result-label">PEAK WPM</div>
                  </div>
                  <div className="tb-result-stat">
                    <div className="tb-result-val" style={{ color: "var(--green)" }}>{accuracy}%</div>
                    <div className="tb-result-label">ACCURACY</div>
                  </div>
                  <div className="tb-result-stat">
                    <div className="tb-result-val" style={{ color: "var(--gold)" }}>{correctWords}</div>
                    <div className="tb-result-label">WORDS HIT</div>
                  </div>
                  <div className="tb-result-stat">
                    <div className="tb-result-val" style={{ color: "var(--neon2)" }}>{errors}</div>
                    <div className="tb-result-label">ERRORS</div>
                  </div>
                </div>

                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: "var(--text2)" }}>
                  SESSION — W: <span style={{ color: "var(--green)" }}>{roundsWon}</span> / L: <span style={{ color: "var(--red)" }}>{roundsLost}</span>
                </div>

                <div className="tb-btn-group">
                  <button className="tb-btn tb-btn-primary" onClick={startBattle}>⚡ REMATCH</button>
                  <button className="tb-btn tb-btn-ghost" onClick={() => setScreen("lobby")}>↩ LOBBY</button>
                  <button className="tb-btn tb-btn-ghost" onClick={() => setScreen("menu")}>⌂ MENU</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}