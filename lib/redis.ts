import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || "rediss://default:AR0rAAImcDFlNmY5ZTIxNTRhMjE0MGUzOGVhYzVmZGViNDBkOTA2M3AxNzQ2Nw@rested-frog-7467.upstash.io:6379";

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  }
  return redis;
}

// Seat status constants
export const SEAT_STATUS = {
  AVAILABLE: 'available',
  LOCKED: 'locked',
  SOLD: 'sold',
} as const;

export type SeatStatus = typeof SEAT_STATUS[keyof typeof SEAT_STATUS];

// Key patterns
export const KEYS = {
  seatStatus: (eventId: string, seatId: string) => `event:${eventId}:seat:${seatId}:status`,
  seatLock: (eventId: string, seatId: string) => `event:${eventId}:seat:${seatId}:lock`,
  seatUser: (eventId: string, seatId: string) => `event:${eventId}:seat:${seatId}:user`,
  userSession: (userId: string) => `user:${userId}:session`,
  eventSeats: (eventId: string) => `event:${eventId}:seats`,
};

// Lock duration in seconds (10 minutes)
export const LOCK_DURATION = 600;

// Atomic seat locking using SETNX
export async function lockSeat(
  eventId: string,
  seatId: string,
  userId: string
): Promise<{ success: boolean; message: string; lockExpiry?: number }> {
  const client = getRedisClient();
  const lockKey = KEYS.seatLock(eventId, seatId);
  const statusKey = KEYS.seatStatus(eventId, seatId);
  const userKey = KEYS.seatUser(eventId, seatId);

  try {
    // Check if seat is already sold
    const currentStatus = await client.get(statusKey);
    if (currentStatus === SEAT_STATUS.SOLD) {
      return { success: false, message: 'Seat already sold' };
    }

    // Try to acquire lock using SETNX (atomic operation)
    const lockAcquired = await client.setnx(lockKey, userId);

    if (lockAcquired === 1) {
      // Lock acquired successfully
      const expiry = Date.now() + LOCK_DURATION * 1000;
      
      // Set expiration and update status atomically using pipeline
      const pipeline = client.pipeline();
      pipeline.expire(lockKey, LOCK_DURATION);
      pipeline.setex(statusKey, LOCK_DURATION, SEAT_STATUS.LOCKED);
      pipeline.setex(userKey, LOCK_DURATION, userId);
      await pipeline.exec();

      return { 
        success: true, 
        message: 'Seat locked successfully',
        lockExpiry: expiry
      };
    } else {
      // Lock already held by someone else
      const existingUser = await client.get(lockKey);
      if (existingUser === userId) {
        // Same user already has the lock
        const ttl = await client.ttl(lockKey);
        return { 
          success: true, 
          message: 'You already have this seat locked',
          lockExpiry: Date.now() + ttl * 1000
        };
      }
      return { success: false, message: 'Seat already locked by another user' };
    }
  } catch (error) {
    console.error('Error locking seat:', error);
    return { success: false, message: 'Failed to lock seat' };
  }
}

// Release seat lock
export async function releaseSeat(
  eventId: string,
  seatId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const client = getRedisClient();
  const lockKey = KEYS.seatLock(eventId, seatId);
  const statusKey = KEYS.seatStatus(eventId, seatId);
  const userKey = KEYS.seatUser(eventId, seatId);

  try {
    // Verify the user owns the lock
    const lockOwner = await client.get(lockKey);
    if (lockOwner !== userId) {
      return { success: false, message: 'You do not own this seat lock' };
    }

    // Release the lock
    const pipeline = client.pipeline();
    pipeline.del(lockKey);
    pipeline.del(statusKey);
    pipeline.del(userKey);
    await pipeline.exec();

    return { success: true, message: 'Seat released successfully' };
  } catch (error) {
    console.error('Error releasing seat:', error);
    return { success: false, message: 'Failed to release seat' };
  }
}

