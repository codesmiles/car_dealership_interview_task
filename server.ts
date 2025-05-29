import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import { mongoConfig, app } from "./src";



const PORT = process.env.PORT || 8001

const start = () => {
    mongoose.set("strictQuery", true);

    mongoose.connect(mongoConfig.mongoURI as string)
    .then(() => {
        console.log("Successfully connected to data base.", mongoConfig.mongoURI);
    })
    .catch((err) => {
        console.log("bgRed", "There was an error connecting to data base" + err);
    });

    app.listen(PORT, () => {
        console.log("Process is listening to PORT: ", PORT)
    })
}

start();
