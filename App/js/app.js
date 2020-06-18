var map;
var markers = [];
const allStoreURL = "http://localhost:3000/api/stores";
const zipURL = "http://localhost:3000/api/search?zip="


onEnter = (e) => {
    if(e.key == "Enter") {
        getStores();
    }
}

initMap = () => {
    var mumbai = {lat: 19.188941, lng: 72.862925};
    map = new google.maps.Map(document.getElementById('map'), {
        center: mumbai,
        zoom: 11,
    });
    infoWindow = new google.maps.InfoWindow();
    getAllStores();
}

getAllStores = () => {
    fetch(allStoreURL)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        showMarkers(data);
    })
    .catch((error) => {
        console.log(error);
    })
}

showMarkers = (stores) => {
    clearLocations();
    var bounds = new google.maps.LatLngBounds();
    stores.forEach((store, index) => {
        const latlng = new google.maps.LatLng(
            store.location.coordinates[1],
            store.location.coordinates[0]
        );

        let fullAddress = "";
        store["addressLines"].forEach((addressLine) => {
            fullAddress += `${addressLine} `;
        })

        bounds.extend(latlng);
        createMarker(fullAddress, latlng, store.storeName, store.addressLines[0], store.openStatustext, store.phoneNumber, index+1);
    });
    map.fitBounds(bounds);
}

createMarker = (fullAddress, latlng, name, address, openStatus, phone, label) => {
    let googleUrl = new URL("https://www.google.com/maps/dir/");
    googleUrl.searchParams.append('api', '1');
    googleUrl.searchParams.append('destination', fullAddress);

    const html = `
    <div class="store-info-window">
        <div class="store-name">
            ${name}
        </div>
        <div class="store-open-status">
            ${openStatus}
        </div>
        <div class="store-address-popup">
            <div class="icon">
                <i class="fas fa-location-arrow"></i>
            </div>
            <span>
                <a target="_blank" href="${googleUrl.href}">${address}</a>
            </span>
        </div>
        <div class="store-phone">
            <div class="icon">
                <i class="fas fa-phone-alt"></i>
            </div>
            <span><a href="tel:${phone}">${phone}</a></span>
        </div>
    </div>
    `;

    const marker = new google.maps.Marker({
      map: map,
      position: latlng,
      label: label.toString()
    });
    google.maps.event.addListener(marker, 'click', function() {
      infoWindow.setContent(html);
      infoWindow.open(map, marker);
    });
    markers.push(marker);
}

getStores = () => {
    const zipcode = document.getElementById("zip-search").value;
    const searchURL = `${zipURL}${zipcode}`;

    fetch(searchURL)
    .then((response) => {
        if (response.status == 200) {
            return response.json();
        } else {
            throw new Error(response.status);
        }
    })
    .then((data) => {
        setStores(data);
    })
}

setStores = (stores) => {
    if(stores.length == 0) {
        clearLocations();
        noStoresFound();
    } else {
        setStoresList(stores);
        showMarkers(stores);
        setOnClickListener();
    }
}

clearLocations = () => {
    infoWindow.close();
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers.length = 0;
}

noStoresFound = () => {
    const html = `
    <div class="no-stores-found">
        No Stores Found
    </div>
    `;

    document.querySelector(".stores-list").innerHTML = html;
}

setStoresList = (stores) => {
    let storeHTML = "";
    stores.forEach((store, index) => {
        storeHTML += `
        <div class="store">
            <div class="store-background">
                <div class="store-info">
                    <div class="store-address">
                        <span>${store.addressLines[0]}</span>
                        <span>${store.addressLines[1]}</span>
                    </div>
                    <div class="store-phone-number">${store.phoneNumber}</div>
                </div>
                <div class="store-number-container">
                    <div class="store-number">${index+1}</div>
                </div>
            </div>
        </div>
        `;
    })

    document.querySelector(".stores-list").innerHTML = storeHTML;
}

setOnClickListener = () => {
    var storeElements = document.querySelectorAll('.store');
    storeElements.forEach((elem, index)=>{
        elem.addEventListener('click', function(){
            new google.maps.event.trigger(markers[index], 'click');
        })
    })
}