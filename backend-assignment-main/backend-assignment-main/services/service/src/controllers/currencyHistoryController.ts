import * as moongose from "mongoose";
import CurrencyHistory from "./../models/currencyHistory"
import Currency from "./../models/currency"
import * as https from "https";


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
    var currencysNowJson;
    var currencysLastHourJson = []
    var currencyCodes = [];
    var lastHour = new Date(new Date("2021-12-02T07:01:19.000Z").toISOString());//new Date(new Date(Date.now()).getTime() - 1 * 60000);

    currencyCodes = await Currency.distinct('code');
    console.log(currencyCodes)
    function requestApi(code) {
        return new Promise<JSON>((resolve, rejects) => {
            console.log(code)
            https.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${code}&to_currency=EUR&apikey=4IBNHHFYF1CTFJKW`, res => {
                console.log(`statusCode: ${res.statusCode}`)




                res.on('data', d => {
                    var data = JSON.parse(d);
                    resolve(data);

                    res.on('error', error => {
                        console.error(error)
                        throw "invalid params in data api url"
                        rejects(error);
                    })


                })

            })

        })
    }



    for (var i = 0; i < currencyCodes.length; i++) {
        currencysLastHourJson.push(await requestApi(currencyCodes[i]))
    }



    for (const data of currencysLastHourJson) {

        const dateNow = new Date(new Date(Date.parse(data["Realtime Currency Exchange Rate"]['6. Last Refreshed'])).getTime() + 30 * 60000);
        var formatDate = new Date(dateNow)


        try {

            var currency = {
                id: await moongose.connection.db.collection('currencies').find().count() + 1,
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


    var ojbHisotry = {};
    for (const callCurrency of currencysLastHourJson) {
        var lastHour = new Date(new Date(callCurrency["Realtime Currency Exchange Rate"]['6. Last Refreshed']).toISOString());

        console.log(lastHour)
        currencysNowJson = await Currency.aggregate(
            [
                {
                    $addFields: {

                        minutediff: { $subtract: [lastHour, "$lastrefreshed"] }


                    }
                },
                {
                    $match:
                    {
                        minutediff: { $gte: (60000 * 1), $lte: (60000 * 15) }

                    }
                }
            ])

        console.log(currencysNowJson)

        if (currencysNowJson != undefined) {


            const currency = {
                id: await moongose.connection.db.collection('currencyhistories').find().count() + 1,
                code: currencysNowJson[0].code,
                bid: currencysNowJson[0].bid,
                ask: currencysNowJson[0].ask,
                spread: currencysNowJson[0].spread,
                biddiff: currencysNowJson[0].bid - currencysNowJson[1].bid,
                askdiff: (currencysNowJson[0].ask - currencysNowJson[1].ask),
                spreaddif: currencysNowJson[0].spread - (currencysNowJson[1].bid - currencysNowJson[1].ask)
            }

            try {
                console.log(currency)
                var historyCurrency = new CurrencyHistory(currency)
                historyCurrency.save()

            } catch (error) {
                console.log(error);

            }





        }







        //}




        return 0
    }
}

