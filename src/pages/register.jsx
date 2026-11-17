
import React, { useState } from "react";
import "./Register.css";

const districts = [
  "Bugesera", "Burera", "Gakenke", "Gasabo", "Gatsibo",
  "Gicumbi", "Gisagara", "Huye", "Kamonyi", "Karongi",
  "Kayonza", "Kicukiro", "Kirehe", "Muhanga", "Musanze",
  "Ngoma", "Ngororero", "Nyabihu", "Nyagatare", "Nyamagabe",
  "Nyamasheke", "Nyanza", "Nyarugenge", "Nyaruguru",
  "Rubavu", "Ruhango", "Rulindo", "Rusizi", "Rutsiro",
  "Rwamagana"
];

export default function Register({ onRegister, onNavigate }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    district: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.fullName.trim().length < 3) {
      setError("Andika amazina yawe yuzuye.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Andika email nyayo.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password igomba kuba nibura inyuguti 8.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password zombi ntizihura.");
      return;
    }

    if (!form.agree) {
      setError("Emera amabwiriza kugira ngo ukomeze.");
      return;
    }

    if (typeof onRegister !== "function") {
      setError("Registration ntiyahujwe na App.js.");
      return;
    }

    setLoading(true);

    try {
      await onRegister({
        fullName: form.fullName.trim(),
        name: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        district: form.district,
        password: form.password,
        role: "farmer",
      });

      setSuccess("Konti yawe yanditswe neza. Injira ukoresheje Login.");
    } catch (err) {
      setError(err.message || "Kwiyandikisha ntibyashobotse.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <div className="register-glow register-glow-one" />
      <div className="register-glow register-glow-two" />

      <section className="register-shell">
        <aside className="register-hero">
          <div className="brand">
            <div className="brand-icon">🌿</div>
            <div>
              <h2>Smart Crop Care</h2>
              <p>AI-Powered Farming Assistant</p>
            </div>
          </div>

          <div className="hero-content">
            <span className="hero-tag">
              <span className="status-dot" />
              SMART FARMING STARTS HERE
            </span>

            <h1>
              Grow smarter.
              <br />
              <span>Harvest better.</span>
            </h1>

            <p className="hero-description">
              Koresha ikoranabuhanga rya AI kugira ngo umenye
              indwara z’ibihingwa, ubone inama kandi urusheho
              kunoza umusaruro wawe.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">⌕</div>
                <div>
                  <strong>AI Disease Detection</strong>
                  <p>Fasha kumenya indwara z’ibihingwa ukoresheje amafoto.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">✳</div>
                <div>
                  <strong>Smart Farming Advice</strong>
                  <p>Menya ingamba zagufasha kurinda ibihingwa byawe.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">↗</div>
                <div>
                  <strong>Track Your Farm</strong>
                  <p>Bika kandi ukurikirane ibisubizo by’isuzuma ryawe.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-footer">
            <span className="footer-leaf">✦</span>
            <p>Healthy crops, stronger farmers, brighter future.</p>
          </div>
        </aside>

        <section className="register-panel">
          <div className="form-heading">
            <div className="form-heading-icon">
              <span>♧</span>
            </div>
            <div>
              <p className="eyebrow">JOIN OUR COMMUNITY</p>
              <h2>Create your account</h2>
              <p className="form-subtitle">
                Uzuza amakuru akurikira kugira ngo utangire.
              </p>
            </div>
          </div>

          {error && (
            <div className="form-alert form-alert-error" role="alert">
              <span>!</span> {error}
            </div>
          )}

          {success && (
            <div className="form-alert form-alert-success" role="status">
              <span>✓</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-field">
              <label htmlFor="fullName">Full name</label>
              <div className="input-wrap">
                <span className="input-icon">♙</span>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="phone">Phone number</label>
                <div className="input-wrap">
                  <span className="input-icon">☎</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="07..."
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="district">District</label>
                <div className="input-wrap select-wrap">
                  <span className="input-icon">⌖</span>
                  <select
                    id="district"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose district</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="input-icon">♙</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="password-hint">
                Use at least 8 characters for your password.
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="input-wrap">
                <span className="input-icon">♙</span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Enter your password again"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="terms-row">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
              />
              <span>
                I agree to the <strong>Terms of Service</strong> and{" "}
                <strong>Privacy Policy</strong>.
              </span>
            </label>

            <button
              className="register-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="register-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create my account <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="form-bottom">
            <span>Already have an account?</span>
            <button
              type="button"
              onClick={() => onNavigate?.("login")}
            >
              Sign in
            </button>
          </div>

          <p className="secure-note">
            <span>✓</span> Your information is used to manage your account.
          </p>
        </section>
      </section>
    </main>
  );
}
