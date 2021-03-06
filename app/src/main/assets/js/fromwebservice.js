// implementation of AR-Experience (aka "World")
var World = {
	// you may request new data from server periodically, however: in this sample data is only requested once
	isRequestingData: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_directionIndicator: null,

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],

	// The last selected marker
	currentMarker: null,

	// called to inject new POI data
	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {

		// empty list of visible markers
		World.markerList = [];

		// start loading marker assets
		World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
		World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
		for (var currentPlaceNr = 0; currentPlaceNr < poiData.length; currentPlaceNr++) {
			var singlePoi = {
				"id": poiData[currentPlaceNr].id,
				"latitude": parseFloat(poiData[currentPlaceNr].latitude),
				"longitude": parseFloat(poiData[currentPlaceNr].longitude),
				"altitude": parseFloat(poiData[currentPlaceNr].altitude),
				"title": poiData[currentPlaceNr].name,
				"description": poiData[currentPlaceNr].description
			};

			World.markerList.push(new Marker(singlePoi));
		}

		World.updateStatusMessage(currentPlaceNr + ' places loaded');
	},

	// updates status message shon in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

		var themeToUse = isWarning ? "e" : "c";
		var iconToUse = isWarning ? "alert" : "info";

		$("#status-message").html(message);
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	// location updates, fired every time you call architectView.setLocation() in native environment
	// Note: You may set 'AR.context.onLocationChanged = null' to no longer receive location updates in World.locationChanged.
	//locationChanged: function locationChangedFn(lat, lon, alt, acc) {

		// request data if not already present
		//if (!World.initiallyLoadedData) {
			//World.requestDataFromServer(lat, lon);
			//World.initiallyLoadedData = true;
		//}
	//},

	// fired when user pressed maker in cam
	onMarkerSelected: function onMarkerSelectedFn(marker) {

		// deselect previous marker
		if (World.currentMarker) {
			if (World.currentMarker.poiData.id == marker.poiData.id) {
				return;
			}
			World.currentMarker.setDeselected(World.currentMarker);
		}

		// highlight current one
		marker.setSelected(marker);
		World.currentMarker = marker;
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		if (World.currentMarker) {
			World.currentMarker.setDeselected(World.currentMarker);
		}
		World.currentMarker = null;
	},

	/*
		JQuery provides a number of tools to load data from a remote origin.
		It is highly recommended to use the JSON format for POI information. Requesting and parsing is done in a few lines of code.
		Use e.g. 'AR.context.onLocationChanged = World.locationChanged;' to define the method invoked on location updates.
		In this sample POI information is requested after the very first location update.

		This sample uses a test-service of Wikitude which randomly delivers geo-location data around the passed latitude/longitude user location.
		You have to update 'ServerInformation' data to use your own own server. Also ensure the JSON format is same as in previous sample's 'myJsonData.js'-file.
	*/
	// request POI data
	//requestDataFromServer: function requestDataFromServerFn(lat, lon) {

		// set helper var to avoid requesting places while loading
		//World.isRequestingData = true;
		//World.updateStatusMessage('Requesting places from web-service');

		// server-url to JSON content provider
		//var serverUrl = ServerInformation.POIDATA_SERVER + "?" + ServerInformation.POIDATA_SERVER_ARG_LAT + "=" + lat + "&" + ServerInformation.POIDATA_SERVER_ARG_LON + "=" + lon + "&" + ServerInformation.POIDATA_SERVER_ARG_NR_POIS + "=20";

		//var jqxhr = $.getJSON(serverUrl, function(data) {
			//	World.loadPoisFromJsonData(data);
		//	})
		//	.error(function(err) {
		//		World.updateStatusMessage("Invalid web-service response.", true);
		//		World.isRequestingData = false;
		//	})
		//	.complete(function() {
		//		World.isRequestingData = false;
		//	});
	//}

};
World.markerList = [];

// start loading marker assets
World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");



var uuid = null;
var ws = new WebSocket("wss://fierce-lake-89972.herokuapp.com");
ws.onopen = function() {
  ws.onmessage = function(event) {
    World.isRequestingData = true;
    var data = JSON.parse(event.data);
    if (data.type == "newConnection") {
      uuid = "Adam";
      World.initiallyLoadedData = true;
    } else {
      if (uuid != data.id) {
      data.latitude = parseFloat(data.latitude);
      data.longitude = parseFloat(data.longitude);
      data.altitude = null
      var indexOfUser = indexInWorld(data.id);
      if (indexOfUser >= 0) {
        World.markerList[indexOfUser].markerObject.locations = null;
//      } else {
//        World.markerList.push(new Marker(data))
      }
      World.markerList.push(new Marker(data))
//      if (indexOfUser >= 0) {
//        World.markerList[indexOfUser].markerObject.destroy()
//      }
//      World.markerList.push(new Marker(data))
       }
    };
  };
  World.isRequestingData = false;
};

function indexInWorld(id) {
    for (var i = 0; i < World.markerList.length; i++) {
        if (World.markerList[i].poiData.id == id) {
            return i;
        }
    };
    return -1;
}
var sendLocationToServer = function(lat, lon, alt, acc) {
    console.log("accuracy: "+acc)
    console.log("L:" +AR.CONST.LOCATION_ACCURACY.LOW)
    console.log("M:" +AR.CONST.LOCATION_ACCURACY.MEDIUM)
    console.log("H:" +AR.CONST.LOCATION_ACCURACY.HIGH)
   if (ws.readyState == 1) {
      ws.send(JSON.stringify({id: uuid, latitude: lat, longitude: lon, title: "title", description: "description"}));
   } else {
     console.log("waiting")
   }
  };

/* forward locationChanges to custom function */
AR.context.onLocationChanged = sendLocationToServer;

/* forward clicks in empty area to World */
AR.context.onScreenClick = World.onScreenClick;