import { Double } from "bson";
import { EROFS } from "constants";
import * as moongose from "mongoose";
import Currency from "../models/currency"
import currencyhistori from "../models/currencyHistory";

export async function addCurrency(jsonData: JSON) {
    var auxConnectionbd = moongose.connection;
    var id;
    const date = new Date(new Date(Date.parse(jsonData["Realtime Currency Exchange Rate"]['6. Last Refreshed'])).getTime() + 30 * 60000);
    var formatDate = new Date(date)
    if (jsonData['Error Message'] != null) {
        var err = "No code currency valid! try again.";
        console.log("No code currency valid! try again.");
        throw err;
    } else {
        id = await auxConnectionbd.db.collection('currencies').find().count() + 1;

    }


    const currency = {
        id: id,
        code: jsonData["Realtime Currency Exchange Rate"]['1. From_Currency Code'],
        to_code: jsonData["Realtime Currency Exchange Rate"]['2. From_Currency Name'],
        bid: jsonData["Realtime Currency Exchange Rate"]['8. Bid Price'],
        ask: jsonData["Realtime Currency Exchange Rate"]['9. Ask Price'],
        spread: Number(jsonData["Realtime Currency Exchange Rate"]['8. Bid Price']) - Number(jsonData["Realtime Currency Exchange Rate"]["9. Ask Price"]),
        lastrefreshed: Date.parse(jsonData["Realtime Currency Exchange Rate"]['6. Last Refreshed']),
        createdAt: formatDate
    }
    console.log(currency);
    var newCurrency = new Currency(currency);
    try {
        await newCurrency.save();
        err = `new currency ${currency.code} in database,congrts!`;
        console.log(`new currency ${currency.code} in database,congrts!`);
        throw err;

    } catch (err) {
        err = `currency code ${currency.code}: ${err}!`;
        console.log(`currency code ${currency.code}: ${err}!`);
        throw err;

    }



    auxConnectionbd.close();


}


export async function deleteCurrency(code: string) {

    var mesg = "";

    await Currency.remove({ code: code.toUpperCase() }).then(value => {

        if (value.deletedCount != 0)
            throw `Currency ${code} is deleted!`
        else throw `Currency ${code} is not in db!`
    })









    return true;


}


export async function ListCurrency() {







    return await Currency.find().then(value => {

        if (value.length > 0)
            return value
        else
            throw `nothing in db`;
    })



}




export async function ListCurrencyHistroy(one,two) {
  
    
    return currencyhistori.find({ code: { $in: [one.toUpperCase().toString(),two.toUpperCase().toString()] } });
}




