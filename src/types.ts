// src/types.ts
import { Context } from "telegraf";

export interface SessionData {
  category: string;
  index: number;
}

export interface MyContext extends Context {
  session: SessionData;
}