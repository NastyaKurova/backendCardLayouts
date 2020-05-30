const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const app = express();
app.use(express.json({extended: true}));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/partner', require('./routes/partner.routes'));
app.use('/api/manager', require('./routes/manager.routes'));

const PORT = config.get('port');

async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}`));
  } catch (e) {
    console.log('server error', e.message);
    process.exit(1)
  }


}

start();