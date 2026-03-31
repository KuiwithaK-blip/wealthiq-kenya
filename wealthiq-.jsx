import { useState, useEffect, useRef } from "react";

/* ─── THEME ─────────────────────────────────────────────── */
const C = {
  bg: "#08090C", surface: "#0F1117", surface2: "#161B25",
  border: "#1C2333", accent: "#C9A84C", accent2: "#E8C76A",
  text: "#E8EAF0", muted: "#5A6478", green: "#22C55E",
  red: "#EF4444", blue: "#3B82F6", purple: "#A855F7",
};

/* ─── PLANS ──────────────────────────────────────────────── */
const PLANS = [
  { id: "gold", label: "Gold", priceUSD: 500, priceKES: 66200, desc: "KSh 30M–100M portfolio", color: "#F59E0B", features: ["AI Wealth Advisor", "NSE + RE tracking", "FX alerts", "Monthly report"] },
  { id: "platinum", label: "Platinum", priceUSD: 2500, priceKES: 331000, desc: "KSh 100M+ portfolio", color: C.accent, features: ["Everything in Gold", "Family office tools", "Priority advisor", "Daily signals", "Tax optimisation"], popular: true },
  { id: "family", label: "Family Office", priceUSD: 5000, priceKES: 662000, desc: "Multi-portfolio management", color: C.purple, features: ["Everything in Platinum", "Dedicated RM", "Custom reporting", "Estate planning", "White-glove onboarding"] },
];

