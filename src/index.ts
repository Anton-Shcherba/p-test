import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

let number = 0;

app.get('/', (request, response) => {
  response.send(`Current num: ${number}`);
});

app.listen(port, () => console.log(`Running on port ${port}`));

setInterval(() => {
  number += 1;
}, 1000);
