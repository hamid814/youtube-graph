const express = require('express');
const fs = require('fs');
const path = require('path');
require('colors');

const app = express();

app.use(express.static('./client/build'));

// log all incomming requests
app.use((req, res, next) => {
  console.log(req.method.blue, req.path.green, req.params);
  next();
});

app.get('/api/data', (req, res) => {
  let data = fs.readFileSync('./data', { encoding: 'utf8' });
  data = JSON.parse(data);

  res.status(200).json(data);
});

// if (process.env.NODE_ENV === 'production') {
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});
// }

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`listening on port ` + PORT);
});
