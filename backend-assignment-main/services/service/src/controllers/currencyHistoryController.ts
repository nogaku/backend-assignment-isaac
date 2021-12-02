import * as moongose from "mongoose";
import Currency from "./../models/currencyHistory"
import * as https from "https";
var auxConnectionbd = moongose.connection;

/*
export async function addCurrency(jsonData: JSON) {


    if (jsonData['Error Message'] != null) {
        var err = "No code currency valid! try again.";
        console.log("No code currency valid! try again.");
        throw err;
    } else {
        const currency = {

            code: jsonData["Realtime Currency Exchange Rate"]['1. From_Currency Code'],
            to_code: jsonData["Realtime Currency Exchange Rate"]['2. From_Currency Name'],
            bid: jsonData["Realtime Currency Exchange Rate"]['8. Bid Price'],
            ask: jsonData["Realtime Currency Exchange Rate"]['9. Ask Price'],
            spread: Number(jsonData["Realtime Currency Exchange Rate"]['8. Bid Price']) - Number(jsonData["Realtime Currency Exchange Rate"]["9. Ask Price"]),
            lastrefreshed: Date.parse(jsonData["Realtime Currency Exchange Rate"]['6. Last Refreshed'])
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
    }

    return true;


}*/

/*
export async function deleteCurrency(code: string) {

    var mesg = "";

    await Currency.findOneAndRemove({ code: code.toUpperCase() }).then(value => {
        if (value != null)
            throw `Currency ${code} is deleted!`
        else throw `Currency ${code} is not in db!`
    })









    return true;


}

*/


export async function currencyHisotryTrigger() {
    var currencysNowJson = [];
    var currencysLastHourJson = []
    var currencyCodes = [];
    var lastHour = new Date(new Date("2021-12-02T07:01:19.000Z").toISOString());//new Date(new Date(Date.now()).getTime() - 1 * 60000);

    currencyCodes = await Currency.distinct('code');
    console.log(currencyCodes)
    function requestApi(code) {
        return new Promise<JSON>((resolve, rejects) => {
            console.log(code)
            https.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${code}&to_currency=EUR&apikey=J3E7KVFNXL5VP9BE`, res => {
                console.log(`statusCode: ${res.statusCode}`)

                res.on('error', error => {
                    console.error(error)
                    throw "invalid params in data api url"


                })
                res.on('data', d => {
                    var data = JSON.parse(d);

                    resolve(data);


                })

            })

        })
    }



    for (var i = 0; i < currencyCodes.length; i++) {
        currencysLastHourJson.push(await requestApi(currencyCodes[i]))
    }

    console.log(currencysLastHourJson);

    for (const data of currencysLastHourJson) {

        const dateNow = new Date(new Date(Date.parse(data["Realtime Currency Exchange Rate"]['6. Last Refreshed'])).getTime() + 30 * 60000);
        var formatDate = new Date(dateNow)


        try {

            var currency = {
                id: await auxConnectionbd.db.collection('currencies').find().count() + 1,
                code: data["Realtime Currency Exchange Rate"]['1. From_Currency Code'],
                to_code: data["Realtime Currency Exchange Rate"]['2. From_Currency Name'],
                bid: data["Realtime Currency Exchange Rate"]['8. Bid Price'],
                ask: data["Realtime Currency Exchange Rate"]['9. Ask Price'],
                spread: Number(data["Realtime Currency Exchange Rate"]['8. Bid Price']) - Number(data["Realtime Currency Exchange Rate"]["9. Ask Price"]),
                lastrefreshed: Date.parse(data["Realtime Currency Exchange Rate"]['6. Last Refreshed']),
                createdAt: formatDate
            }

            var newCurrency = new Currency(currency);
            await newCurrency.save();

            console.log(`new currency ${currency.code} in database,congrts!`);


        } catch (err) {
            console.log(`currency code ${currency.code}: ${err}!`);
            console.log(`currency code ${currency.code}: ${err}!`);


        }
    }



    for (const callCurrency of currencysLastHourJson) {
        var lastHour = new Date(new Date(callCurrency["Realtime Currency Exchange Rate"]['6. Last Refreshed']).toISOString());
        console.log(lastHour)
        currencysNowJson = await Currency.aggregate(
            [
               
                {
                    $project: {
                        _id: 0,
                        code: 1,
                        bid: 1,
                        ask: 1!,
                        spread: 1,
                        lastrefreshed: 1,
                        minutediff: { $subtract: ["$lastrefreshed", lastHour] }

                    }

                },
                {
                    $match:
                    {
                        minutediff: { $eq: (-60000), $lte: (-600000) }

                    }


                }])




         
       
    
    return currencysLastHourJson;
}
}

/*
export async function getCurrency(currencyCodes: string[], currencyValue: string[]) {
    var currencyJson = [{}];
    var dataJson = [{}];
    var now = new Date(new Date(Date.now()).getTime() - 60 * 60000);
    for (let i = 0; i < currencyCodes.length; i++) {


        dataJson[i]['code'] = currencyCodes[i];

        for (let y = 0; y < currencyValue.length; y++) {

            currencyValue[y] == "bid" ? dataJson[i]['bid'] = 0 : "";
            currencyValue[y] == "biddif" ? dataJson[i]['biddiff'] = 0 : "";
            currencyValue[y] == "ask" ? dataJson[i]['ask'] = 0 : " ";
            currencyValue[y] == "askdif" ? dataJson[i]['askdiff'] = 0 : "";
            currencyValue[y] == "spread" ? dataJson[i]['spread'] = 0 : "";
            currencyValue[y] == "spreaddiff" ? dataJson[i]['spreaddiff'] = 0 : "";

            currencyJson[i] = await Currency.find(

                {
                    $match: {
                        $and:
                            [
                                { ask: { "$in": currencyValue[y] == "ask" ? currencyValue[y] : "" } },
                                { bid: { "$in": currencyValue[y] == "bid" ? currencyValue[y] : "" } },
                                { spread: { "$in": currencyValue[y] == "spread" ? currencyValue[y] : "" } },
                                { code: { "$in": currencyCodes[i] } },
                                { $hour: { createAt: now } }
                            ]
                    }
                }


            )
        }
        console.log(currencyJson);

    }


    return currencyJson;


}*/