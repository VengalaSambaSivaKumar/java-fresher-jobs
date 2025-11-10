import React, { useEffect, useMemo, useState } from "react";
import { Cloud, Download, ExternalLink, RefreshCw, X } from "lucide-react";
import "./App.css"; // for styling

const DEFAULT_FEED_URL =
  "https://raw.githubusercontent.com/VengalaSambSivaKumar/java-fresher-jobs-data/main/jobs_today.json";

const CITIES = ["Hyderabad", "Bengaluru", "Chennai", "Mysuru", "Visakhapatnam", "Vijayawada"];
const ORG_TYPES = ["MNC", "Product", "Service", "Startup", "Hybrid"];

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [orgType, setOrgType] = useState("all");
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [feedUrl, setFeedUrl] = useState(() => localStorage.getItem("java_feed_url") || DEFAULT_FEED_URL);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchLiveJobs();
    const interval = setInterval(fetchLiveJobs, 1000 * 60 * 60); // hourly refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      const retryTimer = setInterval(() => {
        console.log(`Retry attempt #${retryCount + 1}`);
        setRetryCount((prev) => prev + 1);
        fetchLiveJobs();
      }, 1000 * 60 * 5);
      return () => clearInterval(retryTimer);
    }
  }, [error, retryCount]);

  async function tryFetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    return res.json();
  }

  async function fetchLiveJobs() {
    setLoading(true);
    try {
      const data = await tryFetchJSON(feedUrl);
      if (!Array.isArray(data)) throw new Error("Invalid JSON format: expected array");
      setJobs(data);
      localStorage.setItem("java_fresher_jobs_data", JSON.stringify(data));
      setLastUpdate(new Date().toLocaleString());
      setError("");
      setRetryCount(0);
    } catch (e1) {
      console.error("Feed load failed:", e1);
      setError(`❌ Failed to fetch live data.\n${e1}`);
      setJobs([]);
    }
    setLoading(false);
  }

  function saveFeedUrl() {
    localStorage.setItem("java_feed_url", feedUrl);
    fetchLiveJobs();
  }

  const filtered = useMemo(() => {
    let arr = jobs;
    if (city !== "all") arr = arr.filter((j) => j.city === city);
    if (orgType !== "all") arr = arr.filter((j) => j.orgType === orgType);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((j) => j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q));
    }
    return arr;
  }, [jobs, city, orgType, search]);

  if (error && !loading) {
    return (
      <div className="error-screen">
        <h2>🚫 Feed Load Error</h2>
        <p>{error}</p>
        <div className="error-actions">
          <input
            type="text"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="Enter JSON Feed URL"
          />
          <button onClick={saveFeedUrl} className="btn primary">
            <RefreshCw size={16} /> Retry Now
          </button>
          <button
            onClick={() => {
              setFeedUrl(DEFAULT_FEED_URL);
              localStorage.removeItem("java_feed_url");
              fetchLiveJobs();
            }}
            className="btn secondary"
          >
            Use Default
          </button>
        </div>
        <p className="small">Auto retry every 5 minutes. Attempt #{retryCount}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>💼 Java Fresher Jobs Portal</h1>
        <p>Find your opportunity — Updated hourly</p>
        {lastUpdate && <small>Last updated: {lastUpdate}</small>}
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search by title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">All Cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={orgType} onChange={(e) => setOrgType(e.target.value)}>
          <option value="all">All Types</option>
          {ORG_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button onClick={() => fetchLiveJobs()} className="btn primary">
          <Cloud size={16} /> Refresh
        </button>
        <button
          onClick={() => {
            setCity("all");
            setOrgType("all");
            setSearch("");
          }}
          className="btn secondary"
        >
          <X size={16} /> Reset
        </button>
      </div>

      <section className="jobs">
        {loading ? (
          <p className="loading">⏳ Fetching latest job listings...</p>
        ) : filtered.length ? (
          filtered.map((j, i) => (
            <div key={i} className="job-card">
              <div>
                <a href={j.link} target="_blank" rel="noreferrer" className="job-title">
                  {j.title} <ExternalLink size={12} />
                </a>
                <p className="job-meta">
                  {j.company} · {j.city} · {j.orgType} ·{" "}
                  {j.postingDate ? new Date(j.postingDate).toDateString() : "Unknown Date"}
                </p>
                {j.salary && <p className="salary">💰 {j.salary}</p>}
                {j.skills && <p className="skills">🧠 {j.skills}</p>}
              </div>
              <a href={j.link} target="_blank" rel="noreferrer" className="btn apply">
                Apply
              </a>
            </div>
          ))
        ) : (
          <p className="no-jobs">No live jobs available right now. Please check back soon.</p>
        )}
      </section>

      <footer className="footer">Made with ❤️ — auto retry every 5 min</footer>
    </div>
  );
}
