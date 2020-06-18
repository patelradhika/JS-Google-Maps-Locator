const axios = require('axios');
const googleMapsURL = 'https://maps.googleapis.com/maps/api/geocode/json';


class GoogleMaps {
    async getCoords(zipCode) {
        let coordinates = [];
        await axios.get(googleMapsURL, {
            params:{
                address: zipCode,
                key: process.env.GOOGLE_API_KEY
            }
        })
        .then((response)=>{
            coordinates = [
                response.data.results[0].geometry.location.lng,
                response.data.results[0].geometry.location.lat
            ]
        }).catch((error)=>{
            throw new Error(error);
        })

        return coordinates;
    }
}

module.exports = GoogleMaps;