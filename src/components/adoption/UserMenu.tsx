// User avatar dropdown: name, role label, agency list, sign-out.
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRole } from "@/lib/client-auth-utils";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

export default function UserMenu() {
  const { data: session, status } = useSession();
  const { role, agencyNames } = useRole();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (status === "loading") {
    return <div className="sa-user-avatar sa-user-avatar-loading" />;
  }

  const isGuest = !session;
  const name = session?.user?.name || "Sample User";
  const email = session?.user?.email || "user@gov.sg";
  const initial = name.charAt(0).toUpperCase();
  const displayRole = isGuest ? "Viewer" : (ROLE_LABELS[role] || role);
  const displayAgencies = isGuest ? ["GovTech"] : agencyNames;

  return (
    <div className="sa-user-menu-wrap" ref={menuRef}>
      <button
        className="sa-user-avatar"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div className="sa-user-dropdown">
          <div className="sa-user-dropdown-header">
            <div className="sa-user-avatar sa-user-avatar-lg">{initial}</div>
            <div className="sa-user-dropdown-identity">
              <strong>{name}</strong>
              <span className="sa-user-dropdown-email">{email}</span>
            </div>
          </div>

          <div className="sa-user-dropdown-details">
            <div className="sa-user-dropdown-row">
              <span className="sa-user-dropdown-label">Role</span>
              <span className="sa-user-dropdown-value sa-user-role-badge">
                {displayRole}
              </span>
            </div>
            {displayAgencies.length > 0 && (
              <div className="sa-user-dropdown-row">
                <span className="sa-user-dropdown-label">
                  {displayAgencies.length === 1 ? "Agency" : "Agencies"}
                </span>
                <span className="sa-user-dropdown-value">
                  {displayAgencies.join(", ")}
                </span>
              </div>
            )}
          </div>

          <div className="sa-user-dropdown-footer">
            {isGuest ? (
              <button
                className="sa-user-signout"
                onClick={() => signIn("govauth", { callbackUrl: "/dashboard" })}
              >
                Sign in with GovAuth
              </button>
            ) : (
              <button
                className="sa-user-signout"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
