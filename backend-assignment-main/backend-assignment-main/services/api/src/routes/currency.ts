import * as express from "express";
import { addCurrency, deleteCurrency, ListCurrency, ListCurrencyHistroy } from "./../controllers/currencyController";
import * as https from "https";
var routes = express.Router();

routes.get("/currency/:code", async (req, res) => {
    function requestApi() {
        return new Promise<JSON>((resolve, rejects) => {
            https.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${req.params.code}&to_currency=EUR&apikey=4IBNHHFYF1CTFJKW`, res => {
                console.log(`statusCode: ${res.statusCode}`)




                res.on('data', d => {
                    var data = JSON.parse(d);
                    resolve(data);

                })

                res.on('error', error => {
                    console.error(error)
                    throw "invalid params in data api url"


                })
            })
        })
    }


    var data = await requestApi()
    addCurrency(data).then((value) => {
        res.send(value);

    }).catch((error: any) => {
        res.send(error);

    });
})









routes.get("/currency/delete/:code", async (req, res) => {



    deleteCurrency(req.params.code).then((value) => {
        res.send(value)

    })
        .catch((error: any) => {
            res.send(error);


        });


})


routes.get("/currency", async (req, res) => {



    ListCurrency().then((value) => {
        res.send(value)

    })
        .catch((error: any) => {
            res.send(error);


        });


})


routes.get("/currency", async (req, res) => {



    ListCurrency().then((value) => {
        res.send(value)

    })
        .catch((error: any) => {
            res.send(error);


        });


})

routes.get("/history/:one&:two", async (req, res) => {



    ListCurrencyHistroy(req.params.one,req.params.two).then((value) => {
        
        res.send(value)

    })
        .catch((error: any) => {
            res.send(error);


        });


})



export default routes