import bot from "./bot";
import registerMenuHandlers from "./handlers/menu";
import registerQuestionHandlers from "./handlers/questions";

registerMenuHandlers(bot);
registerQuestionHandlers(bot);

bot.launch();
console.log("Bot is running…");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
