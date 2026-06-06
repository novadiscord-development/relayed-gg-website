import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        login: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectDB();

        const login = credentials.login?.trim();
        const password = credentials.password;

        if (!login || !password) {
          throw new Error("Please enter your login details");
        }

        const user = await User.findOne({
          $or: [{ email: login.toLowerCase() }, { username: login }],
        });

        if (!user) {
          throw new Error("Invalid email, username or password");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          throw new Error("Invalid email, username or password");
        }

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          image: user.avatar,
          isStaff: user.isStaff,
          isAdmin: user.isAdmin,
          badges: user.badges || [],
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isStaff = user.isStaff;
        token.isAdmin = user.isAdmin;
        token.badges = user.badges || [];
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.isStaff = token.isStaff || false;
      session.user.isAdmin = token.isAdmin || false;
      session.user.badges = token.badges || [];

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);