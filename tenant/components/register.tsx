"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Scissors,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  apiError,
  getRegistrationPlans,
  registerTenant,
  type RegistrationPlan,
  type TenantRegistration,
} from "@/tenant/lib/api";

const initial: TenantRegistration = {
  businessName: "",
  ownerName: "",
  slug: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  city: "",
};

export default function TenantRegister() {
  const [form, setForm] = useState(initial);
  const [plans, setPlans] = useState<RegistrationPlan[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getRegistrationPlans()
      .then(setPlans)
      .catch((cause) => setError(apiError(cause, "Could not load plans.")))
      .finally(() => setLoadingPlans(false));
  }, []);

  const field = (name: keyof TenantRegistration, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));
  const businessSlug = form.slug.trim().toLowerCase() || "your-salon";

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await registerTenant({
        ...form,
        email: form.email.trim().toLowerCase(),
        slug: form.slug.trim().toLowerCase(),
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setError(apiError(cause, "Registration failed."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="tenant-register-root">
      <div className="register-glow register-glow-one" aria-hidden="true" />
      <div className="register-glow register-glow-two" aria-hidden="true" />
      <section className="register-shell">
        <aside className="register-story">
          <Link href="/login" className="register-brand">
            <span className="register-brand-mark">
              <Sparkles size={19} />
            </span>
            <span>Serenity</span>
          </Link>
          <div className="register-story-content">
            <span className="register-eyebrow">Built for modern salons</span>
            <h1>
              Turn busy days into
              <br />
              <em>beautifully simple</em> ones.
            </h1>
            <p>
              One calm workspace for bookings, your team, clients, and the
              details that keep your business moving.
            </p>
            <div className="register-benefits">
              <div>
                <span>
                  <Check size={15} />
                </span>
                <p>
                  <strong>Everything in one place</strong>Manage appointments,
                  staff, and customers without the clutter.
                </p>
              </div>
              <div>
                <span>
                  <Check size={15} />
                </span>
                <p>
                  <strong>Ready for your clients</strong>Launch a polished
                  booking experience under your salon name.
                </p>
              </div>
              <div>
                <span>
                  <Check size={15} />
                </span>
                <p>
                  <strong>Start with confidence</strong>Begin on the free Trial
                  plan and upgrade when you are ready.
                </p>
              </div>
            </div>
          </div>
          <p className="register-story-footer">
            <ShieldCheck size={15} /> Secure registration · No card required
          </p>
        </aside>

        <div className="register-panel">
          <div className="register-panel-inner">
            {submitted ? (
              <div className="register-success">
                <div className="register-success-icon">
                  <CheckCircle2 size={34} />
                </div>
                <span className="register-eyebrow">
                  Trial workspace created
                </span>
                <h2>
                  You&apos;re all set, {form.ownerName.split(" ")[0] || "there"}
                  .
                </h2>
                <p>
                  <strong>{form.businessName}</strong> is ready to use on the
                  Trial plan.
                </p>
                <div className="register-next-steps">
                  <div>
                    <span>1</span>
                    <p>
                      <strong>Sign in</strong>Use the admin account you just
                      created.
                    </p>
                  </div>
                  <div>
                    <span>2</span>
                    <p>
                      <strong>Set up your salon</strong>Add services, staff, and
                      availability.
                    </p>
                  </div>
                  <div>
                    <span>3</span>
                    <p>
                      <strong>Start booking</strong>Share your workspace with
                      customers.
                    </p>
                  </div>
                </div>
                <Link href="/login" className="register-primary-button">
                  Return to sign in <ArrowRight size={17} />
                </Link>
              </div>
            ) : (
              <>
                <header className="register-form-header">
                  <div>
                    <span className="register-step">Workspace application</span>
                    <h2>Create your salon workspace</h2>
                    <p>Tell us a little about you and your business.</p>
                  </div>
                  <Link href="/login" className="register-signin-link">
                    Sign in <ArrowRight size={14} />
                  </Link>
                </header>
                <form className="register-form" onSubmit={submit}>
                  <div className="register-section">
                    <div className="register-section-title">
                      <span>
                        <Building2 size={16} />
                      </span>
                      <div>
                        <h3>Business details</h3>
                        <p>How customers will recognize your salon.</p>
                      </div>
                    </div>
                    <div className="register-fields-grid">
                      <label className="register-field register-span-two">
                        <span>Business name</span>
                        <input
                          required
                          autoComplete="organization"
                          placeholder="e.g. Bloom Beauty Studio"
                          value={form.businessName}
                          onChange={(e) =>
                            field("businessName", e.target.value)
                          }
                        />
                      </label>
                      <label className="register-field register-span-two">
                        <span>Workspace URL</span>
                        <div className="register-slug-input">
                          <span>serenity.app/</span>
                          <input
                            required
                            spellCheck={false}
                            pattern="[a-z0-9-]+"
                            title="Use lowercase letters, numbers, and hyphens only"
                            placeholder="your-salon"
                            value={form.slug}
                            onChange={(e) =>
                              field(
                                "slug",
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, ""),
                              )
                            }
                          />
                        </div>
                        <small>
                          Your booking page: serenity.app/{businessSlug}
                        </small>
                      </label>
                      <label className="register-field">
                        <span>
                          Phone <i>Optional</i>
                        </span>
                        <input
                          type="tel"
                          autoComplete="tel"
                          placeholder="+1 555 000 0000"
                          value={form.phone}
                          onChange={(e) => field("phone", e.target.value)}
                        />
                      </label>
                      <label className="register-field">
                        <span>
                          City <i>Optional</i>
                        </span>
                        <div className="register-input-icon">
                          <MapPin size={15} />
                          <input
                            autoComplete="address-level2"
                            placeholder="Your city"
                            value={form.city}
                            onChange={(e) => field("city", e.target.value)}
                          />
                        </div>
                      </label>
                      <label className="register-field register-span-two">
                        <span>
                          Street address <i>Optional</i>
                        </span>
                        <input
                          autoComplete="street-address"
                          placeholder="Studio or business address"
                          value={form.address}
                          onChange={(e) => field("address", e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="register-divider" />
                  <div className="register-section">
                    <div className="register-section-title">
                      <span>
                        <UserRound size={16} />
                      </span>
                      <div>
                        <h3>Your admin account</h3>
                        <p>
                          Use these details to sign in to your trial workspace.
                        </p>
                      </div>
                    </div>
                    <div className="register-fields-grid">
                      <label className="register-field">
                        <span>Your name</span>
                        <input
                          required
                          autoComplete="name"
                          placeholder="Full name"
                          value={form.ownerName}
                          onChange={(e) => field("ownerName", e.target.value)}
                        />
                      </label>
                      <label className="register-field">
                        <span>Work email</span>
                        <div className="register-input-icon">
                          <Mail size={15} />
                          <input
                            required
                            type="email"
                            autoComplete="email"
                            placeholder="you@salon.com"
                            value={form.email}
                            onChange={(e) => field("email", e.target.value)}
                          />
                        </div>
                      </label>
                      <label className="register-field">
                        <span>Password</span>
                        <div className="register-input-icon">
                          <LockKeyhole size={15} />
                          <input
                            required
                            type="password"
                            minLength={8}
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={form.password}
                            onChange={(e) => field("password", e.target.value)}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="register-divider" />
                  <div className="register-section">
                    <div className="register-section-title">
                      <span>
                        <Scissors size={16} />
                      </span>
                      <div>
                        <h3>Your trial plan</h3>
                        <p>
                          Every new workspace starts on Trial. You can choose a
                          paid plan later.
                        </p>
                      </div>
                    </div>
                    {loadingPlans ? (
                      <div className="register-plans-loading">
                        <Loader2 className="spin-icon" size={18} /> Loading
                        available plans…
                      </div>
                    ) : (
                      <div className="register-plan-grid">
                        {plans.map((plan) => {
                          const isTrial = plan.name.toLowerCase() === "trial";
                          return (
                            <div
                              key={plan.id}
                              className={`register-plan-card ${isTrial ? "selected" : ""}`}
                            >
                              {isTrial && (
                                <span className="register-plan-check">
                                  <Check size={12} />
                                </span>
                              )}
                              <strong>{plan.name}</strong>
                              <p>
                                <b>
                                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                                </b>
                                {plan.price > 0 && (
                                  <small>/{plan.interval}</small>
                                )}
                              </p>
                              <span>
                                {isTrial
                                  ? "Included at signup"
                                  : "Available after signup"}{" "}
                                ·{" "}
                                {plan.staffLimit
                                  ? `Up to ${plan.staffLimit} staff`
                                  : "Unlimited staff"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="tenant-login-error" role="alert">
                      <AlertCircle size={16} className="error-icon" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div className="register-submit-row">
                    <p>
                      By continuing, you agree to the platform terms and privacy
                      policy.
                    </p>
                    <button
                      className="register-primary-button"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={17} className="spin-icon" />{" "}
                          Submitting…
                        </>
                      ) : (
                        <>
                          Create workspace <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
