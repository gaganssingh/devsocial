const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
   try {
      await mongoose.connect(process.env.MONGOURI, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      });
      console.log(`MongoDB connected`);
   } catch (err) {
      console.error(err.message);

      process.exit(1); // Exit process in case of a failure
   }
};

module.exports = connectDB;
