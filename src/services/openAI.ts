import config from "config";
import { createReadStream } from "fs";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: config.get("OPENAI_API_KEY") as string,
});

const OAIInstace = new OpenAIApi(configuration);

export const enum ROLES {
  ASSISTANT = "assistant",
  USER = "user",
  SYSTEM = "system",
}

export const chat = async (
  messages: Array<ChatCompletionRequestMessage>
): Promise<string> => {
  try {
    const response = await OAIInstace.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
    });

    return response.data.choices[0].message?.content as string;
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", error);
  }
};
export const transcript = async (path: string): Promise<string> => {
  try {
    const response = await OAIInstace.createTranscription(
      createReadStream(path),
      "whisper-1"
    );

    return response.data.text;
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", error);
  }
};
