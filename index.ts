import express from 'express';
import {json} from 'body-parser';
import path from 'path';

const app = express();
app.use(json())

let mode = 1;

app.get('/', (req, res, next) => {
  res.sendFile(path.resolve(__dirname, 'index.html'))
})

app.post('/config', (req, res, next) => {
  mode = parseInt(req.body.mode);
  res.send('');
})

app.get('/books', (req, res, next) => {
  switch (mode) {
    case 1:
      return res.send('Books');
    case 2:
      return res.send('Magazines');
  }
  return res.send('Invalid config')
})

app.listen(4000);