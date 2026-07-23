"use client";

import {
  Books,
  CheckSquare,
  House,
  Moon,
  Sun,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { getAssetPath } from "../../utils/path";

const THEME_KEY = "aip-c01-theme";

const navItems = [
  { label: "Today", href: getAssetPath("/"), icon: House },
  { label: "Learn", href: getAssetPath("/?view=learn"), icon: Books, active: true },
  { label: "Practice", href: getAssetPath("/?view=practice"), icon: CheckSquare },
  { label: "Errors", href: getAssetPath("/?view=errors"), icon: WarningCircle },
];

function ServicesLogo() {
  return (
    <div className="services-logo" aria-hidden="true">
      <span>A</span>
      <span>I</span>
      <span>P</span>
    </div>
  );
}

export function ServiceShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    const preferred =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    const frame = window.requestAnimationFrame(() => setTheme(preferred));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="services-app-shell">
      <a className="skip-link" href="#services-main">
        Skip to service content
      </a>

      <aside className="services-sidebar">
        <Link className="services-brand" href={getAssetPath("/")} aria-label="AIP-C01 home">
          <ServicesLogo />
          <span>
            <strong>AIP-C01</strong>
            <small>Revision Console</small>
          </span>
        </Link>

        <nav className="services-side-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                className={item.active ? "active" : ""}
                aria-current={item.active ? "page" : undefined}
                key={item.label}
              >
                <Icon size={19} weight={item.active ? "fill" : "regular"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="services-sidebar-note">
          <strong>Exam-first profiles</strong>
          <span>
            Từ khóa là tín hiệu theo ngữ cảnh, không phải luật chọn đáp án tuyệt
            đối.
          </span>
        </div>
      </aside>

      <div className="services-workspace">
        <header className="services-topbar">
          <Link
            className="services-mobile-brand"
            href={getAssetPath("/")}
            aria-label="AIP-C01 home"
          >
            <ServicesLogo />
            <strong>AIP-C01</strong>
          </Link>
          <div className="services-page-context">
            <span>Knowledge map / Services</span>
            <strong>{title}</strong>
          </div>
          <button
            className="services-theme-button"
            type="button"
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
            aria-label={
              theme === "light"
                ? "Chuyển sang giao diện tối"
                : "Chuyển sang giao diện sáng"
            }
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </header>

        <main id="services-main" className="services-main" lang="vi">
          {children}
        </main>
      </div>

      <nav className="services-mobile-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              className={item.active ? "active" : ""}
              aria-current={item.active ? "page" : undefined}
              key={item.label}
            >
              <Icon size={20} weight={item.active ? "fill" : "regular"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
