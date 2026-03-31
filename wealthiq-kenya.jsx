import { useState, useEffect, useRef } from "react";

const ACCENT = "#C9A84C";
const ACCENT2 = "#E8C76A";
const BG = "#0A0B0D";
const SURFACE = "#111318";
const SURFACE2 = "#181C24";
const BORDER = "#1E2530";
const TEXT = "#E8EAF0";
const MUTED = "#6B7280";
const GREEN = "#22C55E";
const RED = "#EF4444";
const BLUE = "#3B82F6";

const portfolio = {
  total: 142_800_000,
  change: 4.7,
  assets: [
    { name: "Real Estate", value: 85_680_000, pct: 60, change: 6.2, icon: "🏙️" },
    { name: "NSE Equities", value: 28_560_000, pct: 20, change: 2.1, icon: "📈" },
    { name: "SACCOs & MMF", value: 17_136_000, pct: 12, change: 8.4, icon: "🏦" },
    { name: "Crypto", value: 8_568_000, pct: 6, change: -3.2, icon: "₿" },
    { name: "Private Equity", value: 2_856_000, pct: 2, change: 11.0, icon: "🔒" },
  ],
};

const marketSignals = [
  { label: "Kilimani Apt", value: "KSh 18.2M", trend: "+8.1%", hot: true },
  { label: "Karen Villa", value: "KSh 45.5M", trend: "+3.4%", hot: false },
  { label: "Westlands Comm", value: "KSh 12.8M", trend: "+12.2%", hot: true },
  { label: "Runda Estate", value: "KSh 62.0M", trend: "+1.9%", hot: false },
  { label: "Tatu City Plot", value: "KSh 8.7M", trend: "+22.5%", hot: true },
  { label: "Upperhill Off", value: "KSh 35.1M", trend: "+5.6%", hot: false },
];

const nseStocks = [
  { ticker: "SCOM", name: "Safaricom", price: "KSh 24.35", change: "+1.2%" },
  { ticker: "EQTY", name: "Equity Group", price: "KSh 58.90", change: "+3.1%" },
  { ticker: "KCB", name: "KCB Group", price: "KSh 43.20", change: "-0.8%" },
  { ticker: "EABL", name: "E.A Breweries", price: "KSh 162.00", change: "+0.5%" },
  { ticker: "BAT", name: "BAT Kenya", price: "KSh 480.00", change: "-1.4%" },
];

const fxRates = [
  { pair: "USD/KES", rate: "132.40", change: "+0.3%" },
  { pair: "EUR/KES", rate: "143.75", change: "-0.1%" },
  { pair: "GBP/KES", rate: "168.20", change: "+0.7%" },
  { pair: "AED/KES", rate: "36.05", change: "0.0%" },
];

const SYSTEM_PROMPT = `You are WealthIQ, an elite AI wealth advisor for Kenya's high-net-worth individuals (HNWIs). Your clients are CEOs, lawyers, real estate moguls, and top executives earning KSh 50M+ annually.

You have deep expertise in:
- Kenyan real estate (Nairobi hotspots: Kilimani, Karen, Westlands, Runda, Tatu City)
- Nairobi Securities Exchange (NSE) equities
- SACCOs and Money Market Funds in Kenya
- Cryptocurrency in the Kenyan context
- Currency risk management (KES/USD/EUR)
- Private equity and family office structures
- Tax optimization under Kenyan law
- Global wealth trends affecting African HNWIs

Be concise, direct, and speak as a trusted advisor to a billionaire. Use specific numbers, Kenyan context, and actionable advice. Keep responses under 200 words. Reference M-Pesa, CBK, KRA, CMA when relevant. Occasionally mention KSh figures.`;

function fmt(n) {
  if (n >= 1e9) return "KSh " + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "KSh " + (n / 1e6).toFixed(1) + "M";
  return "KSh " + n.toLocaleString();
}

