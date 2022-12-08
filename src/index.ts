import express from 'express';
import parse21vek, { Product } from './parser/21vek';

const app = express();
const port = process.env.PORT || 3000;

let parsing: Partial<Product>[] = [];

app.get('/', (request, response) => {
  response.send(parsing);
});

app.listen(port, () => console.log(`Running on port ${port}`));

function timeout() {
  setTimeout(async function () {
    parsing = await parse21vek();
    timeout();
  }, 1000);
}

timeout();
