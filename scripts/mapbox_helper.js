var map;

var steps_index = 0;
var steps;

function get_default_transit_style() {
    return {
        weight:2,
        opacity:1,
        color:'black'
    }
}

function get_selected_transit_style() {
    return {
        weight:5,
        opacity:1,
        color:'red'
    }
}

function get_non_selected_transit_style() {
    return {
        weight:2,
        opacity:0.5,
        color: 'black'
    }
}

var transit_item_width = 250;
var transit_item_margin = 10 + 10;

var attraction_item_width = 250;
var attraction_item_margin = 1 + 1;


function increment_steps() {

    var layer = steps[steps_index]['feature_layer'];
    
    var scroller = document.getElementById('index_scroller');
    var num_items = layer['_geojson']['features'].length;

    var scroll_width = 0;

    if (steps[steps_index]['type'] == 'transit') {
        scroll_width = (transit_item_width + transit_item_margin) * num_items;
    } else {
        scroll_width = (attraction_item_width + attraction_item_margin) * num_items;
    }

    console.log(scroller.scrollLeft);
    console.log(scroll_width);

    scroller.scrollLeft += scroll_width;

    // Code to deal with zooming/panning to correct location
    map.panTo(layer.getBounds().getCenter());
    map.fitBounds(layer.getBounds(), { paddingTopLeft: [300, 0]});

    if (steps[steps_index]['type'] == 'transit') {
        for (var i = 0; i < steps.length; i++) {
            if (steps[i]['type'] == 'transit') {
                if (i == steps_index) {
                    steps[i]['feature_layer'].setStyle(get_selected_transit_style());
                } else {
                    steps[i]['feature_layer'].setStyle(get_non_selected_transit_style());
                }
            } else {
            }
        }
    } else {
        for (var i = 0; i < steps.length; i++) {
            if (steps[i]['type'] == 'attraction') {
            } else {
                steps[i]['feature_layer'].setStyle(get_default_transit_style());
            }
        }
    }
    
    steps_index += 1;
    /*if (steps_index >= steps.length) {
        steps_index = 0;
    }*/

}

function add_transit_html(type, agency_name, route_name, first_stop_name, last_stop_name) {
    // Code to deal with adding each transit line to the index div
    var indeces = document.getElementById('index_container');

    var index = indeces.appendChild(document.createElement('div'));
    index.className = 'index_item transit_item';

    var icon_section = index.appendChild(document.createElement('div'));
    var icon = icon_section.appendChild(document.createElement('img'));
    icon_section.style = "float:left;";
    icon.src = "/assets/img/" + type + ".png";
    icon.height = 50;
    icon.width = 50;

    var details_section = index.appendChild(document.createElement('div'));
    details_section.innerHTML += agency_name + " <br />";
    details_section.innerHTML += route_name + " <br />"; 
}

function add_transit_geojson(data, curr_step_index) {
    console.log(data);

    if (data['status'] != 'Success') {
        return;
    }

    transit_geojson = {
        type: 'FeatureCollection',
        features: [
        {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: data['shape']
            }
        }
        ]
    };
    
    var layer = L.mapbox.featureLayer();
    layer.setGeoJSON(transit_geojson);
    layer.addTo(map);
    
    steps[curr_step_index]['feature_layer'] = layer;
    /*if (curr_step_index == 0) {
        increment_steps();
    }*/
}

function add_transit_step() {
    if (typeof steps == 'undefined') {
        steps = [];
    }

    steps.push({
        type: 'transit',
        zoom_to: 16,
        num_items: 1
    });

    return steps.length - 1;
}

function add_transit(type, agency_name, route_name, first_stop_name, last_stop_name) {
    // Code to deal with adding geojson to mapbox
    // Note that we create a new layer for each transit line

    add_transit_html(type, agency_name, route_name, first_stop_name, last_stop_name);   
    
    if (typeof map == 'undefined') {
        map = L.mapbox.map('map', mapbox_map_id);
    }

    var url_str = "http://localhost:5000/api/v1.0/shape?";
    url_str += "agency_name=" + encodeURIComponent(agency_name);
    url_str += "&route_name=" + encodeURIComponent(route_name);
    url_str += "&first_stop_name=" + encodeURIComponent(first_stop_name);
    url_str += "&last_stop_name=" + encodeURIComponent(last_stop_name);

    console.log(url_str);

    var curr_steps_index = add_transit_step()

    var callback = function(data) {
        add_transit_geojson(data, curr_steps_index)
    }

    $.ajax({
            url: url_str,
            jsonp: "callback",
            dataType: "jsonp",
            data: {}
    }).done(callback);
}

function add_attraction_html(type, name) {
    var indeces = document.getElementById('index_container');

    var index = indeces.appendChild(document.createElement('div'));
    index.className = 'index_item attraction_item';
    // Should pass a reference to this div, or create it above to maintain order

    var icon_section = index.appendChild(document.createElement('div'));
    var icon = icon_section.appendChild(document.createElement('img'));
    icon_section.style = "float:left;";
    icon.src = "/assets/img/" + type + ".png";
    icon.height = 50;
    icon.width = 50;

    var details_section = index.appendChild(document.createElement('div'));
    details_section.innerHTML += name + " <br />";

}

function get_attraction_geojson(type, name, latitude, longitude) {
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

    return {
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
            };
}

function add_attraction_step() {
    
    if (typeof steps == 'undefined') {
        steps = [];
    }

    if (typeof steps[steps.length - 1] == 'undefined' ||
            steps[steps.length - 1]['type'] == 'transit') {
       
        steps.push({
            type: 'attraction',
            zoom_to: 16,
        });
    } 

    return steps.length - 1;
}

function add_attraction_by_address(type, name, address) {
    add_attraction_html(type, name);

    var step_index = add_attraction_step();

    var callback = function(err, data) {
        add_attraction_to_map(type, name, data.latlng[0], data.latlng[1], step_index);
    }

    geocoder.query(address, callback);
}

function add_attraction_by_lat_lng(type, name, latitude, longitude) {
    add_attraction_html(type, name);

    var step_index = add_attraction_step();
    
    add_attraction_to_map(type, name, latitude, longitude, step_index);
}

function add_attraction_to_map(type, name, latitude, longitude, step_index) {
    if (typeof map == 'undefined') {
        map = L.mapbox.map('map', mapbox_map_id);
    }
         
    if (typeof steps[step_index]['feature_layer'] == 'undefined') {

        layer = L.mapbox.featureLayer().addTo(map);

        layer.setGeoJSON({
            type: 'FeatureCollection',
            features: []
        });

        steps[step_index]['feature_layer'] = layer;

        steps[step_index]['num_items'] = 0;
    }

    steps[steps_index]['num_items'] += 1;

    layer = steps[step_index]['feature_layer'];

    curr_geojson = layer.getGeoJSON();
    curr_geojson['features'].push(get_attraction_geojson(type, name, latitude, longitude));
    layer.setGeoJSON(curr_geojson);
}

