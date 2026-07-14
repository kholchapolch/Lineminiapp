const { createServer } = require("node:http");
const next = require("next");

const app = next({ dev: false });
const handle = app.getRequestHandler();
const endpoint = process.env.PORT || "3000";
const hostname = process.env.HOSTNAME || "0.0.0.0";

function listen(server) {
  if (/^\d+$/.test(endpoint)) {
    server.listen(Number(endpoint), hostname);
    return;
  }

  server.listen(endpoint);
}

app
  .prepare()
  .then(() => {
    const server = createServer((request, response) => {
      handle(request, response);
    });

    server.on("error", (error) => {
      console.error("Next.js server failed", error);
      process.exit(1);
    });

    server.on("listening", () => {
      console.log("Next.js server is ready");
    });

    listen(server);
  })
  .catch((error) => {
    console.error("Next.js preparation failed", error);
    process.exit(1);
  });
