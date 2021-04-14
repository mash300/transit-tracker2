(function(){
    const firstButton = document.querySelector(".firstButton");
    const secondButton = document.querySelector(".secondButton");

    let zoomMe = 11;  // update with eventListener
    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");
    output.innerHTML = slider.value;

    slider.oninput = function() {
    output.innerHTML = this.value;
}
    //create map in leaflet and tie it to the div called 'theMap'
    var map = L.map('theMap').setView([44.650627, -63.597140], zoomMe);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // 1. This creates a custom icon that is tied to the first geoJson layer ==> through " myLayer""myLayerOptions"
        function createCustomIcon (feature, latlng) {
            console.log(feature)

            return L.marker(latlng, {
                icon: evIcon,
                // rotationAngle: 45,
                rotationOrigin: 'center center',
                // rotationAngle: feature.properties.direction 
                // rotationAngle: feature.properties.direction 
            })
            .bindPopup('\rRoute #: ' + feature.properties.StationName
                                     + "<br>Station #: " + feature.properties.id 
                                     + "<br>FuelType: " + feature.properties.fuelType)
            .openPopup();
        }

        // 2. This creates a custom icon that is tied to the first geoJson layer ==> through " myLayer""myLayerOptions"
        function createNewCustomIcon (feature, latlng) {
            console.log(feature)

            return L.marker(latlng, {
                icon: evLoIcon,
                rotationOrigin: 'center center',
            })
            .bindPopup('\rRoute #: ' + feature.properties.StationName
                                     + "<br>Station #: " + feature.properties.id 
                                     + "<br>FuelType: " + feature.properties.fuelType)
            .openPopup();
        }

        // First layer options
        let myLayerOptions = {
            pointToLayer: createCustomIcon,
        }

        // Second layer options
        let myNewLayerOptions = {
            pointToLayer: createNewCustomIcon,
        }
 
            // 1. First dataSet Icon
            let evIcon = L.icon({
                // iconUrl: 'bus2.png',
                iconUrl: 'batteryHi.png',  
                     iconSize:     [50, 50], // size of the icon
                iconAnchor:   [35, 25], // point of the icon which will correspond to marker's location
                popupAnchor:  [00, -30] // point from which the popup should open relative to the iconAnchor
            });

            // 1. Second dataSet Icon
            let evLoIcon = L.icon({
                // iconUrl: 'bus2.png',
                iconUrl: 'batteryLo.png', 

                iconSize:     [50, 50],
                iconAnchor:   [35, 25], 
                popupAnchor:  [00, -30] 
            });



        // First Dataset Layer to map
        let myLayer = L.geoJSON(null, myLayerOptions, {
            // rotationAngle: 45,
            // rotationAngle: 0,
            rotationOrigin: 0
        }).addTo(map); //empty geoJSON layer

        // Second Dataset Layer to map
        let myNewLayer = L.geoJSON(null, myNewLayerOptions, {
            // rotationAngle: 45,
            // rotationAngle: 0,
            rotationOrigin: 0
        }).addTo(map); //empty geoJSON layer


        function apiPull() {
            // const stationUrl = "https://developer.nrel.gov/api/alt-fuel-stations/v1.json?api_key=DEMO_KEY&fuel_type=E85,ELEC&country=CA&api_key=BO7JOfrtyJHQeCO38CNUrKcOHj9xTrysGnbDWymz";
            const stationUrl = "https://developer.nrel.gov/api/alt-fuel-stations/v1.json?api_key=DEMO_KEY&fuel_type=E85,ELEC&country=CA";
            fetch(stationUrl)
            .then(function(response){
                return response.json();
            })
            .then(function(json){
                // Clears out layers after every call, this avoids stacking
                myLayer.clearLayers();
                myNewLayer.clearLayers();

    // TODO: Attach functionality to buttons to trigger the visibility of these to true or false
                 // Promises
                 
                // // This adds dataSets to map upon "click" event!!!
                // firstButton.addEventListener('click', function() {
                //     getEvNetwork(json);
                // })
                    
                // secondButton.addEventListener('click', function() {
                //     getNewNetwork(json);
                // })

                // Try to add button toggle between visibility, or clearLayers to hide!!
                let isClicked_1 = false;
                firstButton.addEventListener('click', function() {

                    if(isClicked_1 === false) {
                        isClicked_1 = true
                        getEvNetwork(json);
                    } else {
                        isClicked_1 = false
                        myLayer.clearLayers();
                    }
                })
                    

                let isClicked_2 = false;
                secondButton.addEventListener('click', function() {

                    if(isClicked_2 === false) {
                        isClicked_2 = true
                        getNewNetwork(json);
                    } else {
                        isClicked_2 = false
                        myNewLayer.clearLayers();
                    }
                })



                // Makes a new call every 40sec (API key has a limit of 1000 calls per day for my IP address)
                setTimeout(apiPull, 44000000);
            })          
        }
        apiPull()
           
        // 1st Mapping Object
        // This targets all "public" stations within Canada => which are plotted on the map with "myLayer, myLayerOptions, createCustomIcon"
        function getEvNetwork(json) { // <- you may or may not need to define parameters for your function
            const getStations = json.fuel_stations.filter(function(station){
                return station.state == "NS" && station.access_code == "public" && station.status_code == "E" ; 
            })
            const data = getStations.map(function(station){
                // return {"RouteId":station.vehicle.trip.routeId,
                return {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [station.longitude, station.latitude]
                            },
                            "properties": {
                                "StationName": station.station_name,
                                "id": station.id,
                                "fuelType": station.fuel_type_code,
                                "Status": station.status_code
                            }
                        }                                 
            })
            const featureCollection = {
                type: "featureCollection",
                features: data
            }
            myLayer.addData(featureCollection)
        }

        // 2nd Mapping Object
        // This targets all "public" stations within Canada => which are plotted on the map with "myLayer, myLayerOptions, createCustomIcon"
        function getNewNetwork(json) { // <- you may or may not need to define parameters for your function
            const getStations = json.fuel_stations.filter(function(station){
                // return station.state == "NS" && station.access_code == "public" && station.status_code == "P";
                return station.access_code == "public" && station.status_code == "P";
            })
            const data = getStations.map(function(station){
                // return {"RouteId":station.vehicle.trip.routeId,
                return {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [station.longitude, station.latitude]
                            },
                            "properties": {
                                "StationName": station.station_name,
                                "id": station.id,
                                "fuelType": station.fuel_type_code,
                                "Status": station.status_code
                            }
                        }                                 
            })
            const featureCollection = {
                type: "featureCollection",
                features: data
            }
            myNewLayer.addData(featureCollection)
        }
})()