import express from 'express';
import cors from 'cors';
import parser from './parser';

const app = express();
const port = process.env.PORT || 3000;

let data: Awaited<ReturnType<typeof parser>> = [];

app.use(cors());

app.get('/', (_, response) => {
  response.send(JSON.stringify(data));
});

app.listen(port, () => console.log(`Running on port ${port}`));

function timeout() {
  setTimeout(async function () {
    try {
      data = await (await parser()).sort((p1, p2) => (p1.priceForOne || Infinity) - (p2.priceForOne || Infinity));
    } catch (error) {
      console.log(error);
    }
    timeout();
  }, 1000);
}

timeout();
