import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Tells NextAuth to save users to our PostgreSQL database.
  // Without this, users only exist as JWT cookies — nothing is persisted.
  adapter: PrismaAdapter(prisma),

  // CRITICAL: Adding an adapter changes NextAuth's default from JWT sessions
  // to database sessions. We explicitly set JWT here because:
  // 1. JWT carries role/agency in the cookie (no DB query per page load)
  // 2. It's stateless — better for scaling across multiple servers
  // 3. It matches the app's current behavior
  session: { strategy: "jwt", maxAge: 30 * 60 },

  providers: [
    MicrosoftEntraID,
    {
      id: "govauth",
      name: "GovAuth",
      type: "oidc",
      issuer: "https://govauth.sandbox.gov.sg/api/auth",
      clientId: process.env.GOVAUTH_CLIENT_ID,
      clientSecret: process.env.GOVAUTH_CLIENT_SECRET,
      client: {
        id_token_signed_response_alg: "EdDSA",
        token_endpoint_auth_method: "client_secret_post",
      },
      authorization: {
        params: { scope: "openid profile email" },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],

  pages: { signIn: "/" },

  // Events fire once for specific lifecycle moments.
  // createUser only fires when a brand-new User row is created (first login).
  events: {
    async createUser({ user }) {
      // Find the VIEWER role in the database
      const viewerRole = await prisma.role.findUnique({
        where: { name: "VIEWER" },
      });
      // Assign it to the newly created user
      if (viewerRole && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId: viewerRole.id },
        });
      }
    },
  },

  callbacks: {
    // JWT callback — runs every time a JWT is created or refreshed.
    //
    // On sign-in/sign-up: query the DB for role + agencies, embed in token.
    // On normal page loads: token already has the data, just return it.
    //
    // This means role/agency is read from the DB only at sign-in time,
    // not on every request. If an admin changes your role, you pick it
    // up on your next sign-in.
    async jwt({ token, user, trigger }) {
      if (trigger === "signIn" || trigger === "signUp") {
        const dbUser = await prisma.user.findUnique({
          where: { id: user?.id ?? token.sub! },
          include: {
            role: true,
            agencies: { include: { agency: true } },
          },
        });
        token.role = dbUser?.role?.name ?? "VIEWER";
        token.agencyCodes =
          dbUser?.agencies.map((ua) => ua.agency.code) ?? [];
        token.agencyNames =
          dbUser?.agencies.map((ua) => ua.agency.name) ?? [];
      }
      return token;
    },

    // Session callback — runs every time useSession() or auth() is called.
    // Copies role/agency from the JWT cookie into the session object
    // that your components and API routes see.
    // No database query here — it just reads the cookie.
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role ?? "VIEWER";
      session.user.agencyCodes = token.agencyCodes ?? [];
      session.user.agencyNames = token.agencyNames ?? [];
      return session;
    },

    // Authorized callback — runs in the proxy layer (src/proxy.ts)
    // on every request matching the route matcher.
    // This is a coarse check: "is the user logged in?"
    // Fine-grained role checks happen in page layouts and API routes.
    authorized: async ({ auth: session, request }) => {
      const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
      const isAdmin = request.nextUrl.pathname.startsWith("/admin");
      if (isProtected && !session) return false;
      if (isAdmin && !session) return false;
      return true;
    },
  },
});