import { Telegraf, Markup } from "telegraf";
import { MyContext } from "../types";
import questions from "../data/questions.json";

interface Question {
  question: string;
  answers: string[];
  correct: number;
  explanation?: string;
}

interface QuestionsData {
  [key: string]: Question[];
}

export default function registerQuestionHandlers(bot: Telegraf<MyContext>) {

  // start category
  bot.action(/category:(.*)/, async (ctx) => {
    const category = ctx.match[1];
    const questionsData = questions as QuestionsData;

    if (!questionsData[category]) {
      return ctx.reply("Категория не найдена");
    }

    if (questionsData[category].length === 0) {
      return ctx.reply("В этой категории пока нет вопросов");
    }

    ctx.session.category = category;
    ctx.session.index = 0;

    await sendQuestion(ctx);
  });

  // select answer
  bot.action(/answer:(\d+)/, async (ctx) => {
    const answerIndex = Number(ctx.match[1]);
    const { category, index } = ctx.session;
    const questionsData = questions as QuestionsData;

    if (!category || index === undefined) {
      return ctx.reply("Сессия не инициализирована. Начните заново с /start");
    }

    const categoryQuestions = questionsData[category];
    if (!categoryQuestions || index >= categoryQuestions.length) {
      return ctx.reply("Вопрос не найден");
    }

    const q = categoryQuestions[index];
    const correct = q.correct === answerIndex;

    // Формируем текст с нумерованными ответами
    let resultText = `❓ ${q.question}\n\n`;
    q.answers.forEach((answer, i) => {
      if (i === q.correct) {
        resultText += `🟩 ${i + 1}. ${answer}\n`;
      } else if (i === answerIndex) {
        resultText += `🟥 ${i + 1}. ${answer}\n`;
      } else {
        resultText += `▪️ ${i + 1}. ${answer}\n`;
      }
    });

    resultText += `\n${correct ? "🎉 Верно!" : `ℹ️ Правильный ответ: ${q.correct + 1}`}`;

    if (q.explanation) {
      resultText += `\n\n💡 ${q.explanation}`;
    }

    await ctx.editMessageText(
      resultText,
      Markup.inlineKeyboard([
        [Markup.button.callback("Следующий ➡️", "next")]
      ])
    );
  });

  bot.action("next", async (ctx) => {
    const { category } = ctx.session;
    const questionsData = questions as QuestionsData;
    
    if (!category) {
      return ctx.reply("Сессия не инициализирована. Начните заново с /start");
    }

    ctx.session.index++;

    const list = questionsData[category];
    if (ctx.session.index >= list.length) {
      return ctx.reply("🎉 Тест завершён! Напишите /start чтобы начать заново.");
    }

    await sendQuestion(ctx);
  });
}

async function sendQuestion(ctx: MyContext) {
  const { category, index } = ctx.session;
  const questionsData = questions as QuestionsData;

  if (!category || index === undefined) {
    return ctx.reply("Ошибка сессии. Начните заново с /start");
  }

  const categoryQuestions = questionsData[category];
  if (!categoryQuestions || index >= categoryQuestions.length) {
    return ctx.reply("Вопрос не найден");
  }

  const q = categoryQuestions[index];

  // Создаем сообщение с полными вариантами ответов
  let questionText = `Вопрос ${index + 1}/${categoryQuestions.length}\n❓ ${q.question}\n\n`;
  q.answers.forEach((answer, i) => {
    questionText += `${i + 1}. ${answer}\n`;
  });

  // Создаем кнопки с номерами вместо полного текста
  const buttons = q.answers.map((_, i) => [
    Markup.button.callback(`${i + 1}`, `answer:${i}`)
  ]);

  await ctx.reply(
    questionText,
    Markup.inlineKeyboard(buttons)
  );
}