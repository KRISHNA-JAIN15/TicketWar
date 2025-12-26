import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';

// Kafka configuration for AWS EC2
const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
const KAFKA_CLIENT_ID = 'ticketwar-client';

let kafka: Kafka | null = null;
let producer: Producer | null = null;

export function getKafkaClient(): Kafka {
  if (!kafka) {
    kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS,
      ssl: process.env.KAFKA_SSL === 'true',
      sasl: process.env.KAFKA_SASL_USERNAME ? {
        mechanism: 'plain',
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD || '',
      } : undefined,
      connectionTimeout: 10000,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }
  return kafka;
}

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    const client = getKafkaClient();
    producer = client.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });
    await producer.connect();
    console.log('Kafka producer connected');
  }
  return producer;
}

// Topics
export const TOPICS = {
  TICKET_SOLD: 'ticket_sold',
  SEAT_LOCKED: 'seat_locked',
  SEAT_RELEASED: 'seat_released',
  PAYMENT_PROCESSED: 'payment_processed',
};

// Event types
export interface TicketSoldEvent {
  eventId: string;
  seatId: string;
  userId: string;
  price: number;
  timestamp: number;
  row: string;
  seatNumber: number;
  eventName: string;
}

export interface SeatLockedEvent {
  eventId: string;
  seatId: string;
  userId: string;
  lockExpiry: number;
  timestamp: number;
}

export interface SeatReleasedEvent {
  eventId: string;
  seatId: string;
  userId: string;
  reason: 'timeout' | 'user_cancelled' | 'payment_failed';
  timestamp: number;
}

export interface PaymentProcessedEvent {
  eventId: string;
  seatId: string;
  userId: string;
  paymentId: string;
  amount: number;
  status: 'success' | 'failed';
  timestamp: number;
}

// Publish functions
export async function publishTicketSold(event: TicketSoldEvent): Promise<void> {
  try {
    const prod = await getProducer();
    await prod.send({
      topic: TOPICS.TICKET_SOLD,
      messages: [
        {
          key: `${event.eventId}-${event.seatId}`,
          value: JSON.stringify(event),
          timestamp: event.timestamp.toString(),
        },
      ],
    });
    console.log('Published ticket_sold event:', event.seatId);
  } catch (error) {
    console.error('Failed to publish ticket_sold event:', error);
    // In production, you'd want to implement retry logic or dead letter queue
    throw error;
  }
}

export async function publishSeatLocked(event: SeatLockedEvent): Promise<void> {
  try {
    const prod = await getProducer();
    await prod.send({
      topic: TOPICS.SEAT_LOCKED,
      messages: [
        {
          key: `${event.eventId}-${event.seatId}`,
          value: JSON.stringify(event),
          timestamp: event.timestamp.toString(),
        },
      ],
    });
    console.log('Published seat_locked event:', event.seatId);
  } catch (error) {
    console.error('Failed to publish seat_locked event:', error);
  }
}

export async function publishSeatReleased(event: SeatReleasedEvent): Promise<void> {
  try {
    const prod = await getProducer();
    await prod.send({
      topic: TOPICS.SEAT_RELEASED,
      messages: [
        {
          key: `${event.eventId}-${event.seatId}`,
          value: JSON.stringify(event),
          timestamp: event.timestamp.toString(),
        },
      ],
    });
    console.log('Published seat_released event:', event.seatId);
  } catch (error) {
    console.error('Failed to publish seat_released event:', error);
  }
}

export async function publishPaymentProcessed(event: PaymentProcessedEvent): Promise<void> {
  try {
    const prod = await getProducer();
    await prod.send({
      topic: TOPICS.PAYMENT_PROCESSED,
      messages: [
        {
          key: `${event.eventId}-${event.seatId}`,
          value: JSON.stringify(event),
          timestamp: event.timestamp.toString(),
        },
      ],
    });
    console.log('Published payment_processed event:', event.seatId);
  } catch (error) {
    console.error('Failed to publish payment_processed event:', error);
  }
}

// Consumer creation helper
export function createConsumer(groupId: string): Consumer {
  const client = getKafkaClient();
  return client.consumer({ groupId });
}

// Generic message handler type
export type MessageHandler<T> = (event: T) => Promise<void>;

// Start a consumer for a specific topic
export async function startConsumer<T>(
  topic: string,
  groupId: string,
  handler: MessageHandler<T>
): Promise<Consumer> {
  const consumer = createConsumer(groupId);
  
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (message.value) {
        try {
          const event = JSON.parse(message.value.toString()) as T;
          await handler(event);
        } catch (error) {
          console.error(`Error processing message from ${topic}:`, error);
        }
      }
    },
  });

  console.log(`Consumer started for topic: ${topic}`);
  return consumer;
}

// Graceful shutdown
export async function shutdownKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
  kafka = null;
  console.log('Kafka connections closed');
}
