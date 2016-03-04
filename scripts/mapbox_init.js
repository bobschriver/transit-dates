var mapbox_map_id = 'bobschriver.p08joppd';

L.mapbox.accessToken = 'pk.eyJ1IjoiYm9ic2Nocml2ZXIiLCJhIjoiTnQ3a3piNCJ9.HJRBbCd3qrAmFufIIw4lgQ';

var geocoder = L.mapbox.geocoder('mapbox.places');

$.ajax({
    url: "http://localhost:5000/api/v1.0/agencies",

    // The name of the callback parameter, as specified by the YQL service
    jsonp: "callback",

    // Tell jQuery we're expecting JSONP
    dataType: "jsonp",

    // Tell YQL what we want and that we want JSON
    data: {
    },

    // Work with the response
    success: function( response ) {
                 console.log( response ); // server response
             }
});
