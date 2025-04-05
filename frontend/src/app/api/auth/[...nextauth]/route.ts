import NextAuth, { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: {
        params: {
          response_type: "code",
          response_mode: "query",
          scope: "openid",
          ready: "true"
        }
      },
      clientId: process.env.WLD_CLIENT_ID,
      clientSecret: process.env.WLD_CLIENT_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          verificationLevel:
            profile["https://id.worldcoin.org/v1"].verification_level,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async redirect({ url }) {
      const localUrl = "http://localhost:3000/app";
      if (process.env.NODE_ENV === "development") {
        return localUrl;
      } else {
        return process.env.NEXTAUTH_URL + "/app";
      }
    }
    
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };