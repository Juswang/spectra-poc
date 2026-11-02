// NextAuth type augmentation: adds role, agencyCodes, agencyNames to Session and JWT.
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      agencyCodes: string[];
      agencyNames: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    agencyCodes?: string[];
    agencyNames?: string[];
  }
}