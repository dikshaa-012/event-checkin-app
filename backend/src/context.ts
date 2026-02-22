
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface ContextType {
    user: User | null;
}

const extractToken = (maybeHeaderOrToken: any) => {
    if (!maybeHeaderOrToken) return null;
    let token = maybeHeaderOrToken;
    if (typeof token !== 'string') return null;
    token = token.trim();
    if (token.toLowerCase().startsWith('bearer ')) return token.slice(7).trim();
    return token;
};

const context = async (ctx: any): Promise<ContextType> => {
    // Support both HTTP requests (`req.headers.authorization`) and WebSocket connection params
    const req = ctx?.req;
    const connectionCtx = ctx?.connection || ctx?.connectionParams || ctx?.context;

    let rawToken: string | null = null;
    if (req && req.headers) rawToken = extractToken(req.headers.authorization || req.headers.Authorization);
    if (!rawToken && connectionCtx) rawToken = extractToken(connectionCtx.authorization || connectionCtx.Authorization || connectionCtx.authToken || connectionCtx.token);

    if (!rawToken) return { user: null };

    if (!process.env.JWT_SECRET) return { user: null };

    try {
        const payload = jwt.verify(rawToken, process.env.JWT_SECRET) as any;
        if (!payload || !payload.userId) return { user: null };
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, name: true, email: true, role: true }
        });
        if (!user) return { user: null };
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    } catch (err) {
        return { user: null };
    }
};

export default context;