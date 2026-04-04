import pino from "pino";
import { LogLayer } from "loglayer";
import { PinoTransport } from "@loglayer/transport-pino";
import { serializeError } from "serialize-error";
import { env } from "@utils/env.js";

const pinoInstance = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export const logger = new LogLayer({
  errorSerializer: serializeError,
  transport: new PinoTransport({ logger: pinoInstance }),
});
