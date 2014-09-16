/* Require libs */
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Accel = require('ui/accel');
Accel.init();

/* Variables */
var APP_VERSION = "v2.2";
var isUpdating = false;
var lastUpdate = (new Date).getTime();
var locationOptions = {"timeout": 15000, "maximumAge": 30000,
                       "enableHighAccuracy": true};


/* UI Elements */
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


/* Image Mapping List */
var image_list = {
  uberx: "images/mono-uberx.png",
  uberxl: "images/mono-uberxl2.png",
  uberblack: "images/mono-black.png",
  uberexec: "images/mono-black.png",
  ubersuv: "images/mono-suv.png",
  ubertaxi: "images/mono-taxi.png",
  ubert: "images/mono-nytaxi4.png"
};


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

function firstUpperCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showUber(data) {
  var times = data.times;
  if (times.length === 0 && data.is_available) {
    info_text.text('No cars available');
    info_text.font('gothic-24-bold');
    return;
  } else if (data.is_available === false) {
    info_text.text('No cars available');
    info_text.font('gothic-24-bold');
    return;
  }

  var items = [];
  times.forEach(function(product) {
    product.surge_multiplier = product.surge_multiplier || 1;
    product.display_name = firstUpperCase(product.display_name);
    var title = product.display_name;
    if (product.surge_multiplier !== 1) {
      title += ' *' + Number(product.surge_multiplier).toFixed(2);
    }
    var item = {
      title: title,
      subtitle: 'pick up time: ' +
                Math.ceil(product.estimate / 60) + ' mins',
      product: {
        display_name: product.display_name,
        capacity: product.capacity,
        image: product.image,
        description: firstUpperCase(product.description)
      }
    };
    items.push(item);
  });

  var menu = new UI.Menu({
    sections: [{
      items: items
    }]
  });

  menu.on('select', function(e) {
    var product = e.item.product;
    if (product.capacity && product.image && product.description) {
      var image = image_list[e.item.title.toLowerCase()] ||
                             'images/mono-black.png';
      var card = new UI.Card({
        banner: image,
        title: product.display_name,
        body: "Capacity: " + product.capacity + '\n' + product.description,
        scrollable: true
      });
      card.show();
    }
  });

  menu.show();
}

function fetchUber(coords) {
  var params = 'latitude=' + coords.latitude +
               '&longitude=' + coords.longitude +
               '&pebble=' + APP_VERSION;
  ajax({ url: 'http://pebble-uber.yulun.me/?' + params, type: 'json' },
    function(data) {
      info_text.text('Uber Now');
      info_text.font('gothic-24-bold');
      Vibe.vibrate('double');
      showUber(data);
      lastUpdate = (new Date).getTime();
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
  var diffTime = Math.abs(lastUpdate - (new Date).getTime());
  if (diffTime <= 1000  || isUpdating) return;
  isUpdating = true;
  info_text.text('Searching...');
  info_text.font('gothic-24-bold');
  window.navigator.geolocation.getCurrentPosition(locationSuccess,
                                                  locationError,
                                                  locationOptions);
}

main_window.on('click', 'up', update);
main_window.on('click', 'down', update);
main_window.on('click', 'select', update);
Accel.on('tap', update);

// Init
main_window.add(anykey_text);
main_window.add(info_text);
main_window.show();
update();