function Spinner() {
  return (
    <span style={{ display: "inline-block", width: 16, height: 16, border: `2px solid ${ACCENT}44`, borderTop: `2px solid ${ACCENT}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
  );
}

function PortfolioDonut({ assets }) {
  const size = 160;
  const r = 58;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const colors = [ACCENT, BLUE, GREEN, "#A855F7", "#F97316"];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 10} fill={SURFACE} />
      {assets.map((a, i) => {
        const dash = (a.pct / 100) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={colors[i]}
            strokeWidth="18"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circumference / 100}
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity="0.9"
          />
        );
        offset += a.pct;
        return el;
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={TEXT} fontSize="11" fontFamily="'Cormorant Garamond', serif" fontWeight="600">Portfolio</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={ACCENT} fontSize="10" fontFamily="'Cormorant Garamond', serif">KSh 142.8M</text>
    </svg>
  );
}

export default function WealthIQ() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Jambo. I'm your WealthIQ advisor. Your portfolio is up **4.7%** this quarter — outperforming NSE by 2.3 pts. What's on your agenda today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const chatRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = [...messages, { role: "user", content: userMsg }].map(m => ({
        role: m.role,
        content: m.content.replace(/\*\*/g, "")
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Unable to fetch response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  const quickPrompts = [
    "Where should I invest KSh 20M right now?",
    "Best Nairobi real estate hotspot Q2 2026?",
    "How do I hedge against KES depreciation?",
    "Review my portfolio diversification",
    "Tax-efficient wealth transfer strategies",
    "NSE stocks to watch this week",
  ];

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "advisor", label: "AI Advisor" },
    { id: "market", label: "Market Intel" },
    { id: "portfolio", label: "Portfolio" },
  ];

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: BG,
      minHeight: "100vh",
      color: TEXT,
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${SURFACE}}
        ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:4px}
        .tab-btn{
          padding:8px 18px;border:none;background:transparent;color:${MUTED};
          font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;
          cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;letter-spacing:0.02em;
        }
        .tab-btn.active{color:${ACCENT};border-bottom-color:${ACCENT};}
        .tab-btn:hover:not(.active){color:${TEXT};}
        .card{background:${SURFACE};border:1px solid ${BORDER};border-radius:12px;padding:20px;}
        .asset-bar{height:4px;border-radius:2px;background:#1E2530;overflow:hidden;margin-top:6px;}
        .quick-btn{
          background:${SURFACE2};border:1px solid ${BORDER};color:${MUTED};
          font-size:11px;padding:7px 12px;border-radius:20px;cursor:pointer;
          transition:all 0.2s;font-family:'DM Sans',sans-serif;white-space:nowrap;
        }
        .quick-btn:hover{border-color:${ACCENT}66;color:${ACCENT};background:${ACCENT}11;}
        .msg-bubble{animation:fadeUp 0.3s ease;}
        .signal-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid ${BORDER}11;}
        .signal-row:last-child{border-bottom:none;}
        .hot-badge{font-size:9px;background:${ACCENT}22;color:${ACCENT};padding:2px 7px;border-radius:10px;letter-spacing:0.06em;font-weight:600;}
      `}</style>

      {/* Background grid */}
      <div style={{
        position:"fixed",top:0,left:0,right:0,bottom:0,
        backgroundImage:`linear-gradient(${BORDER}44 1px,transparent 1px),linear-gradient(90deg,${BORDER}44 1px,transparent 1px)`,
        backgroundSize:"40px 40px",
        opacity:0.3,pointerEvents:"none",zIndex:0
      }}/>

      {/* Header */}
      <div style={{
        borderBottom:`1px solid ${BORDER}`,
        background:`${SURFACE}EE`,
        backdropFilter:"blur(12px)",
        position:"sticky",top:0,zIndex:100,
      }}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",gap:16,height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginRight:16}}>
            <div style={{
              width:32,height:32,background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,
              borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:16,fontWeight:700,color:BG,fontFamily:"'Cormorant Garamond',serif"
            }}>W</div>
            <div>
              <div style={{fontSize:15,fontWeight:600,letterSpacing:"0.04em",color:TEXT,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>WealthIQ</div>
              <div style={{fontSize:9,color:ACCENT,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:500}}>Kenya Elite</div>
            </div>
          </div>

          {tabs.map(t => (
            <button key={t.id} className={`tab-btn${activeTab===t.id?" active":""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}

          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:MUTED,letterSpacing:"0.04em"}}>PORTFOLIO VALUE</div>
              <div style={{fontSize:14,fontWeight:600,color:ACCENT,fontFamily:"'DM Mono',monospace"}}>KSh 142.8M</div>
            </div>
            <div style={{
              width:8,height:8,borderRadius:"50%",background:GREEN,
              animation:"pulse 2s infinite",boxShadow:`0 0 8px ${GREEN}`
            }}/>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px",position:"relative",zIndex:1}}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
              {[
                { label:"Total Wealth", value:"KSh 142.8M", sub:"+4.7% QoQ", color:ACCENT },
                { label:"Monthly Yield", value:"KSh 890K", sub:"+KSh 42K vs last mo", color:GREEN },
                { label:"NSE Portfolio", value:"KSh 28.6M", sub:"↑ SCOM, EQTY", color:BLUE },
                { label:"FX Exposure", value:"USD 215K", sub:"KES weakened 0.3%", color:"#F97316" },
              ].map((k, i) => (
                <div key={i} className="card" style={{position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,right:0,width:3,height:"100%",background:k.color,borderRadius:"0 12px 12px 0",opacity:0.7}}/>
                  <div style={{fontSize:10,color:MUTED,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{k.label}</div>
                  <div style={{fontSize:20,fontWeight:700,color:k.color,fontFamily:"'Cormorant Garamond',serif"}}>{k.value}</div>
                  <div style={{fontSize:11,color:MUTED,marginTop:4}}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {/* Allocation */}
              <div className="card">
                <div style={{fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Asset Allocation</div>
                <div style={{display:"flex",gap:20,alignItems:"center"}}>
                  <PortfolioDonut assets={portfolio.assets} />
                  <div style={{flex:1}}>
                    {portfolio.assets.map((a, i) => {
                      const colors = [ACCENT, BLUE, GREEN, "#A855F7", "#F97316"];
                      return (
                        <div key={i} style={{marginBottom:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontSize:12,color:TEXT}}>{a.icon} {a.name}</span>
                            <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:a.change >= 0 ? GREEN : RED}}>{a.change >= 0 ? "+" : ""}{a.change}%</span>
                          </div>
                          <div className="asset-bar">
                            <div style={{height:"100%",width:`${a.pct}%`,background:colors[i],borderRadius:2}}/>
                          </div>
                          <div style={{fontSize:10,color:MUTED,marginTop:2}}>{fmt(a.value)} · {a.pct}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Real Estate Hotspots */}
              <div className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:"0.08em"}}>Nairobi RE Signals</div>
                  <div style={{fontSize:10,color:ACCENT}}>Live · Q2 2026</div>
                </div>
                {marketSignals.map((s, i) => (
                  <div key={i} className="signal-row">
                    <span style={{fontSize:12,color:TEXT}}>{s.label}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {s.hot && <span className="hot-badge">HOT</span>}
                      <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:MUTED}}>{s.value}</span>
                      <span style={{fontSize:11,color:GREEN,fontFamily:"'DM Mono',monospace"}}>{s.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI ADVISOR */}
        {activeTab === "advisor" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:14,height:"70vh"}}>
              {/* Chat */}
              <div className="card" style={{display:"flex",flexDirection:"column",padding:0,overflow:"hidden"}}>
                <div style={{padding:"14px 18px",borderBottom:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:GREEN,animation:"pulse 2s infinite"}}/>
                  <span style={{fontSize:12,color:TEXT,fontWeight:500}}>WealthIQ AI Advisor</span>
                  <span style={{fontSize:10,color:MUTED,marginLeft:"auto"}}>Powered by Claude · Encrypted</span>
                </div>

                <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"18px 18px",display:"flex",flexDirection:"column",gap:14}}>
                  {messages.map((m, i) => (
                    <div key={i} className="msg-bubble" style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                      {m.role === "assistant" && (
                        <div style={{
                          width:28,height:28,flexShrink:0,
                          background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,
                          borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:12,fontWeight:700,color:BG,fontFamily:"'Cormorant Garamond',serif",
                          marginRight:10,marginTop:2
                        }}>W</div>
                      )}
                      <div style={{
                        maxWidth:"72%",
                        background:m.role==="user" ? `${ACCENT}22` : SURFACE2,
                        border:`1px solid ${m.role==="user"?ACCENT+"44":BORDER}`,
                        borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",
                        padding:"10px 14px",
                        fontSize:13,lineHeight:1.65,color:TEXT,
                      }}>
                        {m.content.split("**").map((part, j) =>
                          j % 2 === 1 ? <strong key={j} style={{color:ACCENT}}>{part}</strong> : part
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:28,height:28,background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:BG,fontFamily:"'Cormorant Garamond',serif"}}>W</div>
                      <Spinner />
                    </div>
                  )}
                </div>

                <div style={{padding:"12px 16px",borderTop:`1px solid ${BORDER}`}}>
                  <div style={{display:"flex",gap:8}}>
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Ask your advisor anything..."
                      style={{
                        flex:1,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,
                        padding:"10px 14px",color:TEXT,fontSize:13,fontFamily:"'DM Sans',sans-serif",
                        outline:"none",
                      }}
                    />
                    <button onClick={sendMessage} disabled={loading} style={{
                      background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,
                      border:"none",borderRadius:8,padding:"0 18px",
                      color:BG,fontWeight:600,cursor:"pointer",fontSize:13,
                      opacity:loading?0.6:1,
                    }}>Send</button>
                  </div>
                </div>
              </div>

              {/* Quick prompts */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div className="card">
                  <div style={{fontSize:10,color:MUTED,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Quick Insights</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {quickPrompts.map((p, i) => (
                      <button key={i} className="quick-btn" style={{textAlign:"left"}} onClick={() => { setInput(p); }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div style={{fontSize:10,color:MUTED,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Your Tier</div>
                  <div style={{fontSize:14,color:ACCENT,fontFamily:"'Cormorant Garamond',serif",fontWeight:700,marginBottom:4}}>Platinum HNWI</div>
                  <div style={{fontSize:11,color:MUTED,lineHeight:1.6}}>Portfolio KSh 100M+<br/>Dedicated AI advisor<br/>Priority market alerts<br/>Family office services</div>
                  <div style={{marginTop:12,padding:"8px 12px",background:`${ACCENT}11`,borderRadius:8,border:`1px solid ${ACCENT}33`,fontSize:11,color:ACCENT}}>
                    📊 Quarterly wealth review due Apr 15
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MARKET INTEL */}
        {activeTab === "market" && (
          <div style={{animation:"fadeUp 0.4s ease",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {/* NSE */}
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                <div style={{fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:"0.08em"}}>NSE Top Movers</div>
                <div style={{fontSize:10,color:GREEN}}>● Market Open</div>
              </div>
              {nseStocks.map((s, i) => (
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${BORDER}`}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:TEXT,fontFamily:"'DM Mono',monospace"}}>{s.ticker}</div>
                    <div style={{fontSize:11,color:MUTED}}>{s.name}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:TEXT}}>{s.price}</div>
                    <div style={{fontSize:11,color:s.change.startsWith("+") ? GREEN : RED}}>{s.change}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* FX */}
            <div className="card">
              <div style={{fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>FX Rates · KES Cross</div>
              {fxRates.map((r, i) => (
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${BORDER}`}}>
                  <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:TEXT,fontWeight:600}}>{r.pair}</span>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14,color:ACCENT,fontFamily:"'DM Mono',monospace"}}>{r.rate}</div>
                    <div style={{fontSize:11,color:r.change.startsWith("+") ? GREEN : r.change.startsWith("-") ? RED : MUTED}}>{r.change}</div>
                  </div>
                </div>
              ))}
              <div style={{marginTop:14,padding:"10px 14px",background:`${RED}11`,borderRadius:8,border:`1px solid ${RED}33`,fontSize:11,color:"#FCA5A5",lineHeight:1.5}}>
                ⚠️ KES depreciation risk: Consider increasing USD-denominated assets above 20% of portfolio
              </div>
            </div>

            {/* RE Heat Map */}
            <div className="card" style={{gridColumn:"1/-1"}}>
              <div style={{fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Nairobi Real Estate Intelligence · Q2 2026</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
                {marketSignals.map((s, i) => {
                  const pct = parseFloat(s.trend);
                  const heat = pct > 10 ? `${ACCENT}33` : pct > 5 ? `${GREEN}22` : `${BLUE}22`;
                  const heatBorder = pct > 10 ? `${ACCENT}66` : pct > 5 ? `${GREEN}44` : `${BLUE}44`;
                  return (
                    <div key={i} style={{background:heat,border:`1px solid ${heatBorder}`,borderRadius:10,padding:"14px 12px",textAlign:"center"}}>
                      <div style={{fontSize:10,color:MUTED,marginBottom:6,letterSpacing:"0.04em"}}>{s.label}</div>
                      <div style={{fontSize:12,color:TEXT,fontWeight:600,marginBottom:4}}>{s.value}</div>
                      <div style={{fontSize:14,fontWeight:700,color:pct > 10 ? ACCENT : pct > 5 ? GREEN : BLUE}}>{s.trend}</div>
                      {s.hot && <div style={{marginTop:6,fontSize:9,color:ACCENT,letterSpacing:"0.1em"}}>● HOT ZONE</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PORTFOLIO */}
        {activeTab === "portfolio" && (
          <div style={{animation:"fadeUp 0.4s ease",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div className="card" style={{gridColumn:"1/-1"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:"0.08em"}}>Total Wealth Under Management</div>
                  <div style={{fontSize:36,fontWeight:700,color:ACCENT,fontFamily:"'Cormorant Garamond',serif",lineHeight:1.1}}>KSh 142.8M</div>
                  <div style={{fontSize:13,color:GREEN,marginTop:4}}>▲ 4.7% this quarter · +KSh 6.4M</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:MUTED,marginBottom:4}}>vs NSE NASI Index</div>
                  <div style={{fontSize:22,fontWeight:700,color:GREEN,fontFamily:"'Cormorant Garamond',serif"}}>+2.3pts</div>
                  <div style={{fontSize:11,color:MUTED}}>Alpha generated</div>
                </div>
              </div>
              {/* Progress bars */}
              <div style={{height:6,background:BORDER,borderRadius:3,overflow:"hidden",display:"flex"}}>
                {portfolio.assets.map((a, i) => {
                  const colors = [ACCENT, BLUE, GREEN, "#A855F7", "#F97316"];
                  return <div key={i} style={{width:`${a.pct}%`,background:colors[i],height:"100%"}}/>;
                })}
              </div>
            </div>

            {portfolio.assets.map((a, i) => {
              const colors = [ACCENT, BLUE, GREEN, "#A855F7", "#F97316"];
              return (
                <div key={i} className="card" style={{borderTop:`3px solid ${colors[i]}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:22,marginBottom:6}}>{a.icon}</div>
                      <div style={{fontSize:14,fontWeight:600,color:TEXT}}>{a.name}</div>
                      <div style={{fontSize:11,color:MUTED,marginTop:2}}>{a.pct}% of portfolio</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:18,fontWeight:700,color:colors[i],fontFamily:"'Cormorant Garamond',serif"}}>{fmt(a.value)}</div>
                      <div style={{fontSize:12,color:a.change >= 0 ? GREEN : RED,marginTop:4}}>
                        {a.change >= 0 ? "▲" : "▼"} {Math.abs(a.change)}% YTD
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:14,padding:"8px 12px",background:SURFACE2,borderRadius:8,fontSize:11,color:MUTED}}>
                    {i===0 && "Kilimani, Westlands, Karen holdings"}
                    {i===1 && "SCOM 45% · EQTY 30% · KCB 25%"}
                    {i===2 && "Stima SACCO + CIC MMF 8.9% p.a."}
                    {i===3 && "BTC 60% · ETH 30% · Other 10%"}
                    {i===4 && "Series B SaaS · Agri-tech fund"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{textAlign:"center",padding:"16px 0 24px",color:MUTED,fontSize:10,letterSpacing:"0.06em"}}>
        WEALTHIQ KENYA · ELITE WEALTH INTELLIGENCE PLATFORM · ENCRYPTED · FOR ACCREDITED INVESTORS ONLY
      </div>
    </div>
  );
}
