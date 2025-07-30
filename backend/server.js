const express = require('express');
const app = express();
const hijriRoute = require('./routes/hijri');
const namaazRoute = require('./routes/namaaz');

app.use('/api/hijri', hijriRoute);

app.use('/api/namaaz', namaazRoute);

// Optional: serve frontend build
// app.use(express.static('../frontend/dist'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
