"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  // useSession() is a React hook provided by NextAuth.
  // It returns the current user's session data and loading status.
  const { data: session, status } = useSession();

  // While NextAuth is checking if the user is logged in, show a loading state.
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // If the user is logged in, show their name and a sign-out button.
  if (session) {
    return (
      <div>
        <p>
          Signed in as <strong>{session.user?.name ?? session.user?.email}</strong>
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // If the user is NOT logged in, show a sign-in button.
  return (
    <div>
      <p>You are not signed in.</p>
      <button
        onClick={() => signIn("microsoft-entra-id")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Sign in with Microsoft
      </button>
    </div>
  );
}