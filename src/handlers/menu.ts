// src/handlers/menu.ts
import { Telegraf, Markup } from "telegraf";
import { MyContext } from "../types";

export default function registerMenuHandlers(bot: Telegraf<MyContext>) {
  bot.start(async (ctx) => {
    await ctx.reply(
      "Добро пожаловать в бот для подготовки к тестам! Выберите категорию:",
      Markup.inlineKeyboard([
        [Markup.button.callback("Manual Testing", "category:manual")],
        [Markup.button.callback("Automation Testing", "category:automation")],
        [Markup.button.callback("Backend", "category:backend")],
        [Markup.button.callback("Frontend", "category:frontend")],
        [Markup.button.callback("Mobile", "category:mobile")],
      ])
    );
  });

  bot.help((ctx) => {
    return ctx.reply(
      "Используйте /start для выбора категории теста.\n\n" +
      "После выбора категории вы будете последовательно отвечать на вопросы. " +
      "Нажмите на вариант ответа, чтобы выбрать его."
    );
  });
}