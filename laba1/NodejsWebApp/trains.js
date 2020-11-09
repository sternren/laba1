'use strict';

const port = process.env.PORT || 1337;
const serverLogsPath = "server.log";
const dbLogsPath = "db.log";
const dbUri = "mongodb://localhost:27017/myproject";
const dbName = "local";

const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const logger = require("./Modules/logger");
const app = express();
const mongoClient = new MongoClient(dbUri, { useNewUrlParser: true });

app.use(function (request, response, next){  
    var data = `${request.method} ${request.url} ${request.get("user-agent")}`;

    logger.writeLog(data, serverLogsPath);

    next();
});

app.get("/", function (request, response){
    response.end("Find trains");
});

app.get("/Trains", function (request, response){
    mongoClient.connect(function (error, client) {

        if (error) {
            logger.writeLog(error, dbLogsPath);

            response.sendStatus(418);
        }
        else {
            const db = client.db(dbName);
            const collection = db.collection("trains");

            collection.find().toArray(function (error, results) {

                if (error) {
                    logger.writeLog(error, dbLogsPath);
                }

                response.send(results);
                response.sendStatus(200);

                client.close();
            });
		}
    });
});

app.listen(port);