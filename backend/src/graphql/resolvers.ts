import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const ensureJwtSecret = () => {
    if (!process.env.JWT_SECRET) throw new Error('Server misconfigured: JWT_SECRET not set');
    return process.env.JWT_SECRET;
};

const resolvers = {
    Query: {
        events: async (_: any, { category, search, date }: any) => {
            const where: any = {};
            if (category) where.category = category;
            if (search) where.name = { contains: search, mode: 'insensitive' };
            if (date) where.startTime = { gte: new Date(date) };
            const events = await prisma.event.findMany({ where, include: { attendees: true } });
            return events.map(event => ({ ...event, attendeeCount: event.attendees.length }));
        },

        event: async (_: any, { id }: any) => {
            return prisma.event.findUnique({
                where: { id },
                include: { attendees: true }
            });
        },

        me: async (_: any, __: any, context: any) => {
            if (!context.user) return null;
            return prisma.user.findUnique({
                where: { id: context.user.id },
                select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
            });
        },

        eventStats: async (_: any, { eventId }: any, context: any) => {
            if (!context.user || context.user.role !== 'ADMIN') throw new Error('Admin required');
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: { attendees: true, attendanceLogs: true }
            });
            if (!event) throw new Error('Event not found');

            const totalAttendees = event.attendees?.length || 0;
            const logs = event.attendanceLogs || [];

            // join rate: fraction of logs that have a leave timestamp
            const joinRate = logs.length > 0 ? logs.filter((l: any) => !!l.leftAt).length / logs.length : 0;

            // peak concurrent: guard empty logs to avoid Math.max on empty array
            let peakConcurrent = 0;
            if (logs.length > 0) {
                peakConcurrent = Math.max(...logs.map((l: any) => logs.filter((ll: any) => ll.joinedAt <= l.joinedAt && (!ll.leftAt || ll.leftAt >= l.joinedAt)).length));
            }

            const totalUsers = await prisma.user.count();
            const participationPercentage = totalUsers > 0 ? (totalAttendees / totalUsers) * 100 : 0;

            return { totalAttendees, joinRate, peakConcurrent, participationPercentage };
        },

        attendanceLogs: async (_: any, { eventId }: any, context: any) => {
            if (!context.user || context.user.role !== 'ADMIN') throw new Error('Admin required');
            return prisma.attendanceLog.findMany({
                where: { eventId },
                include: { user: true }
            });
        },

        publicEvent: async (_: any, { slug }: any) => {
            // Assume slug is event id for now
            return prisma.event.findUnique({
                where: { id: slug },
                include: { attendees: true }
            });
        }
    },
    Mutation: {
        register: async (_: any, { name, email, password }: any) => {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) throw new Error('User already exists');
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                // cast to any to avoid transient client type mismatches
                data: { name, email, password: hashedPassword } as any,
                select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
            });
            const secret = ensureJwtSecret();
            const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });
            return { token, user };
        },

        login: async (_: any, { email, password }: any) => {
            let user = await prisma.user.findUnique({
                where: { email }
        });

            if (!user) {
                const hashedPassword = await bcrypt.hash(password, 10);

                user = await prisma.user.create({
                    data: {
                        name: email.split("@")[0],
                        email,
                        password: hashedPassword,
                        role: "USER"
                    }
                });
            } else {
                if (!user.password || !(await bcrypt.compare(password, user.password))) {
                    throw new Error("Invalid credentials");
                }
            }

            const secret = ensureJwtSecret();
            const token = jwt.sign(
                { userId: user.id },
                secret,
                { expiresIn: "7d" }
            );

            return {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            };
        },

        joinEvent: async (_: any, { eventId }: any, context: any) => {
            const user = context.user;
            if (!user) throw new Error("Not authenticated");

            // connect attendee only if not already connected
            const already = await prisma.event.findFirst({ where: { id: eventId, attendees: { some: { id: user.id } } } });
            if (!already) {
                await prisma.event.update({
                    where: { id: eventId },
                    data: { attendees: { connect: { id: user.id } } },
                });
            }

            // create an open attendance log only if one doesn't already exist
            const openLog = await prisma.attendanceLog.findFirst({ where: { userId: user.id, eventId, leftAt: null } });
            if (!openLog) {
                await prisma.attendanceLog.create({ data: { userId: user.id, eventId, joinedAt: new Date() } as any });
            }

            return prisma.event.findUnique({ where: { id: eventId }, include: { attendees: true } });
        },

        leaveEvent: async (_: any, { eventId }: any, context: any) => {
            const user = context.user;
            if (!user) throw new Error("Not authenticated");

            const log = await prisma.attendanceLog.findFirst({ where: { userId: user.id, eventId, leftAt: null } });
            if (log) {
                await prisma.attendanceLog.update({ where: { id: log.id }, data: { leftAt: new Date() } });
            }

            // disconnect only if connected
            const connected = await prisma.event.findFirst({ where: { id: eventId, attendees: { some: { id: user.id } } } });
            if (connected) {
                await prisma.event.update({ where: { id: eventId }, data: { attendees: { disconnect: { id: user.id } } } });
            }

            return prisma.event.findUnique({ where: { id: eventId }, include: { attendees: true } });
        },

        createEvent: async (_: any, args: any, context: any) => {
            if (!context.user || context.user.role !== 'ADMIN') throw new Error('Admin required');
            const data = args?.data ?? args;
            return prisma.event.create({ data: data as any });
        },

        updateEvent: async (_: any, { id, ...data }: any, context: any) => {
            if (!context.user || context.user.role !== 'ADMIN') throw new Error('Admin required');
            return prisma.event.update({ where: { id }, data: data as any });
        },

        deleteEvent: async (_: any, { id }: any, context: any) => {
            if (!context.user || context.user.role !== 'ADMIN') throw new Error('Admin required');
            await prisma.event.delete({ where: { id } });
            return true;
        },

        closeEvent: async (_: any, { id }: any, context: any) => {
            if (!context.user || context.user.role !== 'ADMIN') throw new Error('Admin required');
            return prisma.event.update({ where: { id }, data: { isClosed: true } });
        },

        exportAttendees: async (_: any, { eventId }: any, context: any) => {
            if (!context.user || context.user.role !== 'ADMIN') throw new Error('Admin required');
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: { attendees: true }
            });
            if (!event) throw new Error('Event not found');

            // Generate CSV
            const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
            const csvWriter = createCsvWriter({
                header: [
                    { id: 'id', title: 'ID' },
                    { id: 'name', title: 'Name' },
                    { id: 'email', title: 'Email' },
                    { id: 'role', title: 'Role' }
                ]
            });
            const csv = csvWriter.getHeaderString() + csvWriter.stringifyRecords(event.attendees);
            return csv;
        }
    },

    Event: {
        attendeeCount: (event: any) => event.attendees?.length || 0
    },

    AttendanceLog: {
        duration: (log: any) => {
            if (!log.leftAt) return null;
            return Math.floor((new Date(log.leftAt).getTime() - new Date(log.joinedAt).getTime()) / 1000);
        }
    }
};

export default resolvers;
