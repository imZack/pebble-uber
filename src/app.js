// Require libs
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Vibe = require('ui/vibe');

// Variables
var isUpdating = false;
var main_window = new UI.Window();
var info_text = new UI.Text({
  position: new Vector2(0, 50),
  size: new Vector2(144, 30),
  font: 'gothic-24-bold',
  text: 'Uber Now',
  textAlign: 'center'
});

var anykey_text = new UI.Text({
  position: new Vector2(0, 114),
  size: new Vector2(144, 30),
  font: 'gothic-14-bold',
  text: 'Press any key to update',
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
  isUpdating = false;
}

function showUber(times) {

  if (times.length === 0) {
    info_text.text('No cars available');
    info_text.font('gothic-24-bold');
    return;
  }

  var items = [];
  times.forEach(function(product) {
    product.surge_multiplier = product.surge_multiplier || 1;
    var title = product.display_name;
    if (product.surge_multiplier !== 1) {
      title += ' *' + Number(product.surge_multiplier).toFixed(2);
    }
    var item = {
      title: title,
      subtitle: 'pick up time: ' +
                Math.ceil(product.estimate / 60) + ' mins',
      product_id: product.product_id
    };
    items.push(item);
  });

  var menu = new UI.Menu({
    sections: [{
      items: items
    }]
  });

  menu.show();
}

function fetchUber(coords) {
  var params = 'latitude=' + coords.latitude +
               '&longitude=' + coords.longitude +
               '&pebble=1';
  ajax({ url: 'http://pebble-uber.yulun.me/?' + params, type: 'json' },
    function(data) {
      info_text.text('Uber Now');
      info_text.font('gothic-24-bold');
      Vibe.vibrate('double');
      showUber(data.times);
      isUpdating = false;
    },
    function() {
      info_text.text('Connection Error');
      info_text.font('gothic-18-bold');
      isUpdating = false;
    }
  );
}

function update() {
  if (isUpdating) return;
  isUpdating = true;
  info_text.text('Updating...');
  info_text.font('gothic-24-bold');
  window.navigator.geolocation.getCurrentPosition(locationSuccess,
                                                  locationError,
                                                  locationOptions);
}

main_window.on('click', 'up', update);
main_window.on('click', 'down', update);
main_window.on('click', 'select', update);

// Init
main_window.add(anykey_text);
main_window.add(info_text);
main_window.show();
update();