/* ─── HELPERS ────────────────────────────────────────────── */
function getStorage(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function setStorage(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

function trialDaysLeft(signupDate) {
  const diff = Date.now() - new Date(signupDate).getTime();
  return Math.max(0, 14 - Math.floor(diff / 86400000));
}

function fmt(n) {
  if (n >= 1e9) return "KSh " + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "KSh " + (n / 1e6).toFixed(1) + "M";
  return "KSh " + n.toLocaleString();
}

/* ─── SMALL COMPONENTS ───────────────────────────────────── */
function Spinner({ size = 18, color = C.accent }) {
  return <span style={{ display: "inline-block", width: size, height: size, border: `2px solid ${color}33`, borderTop: `2px solid ${color}`, borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />;
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>}
      <input {...props} style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border 0.2s", ...(props.style || {}) }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

function Btn({ children, variant = "primary", loading, disabled, style: s, ...props }) {
  const base = { padding: "11px 22px", borderRadius: 9, border: "none", cursor: disabled || loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", opacity: disabled || loading ? 0.6 : 1, ...s };
  const styles = {
    primary: { background: `linear-gradient(135deg,${C.accent},${C.accent2})`, color: C.bg },
    outline: { background: "transparent", border: `1px solid ${C.border}`, color: C.text },
    ghost: { background: "transparent", color: C.muted },
    danger: { background: C.red + "22", border: `1px solid ${C.red}44`, color: C.red },
  };
  return <button {...props} disabled={disabled || loading} style={{ ...base, ...styles[variant] }}>{loading ? <Spinner size={15} color={variant === "primary" ? C.bg : C.accent} /> : children}</button>;
}

function Tag({ children, color = C.accent }) {
  return <span style={{ fontSize: 9, background: color + "22", color, padding: "3px 8px", borderRadius: 10, letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase" }}>{children}</span>;
}

/* ─── AUTH SCREEN ────────────────────────────────────────── */
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function submit() {
    setErr("");
    if (!form.email || !form.password) { setErr("Please fill all required fields."); return; }
    if (mode === "signup" && !form.name) { setErr("Please enter your name."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const user = { name: form.name || form.email.split("@")[0], email: form.email, phone: form.phone, signupDate: new Date().toISOString(), plan: "trial" };
    setStorage("wiq_user", user);
    setLoading(false);
    onAuth(user);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{opacity:0.4}50%{opacity:0.8}}
        *{box-sizing:border-box}
      `}</style>

      {/* bg glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: `radial-gradient(ellipse, ${C.accent}18 0%, transparent 70%)`, pointerEvents: "none", animation: "glow 4s ease-in-out infinite" }} />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(${C.border}55 1px,transparent 1px),linear-gradient(90deg,${C.border}55 1px,transparent 1px)`, backgroundSize: "50px 50px", opacity: 0.25, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.5s ease", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: C.bg, fontFamily: "'Playfair Display',serif", margin: "0 auto 12px" }}>W</div>
          <div style={{ fontSize: 26, fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.text }}>WealthIQ Kenya</div>
          <div style={{ fontSize: 11, color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 4 }}>Elite Wealth Intelligence</div>
        </div>

        {/* Trial badge */}
        {mode === "signup" && (
          <div style={{ background: `${C.green}15`, border: `1px solid ${C.green}33`, borderRadius: 10, padding: "10px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🎁</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.green }}>14-Day Free Trial</div>
              <div style={{ fontSize: 11, color: C.muted }}>No credit card required. Cancel anytime.</div>
            </div>
          </div>
        )}

        {/* Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: C.surface2, borderRadius: 9, padding: 4, marginBottom: 22 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ flex: 1, padding: "8px", borderRadius: 7, border: "none", background: mode === m ? C.surface : "transparent", color: mode === m ? C.text : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", textTransform: "capitalize" }}>{m === "login" ? "Sign In" : "Sign Up Free"}</button>
            ))}
          </div>

          {mode === "signup" && <Input label="Full Name *" placeholder="e.g. James Mwangi" value={form.name} onChange={set("name")} />}
          <Input label="Email Address *" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} />
          {mode === "signup" && <Input label="Phone (for M-Pesa)" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={set("phone")} />}
          <Input label="Password *" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set("password")} />

          {err && <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}33`, borderRadius: 8, padding: "9px 13px", fontSize: 12, color: "#FCA5A5", marginBottom: 14 }}>{err}</div>}

          <Btn loading={loading} style={{ width: "100%" }} onClick={submit}>
            {mode === "login" ? "Sign In to Dashboard" : "Start 14-Day Free Trial"}
          </Btn>

          {mode === "signup" && (
            <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
              By signing up you agree to our Terms of Service.<br />After trial ends: Gold KSh 66,200/mo · Platinum KSh 331,000/mo
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted }}>
          {mode === "login" ? "New to WealthIQ? " : "Already have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }} style={{ color: C.accent, cursor: "pointer", fontWeight: 600 }}>{mode === "login" ? "Start free trial" : "Sign in"}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── PAYWALL / PLANS SCREEN ─────────────────────────────── */
function PaywallScreen({ user, onPaid, onLogout }) {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [payMethod, setPayMethod] = useState("mpesa");
  const [stage, setStage] = useState("plans"); // plans | pay | processing | success
  const [mpesaPhone, setMpesaPhone] = useState(user.phone || "");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [mpesaStep, setMpesaStep] = useState(0); // 0=input,1=pushed,2=confirm

  function setC(k) { return e => setCard(f => ({ ...f, [k]: e.target.value })); }

  async function initiateMpesa() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setMpesaStep(1);
    setLoading(false);
    // simulate STK push confirmation after 4s
    setTimeout(() => setMpesaStep(2), 4000);
  }

  async function confirmPayment() {
    setStage("processing");
    await new Promise(r => setTimeout(r, 2200));
    const updatedUser = { ...user, plan: selectedPlan.id, planLabel: selectedPlan.label, activatedAt: new Date().toISOString() };
    setStorage("wiq_user", updatedUser);
    setStage("success");
    setTimeout(() => onPaid(updatedUser), 2000);
  }

  async function payStripe() {
    if (!card.number || !card.expiry || !card.cvc || !card.name) return;
    setStage("processing");
    await new Promise(r => setTimeout(r, 2500));
    const updatedUser = { ...user, plan: selectedPlan.id, planLabel: selectedPlan.label, activatedAt: new Date().toISOString() };
    setStorage("wiq_user", updatedUser);
    setStage("success");
    setTimeout(() => onPaid(updatedUser), 2000);
  }

  if (stage === "processing") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <Spinner size={40} />
      <div style={{ color: C.text, fontSize: 16, fontFamily: "'Playfair Display',serif" }}>Processing Payment…</div>
      <div style={{ color: C.muted, fontSize: 12 }}>Please wait, do not close this window</div>
    </div>
  );

  if (stage === "success") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 56 }}>✅</div>
      <div style={{ color: C.green, fontSize: 20, fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>Payment Successful!</div>
      <div style={{ color: C.muted, fontSize: 13 }}>Welcome to WealthIQ {selectedPlan.label}. Redirecting…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif", overflowY: "auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.bg, fontSize: 14 }}>W</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: C.text }}>WealthIQ Kenya</span>
        </div>
        <Btn variant="ghost" onClick={onLogout} style={{ fontSize: 12, padding: "6px 12px" }}>Sign out</Btn>
      </div>

      {stage === "plans" && (
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 20px", animation: "fadeUp 0.4s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 11, color: C.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Your 14-day trial has ended</div>
            <div style={{ fontSize: 32, fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.text, marginBottom: 10 }}>Choose Your Plan</div>
            <div style={{ fontSize: 14, color: C.muted }}>Pay via M-Pesa (KES) or Card (USD). Cancel anytime.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
            {PLANS.map(plan => (
              <div key={plan.id} onClick={() => setSelectedPlan(plan)} style={{ background: selectedPlan.id === plan.id ? C.surface2 : C.surface, border: `2px solid ${selectedPlan.id === plan.id ? plan.color : C.border}`, borderRadius: 14, padding: 22, cursor: "pointer", position: "relative", transition: "all 0.2s" }}>
                {plan.popular && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: C.accent, color: C.bg, fontSize: 9, fontWeight: 700, padding: "3px 12px", borderRadius: 10, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>MOST POPULAR</div>}
                <div style={{ fontSize: 11, color: plan.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{plan.label}</div>
                <div style={{ fontSize: 26, fontFamily: "'Playfair Display',serif", fontWeight: 700, color: plan.color }}>${plan.priceUSD.toLocaleString()}<span style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Sans',sans-serif" }}>/mo</span></div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>KSh {plan.priceKES.toLocaleString()}/mo · {plan.desc}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {plan.features.map((f, i) => <div key={i} style={{ fontSize: 12, color: C.text, display: "flex", gap: 8 }}><span style={{ color: plan.color }}>✓</span>{f}</div>)}
                </div>
                {selectedPlan.id === plan.id && <div style={{ marginTop: 14, fontSize: 11, color: plan.color, fontWeight: 600 }}>✓ Selected</div>}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <Btn onClick={() => setStage("pay")} style={{ padding: "13px 40px", fontSize: 14 }}>
              Continue with {selectedPlan.label} — ${selectedPlan.priceUSD}/mo →
            </Btn>
          </div>
        </div>
      )}

      {stage === "pay" && (
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 20px", animation: "fadeUp 0.4s ease" }}>
          <button onClick={() => setStage("plans")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>← Back to plans</button>

          {/* Summary */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>WealthIQ {selectedPlan.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Monthly subscription</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.accent }}>${selectedPlan.priceUSD}/mo</div>
                <div style={{ fontSize: 11, color: C.muted }}>KSh {selectedPlan.priceKES.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Method tabs */}
          <div style={{ display: "flex", gap: 4, background: C.surface2, borderRadius: 10, padding: 4, marginBottom: 20 }}>
            <button onClick={() => setPayMethod("mpesa")} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: payMethod === "mpesa" ? C.surface : "transparent", color: payMethod === "mpesa" ? C.text : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              📱 M-Pesa (KES)
            </button>
            <button onClick={() => setPayMethod("stripe")} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: payMethod === "stripe" ? C.surface : "transparent", color: payMethod === "stripe" ? C.text : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              💳 Card (USD)
            </button>
          </div>

          {/* M-PESA FLOW */}
          {payMethod === "mpesa" && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, background: "#00A550", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📱</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Safaricom M-Pesa</div>
                  <div style={{ fontSize: 11, color: C.muted }}>STK Push to your phone</div>
                </div>
              </div>

              {mpesaStep === 0 && (
                <>
                  <Input label="M-Pesa Phone Number" placeholder="+254 7XX XXX XXX" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} />
                  <div style={{ background: C.surface2, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                    Amount: <strong style={{ color: C.text }}>KSh {selectedPlan.priceKES.toLocaleString()}</strong><br />
                    You will receive a prompt on your phone. Enter your M-Pesa PIN to confirm.
                  </div>
                  <Btn loading={loading} style={{ width: "100%" }} onClick={initiateMpesa}>Send STK Push →</Btn>
                </>
              )}

              {mpesaStep === 1 && (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📲</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8 }}>Check Your Phone!</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.7 }}>
                    An M-Pesa prompt has been sent to<br /><strong style={{ color: C.text }}>{mpesaPhone}</strong>.<br />Enter your PIN to complete payment.
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.muted, fontSize: 12 }}>
                    <Spinner size={14} /> Waiting for confirmation…
                  </div>
                </div>
              )}

              {mpesaStep === 2 && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.green, marginBottom: 8 }}>Payment Confirmed!</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>KSh {selectedPlan.priceKES.toLocaleString()} received via M-Pesa</div>
                  <Btn onClick={confirmPayment} style={{ width: "100%" }}>Activate {selectedPlan.label} Plan →</Btn>
                </div>
              )}
            </div>
          )}

          {/* STRIPE FLOW */}
          {payMethod === "stripe" && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, background: "#635BFF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💳</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Secure Card Payment</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Powered by Stripe · SSL encrypted</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {["VISA", "MC", "AMEX"].map(b => <span key={b} style={{ fontSize: 9, background: C.surface2, border: `1px solid ${C.border}`, padding: "3px 7px", borderRadius: 4, color: C.muted, fontWeight: 700 }}>{b}</span>)}
                </div>
              </div>

              <Input label="Cardholder Name" placeholder="James Mwangi" value={card.name} onChange={setC("name")} />
              <Input label="Card Number" placeholder="4242 4242 4242 4242" value={card.number} onChange={e => {
                const v = e.target.value.replace(/\D/g, "").substring(0, 16);
                setCard(f => ({ ...f, number: v.replace(/(.{4})/g, "$1 ").trim() }));
              }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Expiry" placeholder="MM / YY" value={card.expiry} onChange={e => {
                  let v = e.target.value.replace(/\D/g, "").substring(0, 4);
                  if (v.length >= 2) v = v.slice(0, 2) + " / " + v.slice(2);
                  setCard(f => ({ ...f, expiry: v }));
                }} />
                <Input label="CVC" placeholder="123" value={card.cvc} onChange={e => setCard(f => ({ ...f, cvc: e.target.value.replace(/\D/g, "").substring(0, 4) }))} />
              </div>

              <div style={{ background: C.surface2, borderRadius: 8, padding: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.green, fontSize: 14 }}>🔒</span>
                <span style={{ fontSize: 11, color: C.muted }}>Your card data is encrypted and processed by Stripe. WealthIQ never stores card details.</span>
              </div>

              <Btn onClick={payStripe} style={{ width: "100%" }}>
                Pay ${selectedPlan.priceUSD} / month →
              </Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── DASHBOARD ──────────────────────────────────────────── */
const portfolio = {
  assets: [
    { name: "Real Estate", value: 85_680_000, pct: 60, change: 6.2, icon: "🏙️" },
    { name: "NSE Equities", value: 28_560_000, pct: 20, change: 2.1, icon: "📈" },
    { name: "SACCOs & MMF", value: 17_136_000, pct: 12, change: 8.4, icon: "🏦" },
    { name: "Crypto", value: 8_568_000, pct: 6, change: -3.2, icon: "₿" },
    { name: "Private Equity", value: 2_856_000, pct: 2, change: 11.0, icon: "🔒" },
  ],
};

const nseStocks = [
  { ticker: "SCOM", name: "Safaricom", price: "KSh 24.35", change: "+1.2%" },
  { ticker: "EQTY", name: "Equity Group", price: "KSh 58.90", change: "+3.1%" },
  { ticker: "KCB", name: "KCB Group", price: "KSh 43.20", change: "-0.8%" },
  { ticker: "EABL", name: "E.A Breweries", price: "KSh 162.00", change: "+0.5%" },
];

const RE = [
  { label: "Kilimani Apt", value: "KSh 18.2M", trend: "+8.1%", hot: true },
  { label: "Westlands Comm", value: "KSh 12.8M", trend: "+12.2%", hot: true },
  { label: "Karen Villa", value: "KSh 45.5M", trend: "+3.4%", hot: false },
  { label: "Tatu City Plot", value: "KSh 8.7M", trend: "+22.5%", hot: true },
  { label: "Runda Estate", value: "KSh 62.0M", trend: "+1.9%", hot: false },
  { label: "Upperhill Off", value: "KSh 35.1M", trend: "+5.6%", hot: false },
];

const SYSTEM_PROMPT = `You are WealthIQ, an elite AI wealth advisor for Kenya's high-net-worth individuals. Your clients are CEOs, lawyers, real estate moguls earning KSh 50M+ annually. Deep expertise: Kenyan real estate (Kilimani, Karen, Westlands, Runda, Tatu City), NSE equities, SACCOs, MMFs, crypto, FX risk management (KES/USD/EUR), private equity, tax optimisation under Kenyan law, CBK, KRA, CMA. Be concise, direct, use specific KSh numbers. Under 180 words per response.`;

function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [msgs, setMsgs] = useState([{ role: "assistant", content: `Jambo ${user.name}. Your ${user.planLabel || "trial"} portfolio is up **4.7%** this quarter — outperforming NSE by 2.3pts. What's on your agenda today?` }]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const chatRef = useRef(null);
  const daysLeft = user.plan === "trial" ? trialDaysLeft(user.signupDate) : null;

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs]);

  async function send() {
    if (!input.trim() || aiLoading) return;
    const q = input.trim(); setInput("");
    setMsgs(p => [...p, { role: "user", content: q }]);
    setAiLoading(true);
    try {
      const history = [...msgs, { role: "user", content: q }].map(m => ({ role: m.role, content: m.content.replace(/\*\*/g, "") }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: history })
      });
      const data = await res.json();
      setMsgs(p => [...p, { role: "assistant", content: data.content?.[0]?.text || "Error fetching response." }]);
    } catch { setMsgs(p => [...p, { role: "assistant", content: "Connection error. Please retry." }]); }
    setAiLoading(false);
  }

  const quickP = ["Where to invest KSh 20M now?", "Best Nairobi RE hotspot Q2 2026?", "Hedge against KES depreciation?", "Review my diversification", "Tax-efficient wealth transfer", "NSE stocks to watch"];
  const colors = [C.accent, C.blue, C.green, C.purple, "#F97316"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.surface}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
        .tab{padding:8px 16px;border:none;background:transparent;color:${C.muted};font-size:13px;font-family:inherit;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s}
        .tab.on{color:${C.accent};border-bottom-color:${C.accent}}
        .tab:hover:not(.on){color:${C.text}}
        .card{background:${C.surface};border:1px solid ${C.border};border-radius:12px;padding:18px}
        .qbtn{background:${C.surface2};border:1px solid ${C.border};color:${C.muted};font-size:11px;padding:7px 11px;border-radius:20px;cursor:pointer;transition:all 0.2s;font-family:inherit;text-align:left}
        .qbtn:hover{border-color:${C.accent}55;color:${C.accent};background:${C.accent}11}
        *{box-sizing:border-box}
      `}</style>

      {/* Trial banner */}
      {user.plan === "trial" && daysLeft > 0 && (
        <div style={{ background: `linear-gradient(90deg,${C.accent}22,${C.accent}11)`, borderBottom: `1px solid ${C.accent}33`, padding: "9px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 12 }}>
          <span style={{ color: C.accent }}>⏳ {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in your free trial</span>
          <span style={{ color: C.muted }}>·</span>
          <span style={{ color: C.muted }}>Upgrade to keep full access</span>
          <button onClick={() => setShowManage(true)} style={{ background: C.accent, color: C.bg, border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", marginLeft: 4 }}>Upgrade Now</button>
        </div>
      )}
      {user.plan === "trial" && daysLeft === 0 && (
        <div style={{ background: `${C.red}22`, borderBottom: `1px solid ${C.red}33`, padding: "9px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 12 }}>
          <span style={{ color: C.red }}>🔒 Your free trial has ended.</span>
          <button onClick={() => setShowManage(true)} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 6, padding: "4px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Choose a Plan</button>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: `${C.surface}EE`, backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20 }}>
            <div style={{ width: 28, height: 28, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.bg, fontSize: 13 }}>W</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: C.text }}>WealthIQ</span>
            <Tag>{user.planLabel || "Trial"}</Tag>
          </div>
          {["overview", "advisor", "market"].map(t => (
            <button key={t} className={`tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, color: C.muted }}>Hi, <span style={{ color: C.text }}>{user.name}</span></div>
            <button onClick={() => setShowManage(true)} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 12px", color: C.text, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>⚙ Manage</button>
            <Btn variant="ghost" onClick={onLogout} style={{ fontSize: 11, padding: "5px 10px" }}>Logout</Btn>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 20px", position: "relative" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { l: "Total Wealth", v: "KSh 142.8M", s: "+4.7% QoQ", c: C.accent },
                { l: "Monthly Yield", v: "KSh 890K", s: "+KSh 42K vs last mo", c: C.green },
                { l: "NSE Portfolio", v: "KSh 28.6M", s: "↑ SCOM, EQTY", c: C.blue },
                { l: "FX Exposure", v: "USD 215K", s: "KES –0.3% today", c: "#F97316" },
              ].map((k, i) => (
                <div key={i} className="card" style={{ borderLeft: `3px solid ${k.c}` }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 7 }}>{k.l}</div>
                  <div style={{ fontSize: 19, fontFamily: "'Playfair Display',serif", fontWeight: 700, color: k.c }}>{k.v}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{k.s}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="card">
                <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Asset Allocation</div>
                {portfolio.assets.map((a, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>{a.icon} {a.name}</span>
                      <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: a.change >= 0 ? C.green : C.red }}>{a.change >= 0 ? "+" : ""}{a.change}%</span>
                    </div>
                    <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${a.pct}%`, background: colors[i], borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{fmt(a.value)} · {a.pct}%</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Nairobi RE Signals</div>
                  <span style={{ fontSize: 10, color: C.accent }}>Q2 2026</span>
                </div>
                {RE.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < RE.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: 12 }}>{s.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {s.hot && <Tag>HOT</Tag>}
                      <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono',monospace" }}>{s.value}</span>
                      <span style={{ fontSize: 11, color: C.green, fontFamily: "'DM Mono',monospace" }}>{s.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ADVISOR */}
        {tab === "advisor" && (
          <div style={{ animation: "fadeUp 0.35s ease", display: "grid", gridTemplateColumns: "1fr 280px", gap: 12, height: "68vh" }}>
            <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>WealthIQ AI Advisor</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: C.muted }}>Powered by Claude · End-to-end encrypted</span>
              </div>
              <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    {m.role === "assistant" && (
                      <div style={{ width: 26, height: 26, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.bg, fontSize: 11, marginRight: 8, flexShrink: 0, marginTop: 2 }}>W</div>
                    )}
                    <div style={{ maxWidth: "72%", background: m.role === "user" ? `${C.accent}1A` : C.surface2, border: `1px solid ${m.role === "user" ? C.accent + "44" : C.border}`, borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "10px 13px", fontSize: 13, lineHeight: 1.65, color: C.text }}>
                      {m.content.split("**").map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: C.accent }}>{p}</strong> : p)}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 26, height: 26, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.bg, fontSize: 11 }}>W</div>
                    <Spinner size={16} />
                  </div>
                )}
              </div>
              <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask your advisor…" style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 13px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                <Btn onClick={send} loading={aiLoading} style={{ padding: "9px 18px" }}>Send</Btn>
              </div>
            </div>
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Quick Insights</div>
              {quickP.map((p, i) => <button key={i} className="qbtn" onClick={() => setInput(p)}>{p}</button>)}
              <div style={{ marginTop: 8, padding: "12px", background: `${C.accent}11`, borderRadius: 9, border: `1px solid ${C.accent}33` }}>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 4 }}>📊 Wealth Review Due</div>
                <div style={{ fontSize: 11, color: C.muted }}>Quarterly portfolio review — April 15</div>
              </div>
            </div>
          </div>
        )}

        {/* MARKET */}
        {tab === "market" && (
          <div style={{ animation: "fadeUp 0.35s ease", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>NSE Top Movers</div>
                <div style={{ fontSize: 10, color: C.green }}>● Live</div>
              </div>
              {nseStocks.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{s.ticker}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{s.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace" }}>{s.price}</div>
                    <div style={{ fontSize: 11, color: s.change.startsWith("+") ? C.green : C.red }}>{s.change}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>RE Heat Map · Nairobi 2026</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {RE.map((s, i) => {
                  const p = parseFloat(s.trend);
                  return (
                    <div key={i} style={{ background: p > 10 ? `${C.accent}22` : `${C.green}18`, border: `1px solid ${p > 10 ? C.accent + "44" : C.green + "33"}`, borderRadius: 9, padding: "12px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{s.value}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: p > 10 ? C.accent : C.green }}>{s.trend}</div>
                      {s.hot && <div style={{ fontSize: 8, color: C.accent, marginTop: 4, letterSpacing: "0.1em" }}>● HOT ZONE</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manage subscription modal */}
      {showManage && (
        <div style={{ position: "fixed", inset: 0, background: "#000000BB", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowManage(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, maxWidth: 480, width: "100%", animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>Manage Subscription</div>
              <button onClick={() => setShowManage(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ background: C.surface2, borderRadius: 10, padding: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Current Plan</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.accent, fontFamily: "'Playfair Display',serif" }}>WealthIQ {user.planLabel || "Trial"}</div>
              {daysLeft !== null && <div style={{ fontSize: 12, color: daysLeft > 3 ? C.green : C.red, marginTop: 4 }}>{daysLeft > 0 ? `${daysLeft} days remaining` : "Trial expired"}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PLANS.map(plan => (
                <div key={plan.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 14px", background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: plan.color }}>{plan.label}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{plan.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.text }}>${plan.priceUSD}/mo</div>
                    <div style={{ fontSize: 10, color: C.muted }}>KSh {plan.priceKES.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <Btn style={{ flex: 1 }} onClick={() => { setShowManage(false); onLogout(); }}>Upgrade / Change Plan</Btn>
              <Btn variant="outline" onClick={() => setShowManage(false)} style={{ flex: 1 }}>Close</Btn>
            </div>
            <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: C.muted }}>Cancel anytime · No hidden fees · M-Pesa & Card accepted</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────── */
export default function App() {
  const [user, setUser] = useState(() => getStorage("wiq_user", null));
  const [screen, setScreen] = useState(() => {
    const u = getStorage("wiq_user", null);
    if (!u) return "auth";
    const days = trialDaysLeft(u.signupDate);
    if (u.plan === "trial" && days === 0) return "paywall";
    return "dashboard";
  });

  function handleAuth(u) {
    setUser(u);
    setScreen("dashboard");
  }

  function handlePaid(u) {
    setUser(u);
    setScreen("dashboard");
  }

  function handleLogout() {
    setStorage("wiq_user", null);
    setUser(null);
    setScreen("auth");
  }

  if (screen === "auth") return <AuthScreen onAuth={handleAuth} />;
  if (screen === "paywall") return <PaywallScreen user={user} onPaid={handlePaid} onLogout={handleLogout} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
