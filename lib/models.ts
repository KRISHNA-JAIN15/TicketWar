import mongoose, { Schema, models, model } from 'mongoose';

// User Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Event Schema
const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  artist: {
    type: String,
    required: true,
    trim: true,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '/events/default.jpg',
  },
  color: {
    type: String,
    default: '#ff5733',
  },
  totalSeats: {
    type: Number,
    default: 1000,
  },
  seatsLeft: {
    type: Number,
    default: 1000,
  },
  priceFrom: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ticket Schema
const ticketSchema = new Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  eventSlug: {
    type: String,
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  eventVenue: {
    type: String,
    required: true,
  },
  eventDate: {
    type: String,
    required: true,
  },
  eventTime: {
    type: String,
    required: true,
  },
  seatId: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  row: {
    type: String,
    required: true,
  },
  seatNumber: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  serviceFee: {
    type: Number,
    required: true,
  },
  totalPaid: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'used'],
    default: 'confirmed',
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
eventSchema.index({ isActive: 1, date: 1 });
ticketSchema.index({ userId: 1, purchasedAt: -1 });
ticketSchema.index({ eventId: 1 });

export const User = models.User || model('User', userSchema);
export const Event = models.Event || model('Event', eventSchema);
export const Ticket = models.Ticket || model('Ticket', ticketSchema);

export type IUser = mongoose.InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export type IEvent = mongoose.InferSchemaType<typeof eventSchema> & { _id: mongoose.Types.ObjectId };
export type ITicket = mongoose.InferSchemaType<typeof ticketSchema> & { _id: mongoose.Types.ObjectId };
