const express = require('express');
const morgan = require('morgan');

const app = express();

const hijriRoute = require('./routes/hijri');
const namaazRoute = require('./routes/namaaz');
const qiblahRoute = require('./routes/qiblah');

app.use(morgan('combined'));

app.use('/api/hijri', hijriRoute);
app.use('/api/namaaz', namaazRoute);
app.use('/api/qiblah', qiblahRoute);

// Optional: serve frontend build
// app.use(express.static('../frontend/dist'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
