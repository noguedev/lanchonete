import { app } from "./app.js";
import { env } from "./env/env.js";

app.listen({ port: env.PORT }, (err, adress) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  console.log('🚀 Server is running!')
});
