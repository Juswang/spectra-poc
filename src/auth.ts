import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [MicrosoftEntraID],
  pages: { signIn: "/" },
  callbacks: {
    authorized: async ({ auth: session, request }) => {
      const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
      if (isProtected && !session) return false;
      return true;
    },
  },
});