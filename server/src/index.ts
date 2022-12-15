import express from 'express';
import parser from './parser';

const app = express();
const port = process.env.PORT || 3000;

let data: Awaited<ReturnType<typeof parser>> = [];

app.get('/', (_, response) => {
  response.send(data);
});

app.listen(port, () => console.log(`Running on port ${port}`));

function timeout() {
  setTimeout(async function () {
    try {
      data = await parser();
    } catch (error) {
      console.log(error);
    }
    timeout();
  }, 1000);
}

timeout();
