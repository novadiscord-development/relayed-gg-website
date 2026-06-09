import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  trustHost: true,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        login: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectDB();

        const login = credentials?.login?.trim();
        const password = credentials?.password;

        if (!login || !password) return null;

        const user = await User.findOne({
          $or: [{ email: login.toLowerCase() }, { username: login }],
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          avatar: user.avatar || "/logo.png",
          image: user.avatar || "/logo.png",
          isStaff: user.isStaff || false,
          isAdmin: user.isAdmin || false,
          badges: user.badges || [],
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.avatar = user.avatar || user.image || "/logo.png";
        token.isStaff = user.isStaff || false;
        token.isAdmin = user.isAdmin || false;
        token.badges = user.badges || [];
      }

      if (trigger === "update") {
        if (session?.user?.username) {
          token.username = session.user.username;
        }

        if (session?.user?.avatar || session?.user?.image) {
          token.avatar = session.user.avatar || session.user.image;
        }

        if (session?.user?.badges) {
          token.badges = session.user.badges;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.email = token.email;
      session.user.avatar = token.avatar || "/logo.png";
      session.user.image = token.avatar || "/logo.png";
      session.user.isStaff = token.isStaff || false;
      session.user.isAdmin = token.isAdmin || false;
      session.user.badges = token.badges || [];

      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);