// Mark seat as sold
export async function markSeatSold(
  eventId: string,
  seatId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const client = getRedisClient();
  const lockKey = KEYS.seatLock(eventId, seatId);
  const statusKey = KEYS.seatStatus(eventId, seatId);
  const userKey = KEYS.seatUser(eventId, seatId);

  try {
    // Verify the user owns the lock
    const lockOwner = await client.get(lockKey);
    if (lockOwner !== userId) {
      return { success: false, message: 'Lock expired or not owned by you' };
    }

    // Mark as sold (permanent - no expiry)
    const pipeline = client.pipeline();
    pipeline.del(lockKey);
    pipeline.set(statusKey, SEAT_STATUS.SOLD);
    pipeline.set(userKey, userId);
    await pipeline.exec();

    return { success: true, message: 'Seat marked as sold' };
  } catch (error) {
    console.error('Error marking seat as sold:', error);
    return { success: false, message: 'Failed to mark seat as sold' };
  }
}

// Get seat status
export async function getSeatStatus(
  eventId: string,
  seatId: string
): Promise<{ status: SeatStatus; lockedBy?: string; ttl?: number }> {
  const client = getRedisClient();
  const statusKey = KEYS.seatStatus(eventId, seatId);
  const lockKey = KEYS.seatLock(eventId, seatId);
  const userKey = KEYS.seatUser(eventId, seatId);

  try {
    const [status, lockedBy, ttl] = await Promise.all([
      client.get(statusKey),
      client.get(userKey),
      client.ttl(lockKey),
    ]);

    return {
      status: (status as SeatStatus) || SEAT_STATUS.AVAILABLE,
      lockedBy: lockedBy || undefined,
      ttl: ttl > 0 ? ttl : undefined,
    };
  } catch (error) {
    console.error('Error getting seat status:', error);
    return { status: SEAT_STATUS.AVAILABLE };
  }
}

// Get all seats status for an event (batch operation)
export async function getAllSeatsStatus(
  eventId: string,
  seatIds: string[]
): Promise<Record<string, { status: SeatStatus; lockedBy?: string; ttl?: number }>> {
  const client = getRedisClient();
  const result: Record<string, { status: SeatStatus; lockedBy?: string; ttl?: number }> = {};

  try {
    const pipeline = client.pipeline();
    
    for (const seatId of seatIds) {
      pipeline.get(KEYS.seatStatus(eventId, seatId));
      pipeline.get(KEYS.seatUser(eventId, seatId));
      pipeline.ttl(KEYS.seatLock(eventId, seatId));
    }

    const responses = await pipeline.exec();
    
    if (responses) {
      for (let i = 0; i < seatIds.length; i++) {
        const statusIdx = i * 3;
        const status = responses[statusIdx]?.[1] as string | null;
        const lockedBy = responses[statusIdx + 1]?.[1] as string | null;
        const ttl = responses[statusIdx + 2]?.[1] as number;

        result[seatIds[i]] = {
          status: (status as SeatStatus) || SEAT_STATUS.AVAILABLE,
          lockedBy: lockedBy || undefined,
          ttl: ttl > 0 ? ttl : undefined,
        };
      }
    }
  } catch (error) {
    console.error('Error getting all seats status:', error);
    // Return all as available on error
    for (const seatId of seatIds) {
      result[seatId] = { status: SEAT_STATUS.AVAILABLE };
    }
  }

  return result;
}

// Initialize stadium seats in Redis
export async function initializeStadiumSeats(eventId: string, rows: number, seatsPerRow: number) {
  const client = getRedisClient();
  const pipeline = client.pipeline();
  const seatsKey = KEYS.eventSeats(eventId);

  // Store seat configuration
  pipeline.hset(seatsKey, 'rows', rows.toString(), 'seatsPerRow', seatsPerRow.toString());

  await pipeline.exec();
  console.log(`Initialized stadium with ${rows} rows and ${seatsPerRow} seats per row`);
}
