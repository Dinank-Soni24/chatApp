const express = require('express');

const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'api', 'public')));

// Define route handler for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api', 'public', 'index.html'));
});

// handle 404
app.use((req, res, next) => {
  const err = new Error('not found');
  err.status = 404;
  next(err);
});

// handle errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    err: {
      message: err.message,
    },
  });
});

module.exports = app;
