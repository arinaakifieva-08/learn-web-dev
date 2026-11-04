import { database } from "./database.js";

const DELAY_MS = 500;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(data));
}

export default function apiMiddleware() {
  return {
    name: "api-middleware",

    configureServer(server) {
      console.log("API middleware загружен");

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api/")) {
          return next();
        }

        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === "GET" && req.url === "/api/booking/today") {
          await delay(DELAY_MS);
          return sendJson(res, 200, database.today);
        }

        const slotsMatch = req.url.match(/^\/api\/slots/);

        if (req.method === "GET" && slotsMatch) {
          await delay(DELAY_MS);

          const url = new URL(req.url, "http://localhost");
          const day = parseInt(url.searchParams.get("day"), 10);
          const month = parseInt(url.searchParams.get("month"), 10);
          const year = parseInt(url.searchParams.get("year"), 10);

          if (isNaN(day) || isNaN(month) || isNaN(year)) {
            return sendJson(res, 400, {
              error: "Нужны параметры day, month, year",
            });
          }

          const slots =
            day % 2 === 0
              ? database.slotsEvenDay
              : database.slotsOddDay;

          return sendJson(res, 200, {
            date: { day, month, year },
            slots,
          });
        }

        return sendJson(res, 404, {
          error: `Не найдено: ${req.url}`,
        });
      });
    },
  };
}

