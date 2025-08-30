// migrate-dates.js
const mongoose = require('mongoose');
const Log = require('./models/Log');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agri-diary';



mongoose.connect(MONGO_URI)
  .then(async () => {
    const logs = await Log.find({}); // check and convert if date is a string-like value
    for (const l of logs) {
      if (typeof l.date === 'string') {
        const d = new Date(l.date);
        if (!isNaN(d.getTime())) {
          l.date = d;
          await l.save();
          console.log('Converted', l._id);
        } else {
          console.log('Invalid date for', l._id, l.date);
        }
      }
    }
    process.exit(0);
  }).catch(err => { console.error(err); process.exit(1); });
