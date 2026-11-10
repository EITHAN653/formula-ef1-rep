import { pgTable, serial, text, integer, timestamp, unique } from 'drizzle-orm/pg-core';
export const results = pgTable('results', { id: serial().primaryKey(), round: text().notNull(), driver: text().notNull(), pos: integer().notNull(), status: text().notNull(), pts: integer().notNull() }, t => [unique().on(t.round,t.driver),unique().on(t.round,t.pos)]);
export const adjustments = pgTable('adjustments', { id: serial().primaryKey(), driver: text().notNull(), points: integer().notNull(), createdAt: timestamp('created_at').defaultNow() });
export const news = pgTable('news', { id: serial().primaryKey(), title: text().notNull(), content: text().notNull(), createdAt: timestamp('created_at').defaultNow() });
export const sessions = pgTable('sessions', { tokenHash: text('token_hash').primaryKey(), expiresAt: timestamp('expires_at').notNull() });
