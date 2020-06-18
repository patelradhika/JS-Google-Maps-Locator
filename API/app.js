const port = 3000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Store = require('./api/models/store');
const StoreSearch = require('./api/services/storeSearch');
const storeSearch = new StoreSearch();
require('dotenv').config();


mongoose.connect(`mongodb+srv://radhikapatel:${process.env.DB_ACCESS_TOKEN}@cluster0-0uws2.mongodb.net/store?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.use(express.json({
    limit: '50mb'
}));


app.get('/api/stores', (req, res) => {
    Store.find({}, (err, stores) => {
        if(err){
            res.status(500).send(err);
        } else {
            res.status(200).send(stores);
        }
    });
})

app.get('/api/search', (req, res) => {
    const zip = req.query.zip;
    storeSearch.searchNear(zip)
    .then((nearbyStores) => {
        res.status(200).send(nearbyStores);
    })
    .catch((error) => {
        console.log(error);
    });
})

app.post('/api/stores', (req, res) => {
    const stores = req.body;
    let dbStores = [];

    stores.forEach((store) => {
        dbStores.push({
            storeName: store.name,
            phoneNumber: store.phoneNumber,
            address: store.address,
            openStatustext: store.openStatusText,
            addressLines: store.addressLines,
            location: {
                type: "Point",
                coordinates: [
                    store.coordinates.longitude,
                    store.coordinates.latitude
                ]
            }
        })
    });

    Store.create(dbStores, (err, stores) => {
        if(err){
            res.status(500).send(err);
        } else {
            res.status(200).send(stores);
        }
    });
})

app.delete('/api/stores', (req, res) => {
    Store.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            return res.status(200).send("Deleted successfully")
        }
    })
})


app.listen(port, () => console.log(`Listening at http://localhost:${port}`))