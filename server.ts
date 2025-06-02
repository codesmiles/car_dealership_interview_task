import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import { mongoConfig, app } from "./src";

const PORT = process.env.PORT || 8005

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

//  trying something on multithreading
//  import cluster from "node:cluster";
//  import { availableParallelism as numCPUs } from "node:os";
//  import process from "node:process";


// if(process.env.NODE_ENV === NODE_ENV.DEVELOPMENT) {
//     console.log("Development mode is ON");
//     start();
// }
// else {
//     // Placeholder statement
//     console.log("Worker process started");
//     //  check if the current process is the master process
//      if (cluster.isPrimary) {
//          console.log(`Primary ${process.pid} is running`);
        
//         //   Fork workers
//          for (let i = 0; i < numCPUs(); i++) {
//              cluster.fork();
//          }
        
//          cluster.on('exit', (worker) => { 
//                console.log(`Worker ${worker.process.pid} died. Restarting...`);
//              cluster.fork();
//          })
//      }
//      else{
//          start();
//          console.log(`Worker ${process.pid} started`);
//      }
// }

