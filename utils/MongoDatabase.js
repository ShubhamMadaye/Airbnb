const mongo = require("mongodb");

const MongoClient = mongo.MongoClient;

const url = "mongodb+srv://shubhammadaye02:shubham022006@airbnb.pbvovjo.mongodb.net/?appName=airbnb";

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(url)
        .then(client => {
            console.log("Connected to MongoDB");
            _db = client.db("airbnb");
            callback();
        })
        .catch(err => {
            console.log("error while connecting to mongodb :", err);
            throw err;
        });
};

const getdb = () => {
    if (!_db) {
        throw new Error("databse not connected");
    }
    return _db;
};


exports.mongoConnect = mongoConnect;
exports.getdb = getdb;