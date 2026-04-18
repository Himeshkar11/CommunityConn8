import { useMemo, useState } from "react";

const pretty = (data) => JSON.stringify(data, null, 2);

export default function App() {
  const [baseUrl, setBaseUrl] = useState("");
  const [token, setToken] = useState("");
  const [response, setResponse] = useState("Ready");

  const [signup, setSignup] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer",
  });

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [issue, setIssue] = useState({
    title: "",
    description: "",
    type: "",
    urgency: "",
    location: "",
  });

  const [issueId, setIssueId] = useState("");
  const [profile, setProfile] = useState({
    skills: "",
    location: "",
    availability: true,
  });

  const resolvedBase = useMemo(() => {
    return baseUrl.trim() || "";
  }, [baseUrl]);

  const api = async (path, method = "GET", body) => {
    const url = `${resolvedBase}${path}`;
    const headers = {
      "Content-Type": "application/json",
    };

    if (token.trim()) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await res.text();
      let parsed;
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch {
        parsed = { raw: text };
      }

      setResponse(
        pretty({
          status: res.status,
          ok: res.ok,
          data: parsed,
        })
      );

      if (parsed?.token) {
        setToken(parsed.token);
      }
    } catch (error) {
      setResponse(
        pretty({
          ok: false,
          error: error.message,
        })
      );
    }
  };

  return (
    <div className="container">
      <h1>CommunityConn8 Backend Tester</h1>
      <p>
        Leave Base URL empty to use Vite proxy (recommended). Example explicit
        base URL: <code>http://localhost:5000</code>
      </p>

      <section>
        <h2>Connection</h2>
        <input
          placeholder="Base URL (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
        <button onClick={() => api("/")}>Ping /</button>
      </section>

      <section>
        <h2>Auth</h2>
        <div className="grid">
          <input
            placeholder="Name"
            value={signup.name}
            onChange={(e) => setSignup({ ...signup, name: e.target.value })}
          />
          <input
            placeholder="Signup Email"
            value={signup.email}
            onChange={(e) => setSignup({ ...signup, email: e.target.value })}
          />
          <input
            placeholder="Signup Password"
            type="password"
            value={signup.password}
            onChange={(e) =>
              setSignup({ ...signup, password: e.target.value })
            }
          />
          <select
            value={signup.role}
            onChange={(e) => setSignup({ ...signup, role: e.target.value })}
          >
            <option value="volunteer">volunteer</option>
            <option value="admin">admin</option>
          </select>
          <button onClick={() => api("/api/auth/signup", "POST", signup)}>
            Signup
          </button>
        </div>

        <div className="grid">
          <input
            placeholder="Login Email"
            value={login.email}
            onChange={(e) => setLogin({ ...login, email: e.target.value })}
          />
          <input
            placeholder="Login Password"
            type="password"
            value={login.password}
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
          />
          <button onClick={() => api("/api/auth/login", "POST", login)}>
            Login
          </button>
        </div>

        <input
          placeholder="JWT Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </section>

      <section>
        <h2>User Profile (requires token)</h2>
        <div className="row">
          <button onClick={() => api("/api/users/profile")}>Get Profile</button>
        </div>
        <div className="grid">
          <input
            placeholder="Skills (comma-separated)"
            value={profile.skills}
            onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
          />
          <input
            placeholder="Location"
            value={profile.location}
            onChange={(e) =>
              setProfile({ ...profile, location: e.target.value })
            }
          />
          <select
            value={String(profile.availability)}
            onChange={(e) =>
              setProfile({
                ...profile,
                availability: e.target.value === "true",
              })
            }
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
          <button
            onClick={() =>
              api("/api/users/profile", "PATCH", {
                skills: profile.skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                location: profile.location,
                availability: profile.availability,
              })
            }
          >
            Update Profile
          </button>
        </div>
      </section>

      <section>
        <h2>Issues</h2>
        <div className="row">
          <button onClick={() => api("/api/issues")}>Get All Issues</button>
        </div>

        <div className="grid">
          <input
            placeholder="Title"
            value={issue.title}
            onChange={(e) => setIssue({ ...issue, title: e.target.value })}
          />
          <input
            placeholder="Description"
            value={issue.description}
            onChange={(e) =>
              setIssue({ ...issue, description: e.target.value })
            }
          />
          <input
            placeholder="Type"
            value={issue.type}
            onChange={(e) => setIssue({ ...issue, type: e.target.value })}
          />
          <input
            placeholder="Urgency"
            value={issue.urgency}
            onChange={(e) => setIssue({ ...issue, urgency: e.target.value })}
          />
          <input
            placeholder="Location"
            value={issue.location}
            onChange={(e) => setIssue({ ...issue, location: e.target.value })}
          />
          <button onClick={() => api("/api/issues", "POST", issue)}>
            Create Issue (admin)
          </button>
        </div>

        <div className="grid">
          <input
            placeholder="Issue ID"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
          />
          <button onClick={() => api(`/api/issues/${issueId}`)}>
            Get Issue by ID
          </button>
          <button onClick={() => api(`/api/issues/${issueId}`, "PATCH", issue)}>
            Update Issue (admin)
          </button>
          <button onClick={() => api(`/api/issues/${issueId}`, "DELETE")}>
            Delete Issue (admin)
          </button>
        </div>
      </section>

      <section>
        <h2>Response</h2>
        <pre>{response}</pre>
      </section>
    </div>
  );
}
