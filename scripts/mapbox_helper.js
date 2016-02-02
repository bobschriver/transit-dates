var map;
var transit_layer;
var attraction_layer;

function add_transit(type, agency_name, route_name, first_stop_name, last_stop_name) {
    agency_id = agencies_json[agency_name];
    //console.log(agency_name);
    //console.log(agency_id);

    route_id = routes_json[route_name];
    //console.log(route_name);
    //console.log(route_id);

    first_stop_ids = stops_json[first_stop_name];
    //console.log(first_stop_name);
    //console.log(first_stop_ids);
 
    last_stop_ids = stops_json[last_stop_name];
    //console.log(last_stop_name);
    //console.log(last_stop_ids);

    trips = segments_json[agency_id][route_id];

    coordinates = [];

    found_sequence = false;
    for (trip_id in trips) {
        if (trip_id == "route_name") {
            continue;
        }
        
        trip = trips[trip_id];
        stops = trip['stops'];

        coordinates = []
        found_sequence = false;
    
        if (stops.length > 0) {
            stops.sort(function (first, second) {
                return parseInt(first['stop_sequence']) - parseInt(second['stop_sequence']);
            });

            //console.log(stops);

            found_sequence_start = false;
            found_sequence_end = false;
            for (stop_key in stops) {
                stop = stops[stop_key];
            
                if (first_stop_ids.indexOf(stop['stop_id']) > -1) {
                    //console.log("Found sequence start");
                    if (found_sequence_end) {
                        //console.log("After sequence end");
                        // Found the sequence end before the sequence start, which means we're going the wrong way
                        // Could potentially continue here, but it would be the return trip
                    } else {
                        found_sequence_start = true;
                    }
                }
               
                // We put this in the middle because we want the sequence end coordinate to be added
                // Next loop after we find it we will skip this
                if (found_sequence_start && !found_sequence_end) {
                    coordinates.push([stop['location']['longitude'], stop['location']['latitude']]);
                }

                if (last_stop_ids.indexOf(stop['stop_id']) > -1) {
                    //console.log("Found sequence end");
                    if (!found_sequence_start) {
                        //console.log("Before sequence start");
                        // Found sequence end before sequence start, means we're going backwards
                        // Since we already sorted the array by sequence number
                    }
                        
                    found_sequence_end = true;
                }
                
            }

            found_sequence = found_sequence_start && found_sequence_end;
        }

        if (found_sequence) {
            break;
        }
    }

    if (!found_sequence) {
        return;
    }

    if (typeof map == 'undefined') {
        map = L.mapbox.map('map', mapbox_map_id);
    }

    if (typeof transit_layer == 'undefined') {
        transit_layer = L.mapbox.featureLayer().addTo(map);
        transit_layer.setGeoJSON({type: 'FeatureCollection', features: []});
    }
     
    transit_geojson = transit_layer.getGeoJSON();

    console.log(transit_geojson);

    transit_geojson['features'].push(
        {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: coordinates
        }
    });

    transit_layer.setGeoJSON(transit_geojson);
}

function add_attraction_by_address(type, name, address) {
    console.log(address);
    
    var callback = function(err, data) {
        console.log("Lat: " + data.latlng[0] + " Lon: " + data.latlng[1]);
        add_attraction_by_lat_lng(type, name, data.latlng[0], data.latlng[1]);
    }

    geocoder.query(address, callback);
}

function add_attraction_by_lat_lng(type, name, latitude, longitude) {

    console.log(type);
    console.log(name);
    console.log(latitude);
    console.log(longitude);

    var marker_color = '#BE9A6B';
    var marker_symbol = 'cafe';

    switch (type) {
        case 'bar':
            marker_symbol = 'bar';
            break;
        case 'beer':
            marker_symbol = 'beer';
            break;
        case 'cafe':
            marker_symbol = 'cafe';
            break;
        case 'museum':
            marker_symbol = 'museum';
            break;
        case 'park':
            marker_symbol = 'park';
            break;
        case 'restaurant':
            marker_symbol = 'restaurant';
            break;
    }
    
    if (typeof map == 'undefined') {
        map = L.mapbox.map('map', mapbox_map_id);
    }

    if (typeof attraction_layer == 'undefined') {
        attraction_layer = L.mapbox.featureLayer().addTo(map);
        attraction_layer.setGeoJSON({type: 'FeatureCollection', features: []});
    }

    attraction_geojson = attraction_layer.getGeoJSON();

    console.log(attraction_geojson);

    attraction_geojson['features'].push(    
    {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [
                longitude,
                latitude 
            ]
        },
        properties: {
            title: name,
            'marker-size': 'large',
            'marker-color': marker_color,
            'marker-symbol': marker_symbol
        }
    }
    );

    attraction_layer.setGeoJSON(attraction_geojson);
}
