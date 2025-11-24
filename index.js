require('dotenv').config();
const { Telegraf, Markup, session } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;

// Простой HTTP сервер для Render
app.get('/', (req, res) => {
  res.send('🤖 Telegram Test Bot is running!');
});

app.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});

// Базовая структура сессии
bot.use(session({
  defaultSession: () => ({
    category: '',
    index: 0,
    questionOrder: []
  })
}));

// Импортируем вопросы
const questions = require('./data/questions.json');

// Функция для перемешивания массива
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Команда start
bot.start((ctx) => {
  ctx.reply(
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

// Обработчик выбора категории
bot.action(/category:(.*)/, async (ctx) => {
  const category = ctx.match[1];
  
  if (!questions[category] || questions[category].length === 0) {
    return ctx.reply("В этой категории пока нет вопросов");
  }

  const questionOrder = shuffleArray(questions[category].map((_, index) => index));
  
  ctx.session.category = category;
  ctx.session.index = 0;
  ctx.session.questionOrder = questionOrder;

  await sendQuestion(ctx);
});

// Обработчик ответов
bot.action(/answer:(\d+)/, async (ctx) => {
  const answerIndex = Number(ctx.match[1]);
  const { category, index, questionOrder } = ctx.session;

  if (!category || index === undefined || !questionOrder) {
    return ctx.reply("Сессия не инициализирована. Начните заново с /start");
  }

  const currentQuestionIndex = questionOrder[index];
  const q = questions[category][currentQuestionIndex];
  const correct = q.correct === answerIndex;

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

// Следующий вопрос
bot.action("next", async (ctx) => {
  const { category, questionOrder } = ctx.session;
  
  if (!category || !questionOrder) {
    return ctx.reply("Сессия не инициализирована. Начните заново с /start");
  }

  ctx.session.index++;

  if (ctx.session.index >= questionOrder.length) {
    return ctx.reply("🎉 Тест завершён! Напишите /start чтобы начать заново.");
  }

  await sendQuestion(ctx);
});

// Функция отправки вопроса
async function sendQuestion(ctx) {
  const { category, index, questionOrder } = ctx.session;
  const currentQuestionIndex = questionOrder[index];
  const q = questions[category][currentQuestionIndex];

  let questionText = `Вопрос ${index + 1}/${questionOrder.length}\n❓ ${q.question}\n\n`;
  q.answers.forEach((answer, i) => {
    questionText += `${i + 1}. ${answer}\n`;
  });

  const buttons = q.answers.map((_, i) => [
    Markup.button.callback(`${i + 1}`, `answer:${i}`)
  ]);

  await ctx.reply(
    questionText,
    Markup.inlineKeyboard(buttons)
  );
}

// Запуск бота
bot.launch();
console.log("Bot is running on Render!");

// Обработка завершения
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));