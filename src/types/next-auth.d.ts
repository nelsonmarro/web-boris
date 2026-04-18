import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `auth`, contains the session data.
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id: string
    } & DefaultSession["user"]
  }
}
