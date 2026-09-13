"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  apiError,
  getRegistrationPlans,
  login,
  registerTenant,
  type RegistrationPlan,
  type TenantRegistration,
} from "@/tenant/lib/api";
import { slugify } from "@/tenant/lib/domain";

export default function TenantRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<TenantRegistration>({
    businessName: "",
    ownerName: "",
    slug: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [slugModified, setSlugModified] = useState(false);
  const [plans, setPlans] = useState<RegistrationPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("trial");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    getRegistrationPlans()
      .then((data) => {
        setPlans(data);
      })
      .catch(() => {
        // Fallback gracefully to default trial tier
      });
  }, []);

  const handleBusinessNameChange = (value: string) => {
    setForm((prev) => {
      const next = { ...prev, businessName: value };
      if (!slugModified) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleSlugChange = (value: string) => {
    setSlugModified(true);
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-");
    setForm((prev) => ({ ...prev, slug: sanitized }));
  };

  const field = (name: keyof TenantRegistration, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const activeSlug = form.slug.trim() || "your-salon";

  // Build full selectable plans list: 14-Day Free Trial plus server tiers (Basic, Pro, Enterprise)
  const allSelectablePlans = [
    {
      id: "trial",
      name: "14-Day Trial",
      price: 0,
      interval: "14 days",
      staffLimit: 3,
      description: "Full access, no card required",
      badge: "Included",
    },
    ...plans
      .filter((p) => p.name.toLowerCase() !== "trial")
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        interval: p.interval || "month",
        staffLimit: p.staffLimit,
        description: p.staffLimit
          ? `Up to ${p.staffLimit} staff members`
          : "Unlimited staff members",
        badge: undefined,
      })),
  ];

  const selectedPlan =
    allSelectablePlans.find((p) => p.id === selectedPlanId) || allSelectablePlans[0];

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.businessName.trim()) {
      setError("Please enter your salon or business name.");
      return;
    }

    const cleanSlug = form.slug.trim().toLowerCase().replace(/^-+|-+$/g, "");
    if (!cleanSlug || cleanSlug.length < 2) {
      setError("Please provide a valid workspace URL slug (at least 2 characters).");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setError(
        "Workspace URL can only contain lowercase letters, numbers, and single hyphens.",
      );
      return;
    }

    if (!form.ownerName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid work email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    setSaving(true);

    try {
      await registerTenant({
        ...form,
        businessName: form.businessName.trim(),
        ownerName: form.ownerName.trim(),
        email: cleanEmail,
        slug: cleanSlug,
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
        city: form.city?.trim() || undefined,
        planId: selectedPlanId !== "trial" ? selectedPlanId : undefined,
      });

      setSubmitted(true);
      setRedirecting(true);

      // Attempt automatic sign-in immediately after registration
      try {
        await login(cleanEmail, form.password);
        await queryClient.invalidateQueries({ queryKey: ["tenant-session"] });
        setTimeout(() => {
          router.replace("/");
        }, 1200);
      } catch {
        // Fallback: stay on the success card with manual sign-in button
        setRedirecting(false);
      }
    } catch (cause) {
      setError(
        apiError(
          cause,
          "Registration could not be completed. Please check your information.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tenant-login-root">
      {/* Dynamic ambient lights & subtle mesh grid */}
      <div className="login-ambient-orb orb-1" aria-hidden="true" />
      <div className="login-ambient-orb orb-2" aria-hidden="true" />
      <div className="login-grid-overlay" aria-hidden="true" />

      <div className="tenant-login-container tenant-register-container">
        <div className="tenant-login-card tenant-register-card">
          {/* Header */}
          <div className="register-header">
            <div className="login-logo-mark">
              <Sparkles size={22} />
            </div>
            <div className="register-header-text">
              <div className="login-role-badge">
                <Building2 size={12} />
                <span>Salon Registration</span>
              </div>
              <h1 className="tenant-login-title">Create your salon workspace</h1>
              <p className="tenant-login-sub">
                Choose your plan and start managing appointments, staff, and bookings.
              </p>
            </div>
          </div>

          {submitted ? (
            /* Success confirmation screen */
            <div className="register-success-view">
              <div className="register-success-icon-wrap">
                <CheckCircle2 size={36} />
              </div>
              <span className="register-badge-success">Workspace Ready</span>
              <h2>Welcome to Serenity!</h2>
              <p>
                <strong>{form.businessName}</strong> has been created on the{" "}
                <strong>{selectedPlan.name}</strong> plan.
              </p>

              <div className="register-summary-card">
                <div className="summary-row">
                  <span className="summary-label">Workspace URL:</span>
                  <span className="summary-val highlight">
                    serenity.app/{form.slug || "workspace"}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Admin Email:</span>
                  <span className="summary-val">{form.email}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Selected Plan:</span>
                  <span className="summary-val">
                    {selectedPlan.name} ({selectedPlan.price === 0 ? "Free Trial" : `$${selectedPlan.price}/${selectedPlan.interval}`})
                  </span>
                </div>
              </div>

              {redirecting ? (
                <div className="register-redirect-banner">
                  <Loader2 size={18} className="spin-icon" />
                  <span>Signing you into your workspace…</span>
                </div>
              ) : (
                <div className="register-success-actions">
                  <Link href="/login" className="tenant-submit-btn">
                    <span>Sign In to Your Workspace</span>
                    <ArrowRight size={17} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Registration Form */
            <form className="tenant-login-form tenant-register-form" onSubmit={submit} noValidate>
              {/* Section 1: Business details */}
              <div className="register-form-section">
                <div className="section-label-group">
                  <Building2 size={15} className="section-icon" />
                  <h3>Business Details</h3>
                </div>

                <div className="register-grid-2">
                  <div className="tenant-field full-col">
                    <label htmlFor="reg-biz-name" className="field-label">
                      Salon / Business Name <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-prefix-icon">
                        <Building2 size={16} />
                      </span>
                      <input
                        id="reg-biz-name"
                        type="text"
                        required
                        autoComplete="organization"
                        placeholder="e.g. Bloom Beauty Studio"
                        value={form.businessName}
                        onChange={(e) => handleBusinessNameChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="tenant-field full-col">
                    <label htmlFor="reg-slug" className="field-label">
                      Workspace URL & Booking Link <span className="req">*</span>
                    </label>
                    <div className="register-slug-box">
                      <span className="slug-prefix">serenity.app/</span>
                      <input
                        id="reg-slug"
                        type="text"
                        required
                        spellCheck={false}
                        placeholder="bloom-beauty-studio"
                        value={form.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                      />
                    </div>
                    <small className="field-hint">
                      <Globe size={12} />
                      <span>Clients will book at: <b>serenity.app/{activeSlug}</b></span>
                    </small>
                  </div>

                  <div className="tenant-field">
                    <label htmlFor="reg-phone" className="field-label">
                      Phone Number <span className="opt">(Optional)</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-prefix-icon">
                        <Phone size={16} />
                      </span>
                      <input
                        id="reg-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => field("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="tenant-field">
                    <label htmlFor="reg-city" className="field-label">
                      City <span className="opt">(Optional)</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-prefix-icon">
                        <MapPin size={16} />
                      </span>
                      <input
                        id="reg-city"
                        type="text"
                        autoComplete="address-level2"
                        placeholder="e.g. San Francisco"
                        value={form.city}
                        onChange={(e) => field("city", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="tenant-field full-col">
                    <label htmlFor="reg-address" className="field-label">
                      Street Address <span className="opt">(Optional)</span>
                    </label>
                    <input
                      id="reg-address"
                      type="text"
                      className="standard-input"
                      autoComplete="street-address"
                      placeholder="e.g. 742 Evergreen Terrace, Suite 100"
                      value={form.address}
                      onChange={(e) => field("address", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Admin Account */}
              <div className="register-form-section">
                <div className="section-label-group">
                  <UserRound size={15} className="section-icon" />
                  <h3>Admin Account</h3>
                </div>

                <div className="register-grid-2">
                  <div className="tenant-field full-col">
                    <label htmlFor="reg-owner-name" className="field-label">
                      Your Full Name <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-prefix-icon">
                        <UserRound size={16} />
                      </span>
                      <input
                        id="reg-owner-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Sarah Jenkins"
                        value={form.ownerName}
                        onChange={(e) => field("ownerName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="tenant-field full-col">
                    <label htmlFor="reg-email" className="field-label">
                      Work Email Address <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-prefix-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="sarah@bloomstudio.com"
                        value={form.email}
                        onChange={(e) => field("email", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="tenant-field">
                    <label htmlFor="reg-password" className="field-label">
                      Password <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-prefix-icon">
                        <LockKeyhole size={16} />
                      </span>
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={form.password}
                        onChange={(e) => field("password", e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="tenant-field">
                    <label htmlFor="reg-confirm-password" className="field-label">
                      Confirm Password <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-prefix-icon">
                        <LockKeyhole size={16} />
                      </span>
                      <input
                        id="reg-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={
                          showConfirmPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Plan Selection */}
              <div className="register-form-section">
                <div className="section-label-group">
                  <CreditCard size={15} className="section-icon" />
                  <h3>Choose a Plan</h3>
                </div>

                <div className="register-plans-grid">
                  {allSelectablePlans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const isTrial = plan.id === "trial";
                    return (
                      <div
                        key={plan.id}
                        role="button"
                        tabIndex={0}
                        className={`register-plan-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedPlanId(plan.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedPlanId(plan.id);
                          }
                        }}
                      >
                        {isSelected && (
                          <div className="plan-check-icon">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}
                        <div className="plan-name-row">
                          <span className="plan-name">{plan.name}</span>
                          {plan.badge && (
                            <span className="plan-badge-pill">{plan.badge}</span>
                          )}
                        </div>
                        <div className="plan-price">
                          {plan.price === 0 ? (
                            "Free"
                          ) : (
                            <>
                              ${plan.price}
                              <small>/{plan.interval}</small>
                            </>
                          )}
                        </div>
                        <span className="plan-meta">{plan.description}</span>
                      </div>
                    );
                  })}
                </div>

                {selectedPlanId === "trial" ? (
                  <div className="plan-trial-notice">
                    <Sparkles size={14} className="notice-icon" />
                    <span>
                      The <b>14-Day Free Trial</b> includes all core features with no credit card required. You can upgrade anytime.
                    </span>
                  </div>
                ) : (
                  <div className="plan-trial-notice">
                    <Sparkles size={14} className="notice-icon" />
                    <span>
                      Selected <b>{selectedPlan.name} Plan</b> (${selectedPlan.price}/{selectedPlan.interval}). Full access starts immediately.
                    </span>
                  </div>
                )}
              </div>

              {/* Error feedback */}
              {error && (
                <div className="tenant-login-error" role="alert">
                  <AlertCircle size={16} className="error-icon" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                id="tenant-register-submit"
                type="submit"
                className="tenant-submit-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="spin-icon" />
                    <span>Creating your salon workspace…</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedPlanId === "trial"
                        ? "Create Workspace & Start Free Trial"
                        : `Create Workspace with ${selectedPlan.name} Plan`}
                    </span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="login-card-footer">
            <p className="login-portal-switch">
              Already have a salon workspace?{" "}
              <Link href="/login" className="switch-link">
                Sign in to workspace →
              </Link>
            </p>
            <p className="login-portal-switch">
              Looking for client booking?{" "}
              <a
                href="https://saas-customer-lilac.vercel.app"
                className="switch-link"
                target="_blank"
                rel="noreferrer"
              >
                Customer Portal →
              </a>
              {" | "}
              <a
                href="https://saas-provider-opal.vercel.app"
                className="switch-link"
                target="_blank"
                rel="noreferrer"
              >
                Super Admin Console →
              </a>
            </p>
            <div className="login-security-tag">
              <ShieldCheck size={13} />
              <span>Isolated tenant environment • Encrypted session • No credit card required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
