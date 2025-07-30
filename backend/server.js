const express = require('express');
const app = express();
const hijriRoute = require('./routes/hijri');

app.use('/api/hijri', hijriRoute);

// Optional: serve frontend build
// app.use(express.static('../frontend/dist'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
