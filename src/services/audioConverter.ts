import installer from "@ffmpeg-installer/ffmpeg";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { createWriteStream } from "fs";
import { unlink } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

ffmpeg.setFfmpegPath(installer.path);

const _DIR_NAME = dirname(fileURLToPath(import.meta.url));

const randomId = Math.random().toString(36).substring(2, 15);

export const flush = async (filename: string): Promise<void> => {
  try {
    await unlink(filename);
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", error);
  }
};

export const persist = async (
  url: string,
  filename: string
): Promise<string | void> => {
  try {
    const path = resolve(
      _DIR_NAME,
      join("..", "..", "public", "messages", `${filename}_${randomId}.ogg`)
    );
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });
    return new Promise((resolve) => {
      const stream = createWriteStream(path);
      response.data.pipe(stream);
      stream.on("finish", () => resolve(path));
    });
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", error);
  }
};

export const ogg2mp3 = (filename: string, preffix: string): Promise<string> => {
  try {
    const path = resolve(
      _DIR_NAME,
      join("..", "..", "public", "messages", `${preffix}_${randomId}.mp3`)
    );
    return new Promise((resolve, reject) => {
      ffmpeg(filename)
        .inputOptions(["-f ogg", "-t 30"])
        .audioBitrate(128)
        .output(path)
        .on("end", () => {
          flush(filename);
          resolve(path);
        })
        .on("error", (e: Error) => reject(e.message))
        .run();
    });
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", error);
  }
};
