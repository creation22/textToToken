import React, { useState, useEffect, useMemo } from "react";
import { encode, decode } from "gpt-tokenizer";

const MODELS = [
  "gpt-4o",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo",
  "text-davinci-003",
];

const TOKEN_COLORS = ["#e0f2f1", "#f3e5f5", "#e3f2fd", "#fbe9e7", "#f1f8e9"];

const Token = () => {
  const [text, setText] = useState("Hello world! Let's count some tokens.");
  const [model, setModel] = useState("gpt-4o");
  const [tokenData, setTokenData] = useState({ ids: [], fragments: [] });

  // Tokenize safely
  useEffect(() => {
    if (!text.trim()) {
      setTokenData({ ids: [], fragments: [] });
      return;
    }

    try {
      const ids = encode(text, model);

      const fragments = ids.map((id) => {
        try {
          return decode([id], model) ?? "";
        } catch {
          return decode([id]) ?? "";
        }
      });

      setTokenData({ ids, fragments });
    } catch (err) {
      console.error("Tokenizer error:", err);
      setTokenData({ ids: [], fragments: [] });
    }
  }, [text, model]);

  // Cost (safe fallback)
  const cost = useMemo(() => {
    if (!tokenData.ids.length) return "$0.000000";
    return "N/A"; // pricing varies, don’t hard-fail
  }, [tokenData.ids.length]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>GPT Tokenizer</h2>
          <p style={styles.subtitle}>Client-side visualizer</p>
        </div>

        <div style={styles.statsRow}>
          <Stat label="Tokens" value={tokenData.ids.length} />
          <Stat label="Est. Cost" value={cost} />
          <Stat label="Characters" value={text.length} />
        </div>
      </header>

      <div style={styles.controls}>
        <label style={styles.label}>Model:</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} style={styles.select}>
          {MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button onClick={() => setText("")} style={styles.clearBtn}>Clear</button>
      </div>

      <div style={styles.grid}>
        <div style={styles.column}>
          <h3 style={styles.colTitle}>Input Text</h3>
          <textarea
            style={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type here..."
          />
        </div>

        <div style={styles.column}>
          <h3 style={styles.colTitle}>Token Map</h3>
          <div style={styles.visualizerBox}>
            {tokenData.fragments.map((frag, i) => (
              <span
                key={`${i}-${tokenData.ids[i]}`}
                style={{
                  ...styles.tokenTag,
                  backgroundColor: TOKEN_COLORS[i % TOKEN_COLORS.length],
                }}
                title={`Token ID: ${tokenData.ids[i]}`}
              >
                {frag === " " ? "␣" : frag || "�"}
              </span>
            ))}
          </div>

          <div style={styles.rawIdsBox}>
            <strong>Raw IDs:</strong>{" "}
            <span style={{ fontFamily: "monospace" }}>
              [{tokenData.ids.slice(0, 20).join(", ")}
              {tokenData.ids.length > 20 && " ..."}]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div style={styles.statCard}>
    <span style={styles.statLabel}>{label}</span>
    <span style={styles.statValue}>{value}</span>
  </div>
);

// Simple Object-based CSS (No external CSS file needed)
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#333",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "30px",
    borderBottom: "1px solid #eee",
    paddingBottom: "20px",
    flexWrap: "wrap",
    gap: "20px"
  },
  title: { margin: 0, fontSize: "28px", fontWeight: "700" },
  subtitle: { margin: 0, color: "#666", fontSize: "14px" },
  statsRow: { display: "flex", gap: "15px" },
  statCard: {
    background: "#f8f9fa",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    padding: "10px 20px",
    minWidth: "100px",
    textAlign: "center",
  },
  statLabel: { display: "block", fontSize: "12px", textTransform: "uppercase", color: "#888", marginBottom: "4px" },
  statValue: { display: "block", fontSize: "18px", fontWeight: "bold", color: "#222" },
  controls: { marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" },
  label: { fontWeight: "500", fontSize: "14px" },
  select: { padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" },
  clearBtn: { padding: "8px 16px", borderRadius: "6px", border: "none", background: "#ffecec", color: "#d32f2f", cursor: "pointer", fontSize: "14px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" },
  column: { display: "flex", flexDirection: "column" },
  colTitle: { fontSize: "16px", marginBottom: "10px", color: "#444" },
  textarea: {
    width: "100%",
    height: "400px",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    lineHeight: "1.5",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box", // fixes padding causing overflow
  },
  visualizerBox: {
    width: "100%",
    height: "400px",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#fff",
    overflowY: "auto",
    lineHeight: "1.8", // Loose line height for tags
    fontSize: "16px",
    whiteSpace: "pre-wrap", // Preserve whitespace
    boxSizing: "border-box",
  },
  tokenTag: {
    display: "inline-block", // Allows background to wrap word
    padding: "0 2px",
    margin: "0 1px",
    borderRadius: "4px",
    cursor: "help",
    borderBottom: "2px solid transparent",
  },
  rawIdsBox: {
    marginTop: "15px",
    fontSize: "12px",
    background: "#f1f1f1",
    padding: "10px",
    borderRadius: "6px",
  }
};

export default Token;