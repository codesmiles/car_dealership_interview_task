import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();



const dbName = `car_dealership_test_${Date.now()}`

export const prepare_database = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(`${process.env.MONGODB_URL}/${dbName}`)
    console.log('Connected to MongoDB for testing');
  }

};

export const cleanup_database = async () => {
  if (mongoose.connection.readyState !== 0) {
     const currentDb = mongoose.connection.db as mongoose.mongo.Db;
    
    await currentDb.dropDatabase();
    await mongoose.disconnect();
    console.log(`Dropped and disconnected from ${dbName}`);
  }
};

