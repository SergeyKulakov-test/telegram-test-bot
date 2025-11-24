// bot.ts
import { Telegraf, session } from "telegraf";
import dotenv from "dotenv";
import { MyContext, SessionData } from "./types";

dotenv.config();

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not defined in environment variables");
}

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN);

// Инициализация middleware для сессии
bot.use(session({
  defaultSession: (): SessionData => ({
    category: '',
    index: 0
  })
}));

export default bot;