import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID,
    {
      id: "govauth",
      name: "GovAuth",
      type: "oidc",
      issuer: "https://govauth.sandbox.gov.sg/api/auth",
      clientId: process.env.GOVAUTH_CLIENT_ID,
      clientSecret: process.env.GOVAUTH_CLIENT_SECRET,
    },
  ],
  pages: { signIn: "/" },
  callbacks: {
    authorized: async ({ auth: session, request }) => {
      const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
      if (isProtected && !session) return false;
      return true;
    },
  },
});