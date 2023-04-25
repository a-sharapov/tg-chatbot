import { printMotd } from "assets/motd";
import config from "config";
import console from "console";
import { flush, ogg2mp3, persist } from "services/audioConverter";
import { ROLES, chat, transcript } from "services/openAI";
import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import { code } from "telegraf/typings/format";

const enum SYS {
  SIGINT = "SIGINT",
  SIGTERM = "SIGTERM",
}

const INITIAL_SESSION = {
  messages: [],
};

const botInstace = new Telegraf(config.get("BOT_TOKEN") as string);

botInstace.use(session());

botInstace.command("new", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Начинаем новый диалог.");
});

botInstace.command("start", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply(`Привет, ${ctx.from?.first_name}!`);
});

botInstace.on(message("text"), async (ctx) => {
  try {
    const request = ctx.message?.text;
    await ctx.reply(code(`❓✍️ ${request}`));
    ctx.session.messages.push({
      role: ROLES.USER,
      text: request,
    });
    const response = await chat([...ctx.session.messages]);
    ctx.session.messages.push({
      role: ROLES.ASSISTANT,
      text: response,
    });

    ctx.reply(response);
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", error);
  }
});

botInstace.on(message("voice"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;

  try {
    await ctx.reply(code("✍️..."));
    const fileLink = await ctx.telegram.getFileLink(
      ctx.message?.voice?.file_id
    );
    const userId = String(ctx.message?.from?.id);
    const source = await persist(fileLink.href, userId);
    const converted = await ogg2mp3(source, userId);
    const transcripted = await transcript(converted);
    flush(converted);
    await ctx.reply(code(`❓📢 ${transcripted}`));

    ctx.session.messages.push({
      role: ROLES.USER,
      text: transcripted,
    });
    const response = await chat([...ctx.session.messages]);
    ctx.session.messages.push({
      role: ROLES.ASSISTANT,
      text: response,
    });

    ctx.reply(response);
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", error);
  }
});

try {
  botInstace.launch();
  printMotd();
} catch (error) {
  console.log("\x1b[31m%s\x1b[0m", error);
}

process.once(SYS.SIGINT, () => botInstace.stop(SYS.SIGINT));
process.once(SYS.SIGTERM, () => botInstace.stop(SYS.SIGTERM));
