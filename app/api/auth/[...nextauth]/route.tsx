import NextAuth, { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "signin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"username" | "password", string> | undefined,
      ): Promise<User | null> {
        if (credentials === undefined) {
          return new Promise((resolve) => {
            resolve(null);
          });
        }
        return await fetch(
          process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          },
        )
          .then((response) => {
            return response.ok
              ? response.json()
              : response.text().then((error) => {
                  return Promise.reject({
                    code: response.status,
                    reason: error,
                  });
                });
          })
          .then((jwt: { token: string }) => {
            return {
              id: credentials.username,
              jwt: jwt.token,
              name: credentials.username,
            };
          })
          .catch((reason: { code: number; reason: string }) => {
            console.log(
              `Failed to signin with backend. Response code = ${reason.code}. Response message = ${JSON.stringify(reason)}`,
            );
            if (reason.code !== 401) {
              throw new Error();
            }
            return null;
          });
      },
    }),
    CredentialsProvider({
      id: "signup",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        timeZone: { label: "TimeZone", type: "text" },
      },
      async authorize(
        credentials:
          Record<"username" | "password" | "timeZone", string> | undefined,
      ): Promise<User | null> {
        if (credentials === undefined) {
          return new Promise((resolve) => {
            resolve(null);
          });
        }
        return await fetch(
          process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/user",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
              time_zone: credentials.timeZone,
            }),
          },
        )
          .then((response) => {
            return response.ok
              ? response.json()
              : response.text().then((error) => {
                  return Promise.reject({
                    code: response.status,
                    reason: error,
                  });
                });
          })
          .then((jwt: { token: string }) => {
            return {
              id: credentials.username,
              jwt: jwt.token,
              name: credentials.username,
            };
          })
          .catch((reason: { code: number; reason: string }) => {
            console.log(
              `Failed to signup with backend. Response code = ${reason.code}. Response message = ${JSON.stringify(reason)}`,
            );
            if (reason.code !== 401) {
              throw new Error();
            }
            return null;
          });
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.accessToken = user.jwt;
        token.username = user.name!;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken;
      session.username = token.username;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
