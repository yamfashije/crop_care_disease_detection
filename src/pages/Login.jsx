
import React, { useState } from "react";
import "./Login.css";

export default function Login({ onLogin, onNavigate }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Check empty fields
    if (!form.email.trim() || !form.password) {
      setError("Uzuza email na password mbere yo gukomeza.");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Andika email iri mu buryo bwemewe.");
      return;
    }

    // Check backend connection
    if (!onLogin) {
      setError(
        "Login ntirahuzwa na backend. Ongera uhuze onLogin muri App.js."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onLogin({
        email: form.email.trim(),
        password: form.password,
      });
    } catch (err) {
      setError(
        err.message || "Kwinjira byanze. Reba email na password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ag-auth-page ag-login-page">
      <div className="ag-auth-glow ag-glow-one" />
      <div className="ag-auth-glow ag-glow-two" />

      <div className="ag-auth-layout">

        {/* LEFT SIDE */}
        <section className="ag-auth-showcase">
          <div className="ag-brand">
            <div className="ag-brand-mark">🌿</div>

            <div>
              <strong>
                AgriSmart <span>AI</span>
              </strong>
              <small>SMART FARMING PLATFORM</small>
            </div>
          </div>

          <div className="ag-showcase-copy">
            <div className="ag-eyebrow">
              <span className="ag-live-dot" />
              UBWENGE BW'UBUHINZI
            </div>

            <h1>
              Hinga neza.
              <br />
              <span>Menya kare.</span>
              <br />
              Sarura byinshi.
            </h1>

            <p>
              Koresha ikoranabuhanga rya AI kugira ngo umenye
              ibimenyetso by'indwara z'ibihingwa kandi urinde
              umusaruro wawe.
            </p>

            <div className="ag-showcase-benefits">
              <div>
                <span>✓</span> Gusuzuma ibimenyetso by'ibihingwa
              </div>

              <div>
                <span>✓</span> Kubona amakuru n'inama z'ubuhinzi
              </div>

              <div>
                <span>✓</span> Gukurikirana amateka y'ibisuzumwa
              </div>
            </div>
          </div>

          <div className="ag-showcase-art" aria-hidden="true">
            <div className="ag-orbit ag-orbit-one" />
            <div className="ag-orbit ag-orbit-two" />

            <div className="ag-showcase-plant">🌱</div>

            <div className="ag-float-chip ag-chip-one">
              🍃 Healthy crops
            </div>

            <div className="ag-float-chip ag-chip-two">
              ✦ AI powered
            </div>
          </div>

          <div className="ag-showcase-footer">
            <span>
              © {new Date().getFullYear()} AgriSmart AI
            </span>

            <span>Growing a smarter future</span>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="ag-auth-form-side">
          <div className="ag-mobile-brand">
            <div className="ag-brand-mark">🌿</div>

            <strong>
              AgriSmart <span>AI</span>
            </strong>
          </div>

          <div className="ag-auth-card">
            <div className="ag-form-icon">👋</div>

            <div className="ag-form-overline">
              WELCOME BACK
            </div>

            <h2>Murakaza neza!</h2>

            <p className="ag-form-description">
              Injira muri konti yawe ukomeze kwita ku bihingwa byawe.
            </p>

            {error && (
              <div className="ag-form-error" role="alert">
                <span>!</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* EMAIL */}
              <div className="ag-field">
                <label htmlFor="login-email">
                  Email address
                </label>

                <div className="ag-input-wrap">
                  <span className="ag-input-icon">✉</span>

                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder="urugero@email.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="ag-field">
                <div className="ag-label-row">
                  <label htmlFor="login-password">
                    Password
                  </label>
                </div>

                <div className="ag-input-wrap">
                  <span className="ag-input-icon">♙</span>

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Andika password yawe"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    className="ag-password-toggle"
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword
                        ? "Hisha password"
                        : "Erekana password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                className="ag-submit-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="ag-spinner" />
                    Birimo gukorwa...
                  </>
                ) : (
                  <>
                    Injira muri konti
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="ag-auth-divider">
              <span>CYANGWA</span>
            </div>

            <p className="ag-switch-text">
              Nta konti uragira?{" "}
              <button
                type="button"
                onClick={() => onNavigate?.("register")}
              >
                Iyandikishe hano
              </button>
            </p>

            <div className="ag-security-note">
              <span>🔒</span>

              <span>
                Amakuru yawe agomba kurindwa kandi agakoreshwa neza.
              </span>
            </div>
          </div>

          <p className="ag-form-bottom">
            Ikoranabuhanga rifasha umuhinzi kurushaho.
            <span> 🌱</span>
          </p>
        </section>
      </div>
    </main>
  );
}
