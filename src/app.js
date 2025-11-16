const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');

const app = express();

app.use(cors());                 // allow frontend to call backend
app.use(express.json());         // parse JSON bodies

app.get('/api/health', (req,res) => res.json({ ok: true, time: new Date() }));

// show friendly root page (add above `app.use('/api', apiRoutes);`)
app.get('/', (req, res) => {
  // simple HTML response
  res.send(`<h1>TeamProgress API</h1>
            <p>Server is running. Use <a href="/api/health">/api/health</a> to check health.</p>`);
});

app.use('/api', apiRoutes);      // mount all API routes under /api

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
