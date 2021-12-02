import * as path from 'path';
import * as mongoose from 'mongoose';
import { currencyHisotryTrigger } from "../src/controllers/currencyHistoryController"

// [DB Connection]

declare var MONGODB_URI: string;

/**
 * connectToDatabase
 * Configures the global MongoDB connection based on the provided secrets.
 * 
 * @returns Promise<string>
 */
async function connectToDatabase(connectionUri: string) {
  return new Promise((resolve, reject) => {
    // From mongoose@6.x.x onwards useNewUrlParser, useUnifiedTopology,
    // useCreateIndex are deprecated and default to true
    mongoose
      .connect(connectionUri)
      .then(() => {
        console.log("connected my friend!");
        resolve(connectionUri)
      }
      )
      .catch((error: any) => {
        console.log(error)
        reject(`${connectionUri}: ${error}`)
      });
  })
}
connectToDatabase(MONGODB_URI);

// [Script execution]
currencyHisotryTrigger().then(val => console.log(val));

console.log('Executing service...');

//process.exit(0);