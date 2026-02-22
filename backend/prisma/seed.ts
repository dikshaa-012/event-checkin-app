import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function seed() {
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create users if they don't exist
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { role: 'ADMIN' },
        create: {
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'ADMIN'
        } as any
    });

    const regularUser = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: { role: 'USER' },
        create: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            role: 'USER'
        } as any
    });

    // Create events if they don't exist
    const event1 = await prisma.event.upsert({
        where: { id: '1' },
        update: {},
        create: {
            id: '1',
            name: 'ReactConf',
            location: 'San Francisco',
            startTime: new Date('2026-07-01T10:00:00Z'),
            category: 'Tech'
        } as any
    });

    const event2 = await prisma.event.upsert({
        where: { id: '2' },
        update: {},
        create: {
            id: '2',
            name: 'GraphQLConf',
            location: 'New York',
            startTime: new Date('2026-08-15T09:00:00Z'),
            category: 'Tech'
        } as any
    });

    const event3 = await prisma.event.upsert({
        where: { id: '3' },
        update: {},
        create: {
            id: '3',
            name: 'Music Festival',
            location: 'Los Angeles',
            startTime: new Date('2026-09-20T18:00:00Z'),
            category: 'Music'
        } as any
    });

    console.log('Seeded users and events successfully');
}

seed().then(() => {
    console.log('Seeded');
    prisma.$disconnect();
});
