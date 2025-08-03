const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

const hijriRoute = require('./routes/hijri');
const namaazRoute = require('./routes/namaaz');
const qiblahRoute = require('./routes/qiblah');
const weatherRoute = require('./routes/weather');

app.use(morgan('combined'));

app.use('/api/hijri', hijriRoute);
app.use('/api/namaaz', namaazRoute);
app.use('/api/qiblah', qiblahRoute);
app.use('/api/weather', weatherRoute);

app.use(express.static(path.join(__dirname,'../frontend')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
