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
var logo = new UI.Card();
logo.banner("resources/uber-icon-28.png");

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

var config_url = "";

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
			subtitle: 'estimate: ' + Math.ceil(product.estimate / 60 + 1) + ' mins',
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
    console.log(JSON.stringify(e.item));
    var url = 'uber://?action=setPickup&product_id=' + e.item.product_id +
              '&pickup=my_location';
    config_url = url;
    console.log(config_url);
  });

  menu.on('click', 'back', function() {
    console.log('menu back');
    window.navigator.geolocation.watchPosition(locationSuccess,
                                               locationError, locationOptions);
  });

	menu.show();
}

function fetchUber(coords) {  
  coords.latitude = '25.0422206';
  coords.longitude = '121.53816815';
	var params = 'latitude=' + coords.latitude + '&longitude=' + coords.longitude;
	ajax({ url: 'http://uber.ngrok.com/?' + params, type: 'json' },
	  function(data) {
      info_text.text('Uber Now');
      info_text.font('gothic-24-bold');
      Vibe.vibrate('double');
	  	showUber(data.times);
	});
}

Pebble.addEventListener("showConfiguration", function() {
  Pebble.openURL(config_url);
});

loading_window.on('click', 'up', update);
loading_window.on('click', 'down', update);
loading_window.on('click', 'select', update);

function update() {
  info_text.text('Loading...');
  info_text.font('gothic-24-bold');
  window.navigator.geolocation.watchPosition(locationSuccess,
                                             locationError, locationOptions);
}

// Init
loading_window.add(info_text);
loading_window.add(logo);
loading_window.show();
//update();
