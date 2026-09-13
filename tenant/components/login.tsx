"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { login, logout, apiError } from "@/tenant/lib/api";
import { useWorkspace } from "@/tenant/components/workspace-provider";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useWorkspace();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // If already authenticated as TENANT_ADMIN, smoothly forward to dashboard
  useEffect(() => {
    if (user && user.role === "TENANT_ADMIN") {
      router.replace("/");
    }
  }, [user, router]);

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Please provide both your work email and password.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const authUser = await login(email.trim().toLowerCase(), password);
      if (authUser.role !== "TENANT_ADMIN") {
        await logout();
        const portalHint =
          authUser.role === "CUSTOMER"
            ? " Use the Customer Portal (https://saas-customer-lilac.vercel.app) to book appointments."
            : authUser.role === "PLATFORM_ADMIN"
              ? " Use the Super Admin Console (https://saas-provider-opal.vercel.app) instead."
              : "";
        throw new Error(
          `Access denied. Please sign in with a salon admin account.${portalHint}`,
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["tenant-session"] });
      router.replace("/");
    } catch (cause) {
      setError(
        apiError(
          cause,
          "Invalid credentials. Please verify your email and password.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tenant-login-root">
      {/* Dynamic ambient lights & mesh */}
      <div className="login-ambient-orb orb-1" aria-hidden="true" />
      <div className="login-ambient-orb orb-2" aria-hidden="true" />
      <div className="login-grid-overlay" aria-hidden="true" />

      <div className="tenant-login-container">
        <div className="tenant-login-card">
          {/* Card Header */}
          <div className="login-card-header">
            <div className="login-logo-mark">
              <Sparkles size={22} />
            </div>
            <div className="login-title-group">
              <div className="login-role-badge">
                <Building2 size={12} />
                <span>Salon Admin Workspace</span>
              </div>
              <h1 className="tenant-login-title">Welcome back</h1>
              <p className="tenant-login-sub">
                Sign in to manage your appointments, staff, and customer
                bookings.
              </p>
            </div>
          </div>

          {/* Form */}
          <form className="tenant-login-form" onSubmit={submit} noValidate>
            <div className="tenant-field">
              <label htmlFor="tenant-email" className="field-label">
                Work Email Address
              </label>
              <div className="input-with-icon">
                <span className="input-prefix-icon">
                  <Mail size={17} />
                </span>
                <input
                  id="tenant-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@serenity.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="tenant-field">
              <div className="field-label-row">
                <label htmlFor="tenant-password" className="field-label">
                  Password
                </label>
              </div>
              <div className="input-with-icon">
                <span className="input-prefix-icon">
                  <LockKeyhole size={17} />
                </span>
                <input
                  id="tenant-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {error && (
              <div className="tenant-login-error" role="alert">
                <AlertCircle size={16} className="error-icon" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="tenant-login-submit"
              type="submit"
              className="tenant-submit-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="spin-icon" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="login-card-footer">
            <p className="login-portal-switch">
              New business? <Link href="/register" className="switch-link">Register your salon →</Link>
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
              <span>Isolated tenant environment • Encrypted session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
