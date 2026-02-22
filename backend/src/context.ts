import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ContextType {
  user: User | null;
}

const extractToken = (maybeHeaderOrToken: unknown): string | null => {
  if (!maybeHeaderOrToken || typeof maybeHeaderOrToken !== "string") {
    return null;
  }

  const token = maybeHeaderOrToken.trim();

  if (token.toLowerCase().startsWith("bearer ")) {
    return token.slice(7).trim();
  }

  return token;
};

const context = async (ctx: any): Promise<ContextType> => {
  const req = ctx?.req;
  const connectionCtx =
    ctx?.connection || ctx?.connectionParams || ctx?.context;

  let rawToken: string | null = null;

  // HTTP requests
  if (req?.headers) {
    rawToken = extractToken(
      req.headers.authorization || req.headers.Authorization
    );
  }

  // WebSocket connections
  if (!rawToken && connectionCtx) {
    rawToken = extractToken(
      connectionCtx.authorization ||
        connectionCtx.Authorization ||
        connectionCtx.authToken ||
        connectionCtx.token
    );
  }

  if (!rawToken) {
    return { user: null };
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET not set");
    return { user: null };
  }

  try {
    const payload = jwt.verify(
      rawToken,
      process.env.JWT_SECRET
    ) as jwt.JwtPayload;

    if (!payload?.userId) {
      return { user: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return { user: null };
    }

    return { user };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return { user: null };
  }
};

export default context;