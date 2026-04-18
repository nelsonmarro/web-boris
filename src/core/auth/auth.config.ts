export const authConfig = {
  providers: [
    // Future providers
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
