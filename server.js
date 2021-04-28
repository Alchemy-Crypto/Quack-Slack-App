const express = require('express');
const app = express();

app.use(express.json());
app.use('/slack/events', require('./controllers/events.js'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

app.listen(PORT, function () {
  console.log('Server listening on: http://localhost:%s', PORT);
});