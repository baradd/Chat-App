const mongoose = require('mongoose');

const connectDB = async () => {
  const con = await mongoose.connect(process.env.DATABASE_URI);
  if (con) {
    console.log(`Database in connected on ${con.connection.host}`);
  } else {
    process.exit(0);
  }
};

module.exports = { connectDB };
