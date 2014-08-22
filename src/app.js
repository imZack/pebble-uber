// Require libs
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Vibe = require('ui/vibe');

// Variables
var loading_window = new UI.Window();
var info_text = new UI.Text({
	position: new Vector2(0, 50),
	size: new Vector2(144, 30),
	font: 'gothic-24-bold',
	text: 'Loading...',
	textAlign: 'center'
});

var locationOptions = {"timeout": 15000, "maximumAge": 30000,
                       "enableHighAccuracy": true};

function locationSuccess(pos) {
  console.log(JSON.stringify(pos.coords));
  fetchUber(pos.coords);
}

function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
  info_text.text('Can\'t get location.');
  info_text.font('gothic-18-bold');
}

function showUber(times) {

  if (times.length === 0) {
    info_text.text('No cars available');
    info_text.font('gothic-24-bold');
    return;
  }

	var items = [];
	
	times.forEach(function(product) {
		var item = {
			title: product.display_name,
			subtitle: 'estimate: ' + (product.estimate / 60 + 1) + ' mins',
      product_id: product.product_id
		};
		items.push(item);
	});

	var menu = new UI.Menu({
	  sections: [{
	    items: items
	  }]
	});

  menu.on('select', function(e) {
    console.log(JSON.stringify(e));
    var url = 'uber://?action=setPickup&product_id=' + e.item.product_id +
              '&pickup=my_location';
    Pebble.openURL(url);
    //ajax({url: url});
  });

	menu.show();
}

function fetchUber(coords) {  
  coords.latitude = '25.0422206';
  coords.longitude = '121.53816815';
	var params = 'latitude=' + coords.latitude + '&longitude=' + coords.longitude;
	ajax({ url: 'http://uber.ngrok.com/?' + params, type: 'json' },
	  function(data) {
      Vibe.vibrate('double');
	  	showUber(data.times);
	});
}

// Init
(function() {
	window.navigator.geolocation.watchPosition(locationSuccess,
		                                         locationError, locationOptions);
	loading_window.add(info_text);
	loading_window.show();
})();
