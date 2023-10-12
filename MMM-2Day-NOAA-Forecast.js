/* Magic Mirror Module: MMM-2Day-NOAA-Forecast
 * Version: 0.1.0
 *
 * By Jinserk Baik https://github.com/jinserk/
 * MIT Licensed.
 */

Module.register('MMM-2Day-NOAA-Forecast', {

	defaults: {
    lat: 0.0,
    lon: 0.0,
		units: 'metric',
    interval: 600000 // Every 10 mins
  },

  start:  function() {
    Log.log('Starting module: ' + this.name);

    // Set up the local values, here we construct the request url to use
    this.units = this.config.units;
    this.loaded = false;
		this.url = 'https://api.weather.gov/points/' + this.config.lat + ',' + this.config.lon;
    this.forecast = [];

    // Trigger the first request
    this.getWeatherData(this);
  },

  getStyles: function() {
    return ['font-awesome.css', 'MMM-2Day-NOAA-Forecast.css'];
  },

  getDom: function() {
    // Set up the local wrapper
    var wrapper = null;

    // If we have some data to display then build the results
    if (this.loaded) {

	    wrapper = document.createElement('table');
			wrapper.className = 'forecast small';
			wrapper.style.cssText = "border-spacing: 5px";

      // title
	    forecastRow1 = document.createElement('tr');

      if (this.forecast[0].isDay) {
	      forecastToday = document.createElement('th');
        forecastToday.className = 'forecastTitle';
	      forecastToday.colSpan = '2';
	      forecastToday.innerHTML = 'Today';

	      forecastTomorrow = document.createElement('th');
        forecastTomorrow.className = 'forecastTitle';
	      forecastTomorrow.colSpan = '2';
	      forecastTomorrow.innerHTML = 'Tomorrow';

	      forecastRow1.appendChild(forecastToday);
	      forecastRow1.appendChild(forecastTomorrow);
	    }
	    else {
	      forecastToday = document.createElement('th');
        forecastToday.className = 'forecastTitle';
	      forecastToday.innerHTML = 'Today';

	      forecastTomorrow = document.createElement('th');
        forecastTomorrow.className = 'forecastTitle';
	      forecastTomorrow.colSpan = '2';
	      forecastTomorrow.innerHTML = 'Tomorrow';

	      forecastAfter = document.createElement('th');
        forecastAfter.className = 'forecastTitle';
	      forecastAfter.innerHTML = 'Day After';

	      forecastRow1.appendChild(forecastToday);
	      forecastRow1.appendChild(forecastTomorrow);
	      forecastRow1.appendChild(forecastAfter);
	    }

      // icons
	    forecastRow2 = document.createElement('tr');
	    for (var i = 0; i < 4; i++) {
	      forecastDayNight = document.createElement('td');
	      forecastDayNight.className = 'forecastDayNight';

	      forecastIcon = document.createElement('i');
	      forecastIcon.className = 'fa fa-'
	        + this.iconMap[this.forecast[i].icon][(this.forecast[i].isDay) ? 0 : 1]
	        + ' fa-2x forecastIcon';
	      forecastIcon.setAttribute('height', '50');
	      forecastIcon.setAttribute('width', '50');

	      forecastDayNight.appendChild(forecastIcon);

	      forecastRow2.appendChild(forecastDayNight);
	    }

      // text
	    forecastRow3 = document.createElement('tr');
	    for (var i = 0; i < 4; i++) {
	      forecastText = document.createElement('td');
	      forecastText.className = 'forecastText horizontalView bright';
	      forecastText.innerHTML = this.forecast[i].conditions;

	      forecastRow3.appendChild(forecastText);
      }

      // details
	    forecastRow4 = document.createElement('tr');
	    for (var i = 0; i < 4; i++) {
	      forecastDetail = document.createElement('td');
	      forecastDetail.className = 'forecastDetail';

	      // Build up the details regarding temprature
	      tempIcon = document.createElement('i');
	      tempIcon.className = 'fa ' + ((this.forecast[i].isDay) ? 'fa-temperature-three-quarters' : 'fa-temperature-quarter') + ' fa-fw detailIcon';
	      tempIcon.setAttribute('height', '15');
	      tempIcon.setAttribute('width', '15');

	      tempText = document.createElement('span');
	      tempText.className = 'detailText';
        tempText.innerHTML = this.convertTemp(this.forecast[i].temp);
	      tempBr = document.createElement('br');

	      // Build up the details regarding precipitation %
	      rainIcon = document.createElement('i');
	      rainIcon.className = 'fa fa-umbrella fa-fw detailIcon';
	      rainIcon.setAttribute('height', '15');
	      rainIcon.setAttribute('width', '15');

	      rainText = document.createElement('span');
	      rainText.className = 'detailText';
	      rainText.innerHTML = this.forecast[i].pop + ' %';
	      rainBr = document.createElement('br');

	      // Build up the details regarding humidity %
	      humidIcon = document.createElement('i');
	      humidIcon.className = 'fa fa-droplet fa-fw detailIcon';
	      humidIcon.setAttribute('height', '15');
	      humidIcon.setAttribute('width', '15');

	      humidText = document.createElement('span');
	      humidText.className = 'detailText';
	      humidText.innerHTML = this.forecast[i].humid + ' %';
	      humidBr = document.createElement('br');

	      // Build up the details regarding wind
	      windIcon = document.createElement('i');
	      windIcon.className = 'fa fa-wind fa-fw detailIcon';
	      windIcon.setAttribute('height', '15');
	      windIcon.setAttribute('width', '15');

	      windText = document.createElement('span');
	      windText.className = 'detailText';
        windText.innerHTML = this.convertWindSpeed(this.forecast[i].wspd) + ' ' + this.forecast[i].wdir;

	      // Now assemble the details
	      forecastDetail.appendChild(tempIcon);
	      forecastDetail.appendChild(tempText);
	      forecastDetail.appendChild(tempBr);
	      forecastDetail.appendChild(rainIcon);
	      forecastDetail.appendChild(rainText);
	      forecastDetail.appendChild(rainBr);
	      forecastDetail.appendChild(humidIcon);
	      forecastDetail.appendChild(humidText);
	      forecastDetail.appendChild(humidBr);
	      forecastDetail.appendChild(windIcon);
	      forecastDetail.appendChild(windText);

	      forecastRow4.appendChild(forecastDetail);
	    }

	    wrapper.appendChild(forecastRow1);
	    wrapper.appendChild(forecastRow2);
	    wrapper.appendChild(forecastRow3);
	    wrapper.appendChild(forecastRow4);
		}
		else {
      // Otherwise lets just use a simple div
      wrapper = document.createElement('div');
      wrapper.innerHTML = 'Loading ...';
    }

    return wrapper;
  },

  getWeatherData: function(_this) {
    // Make the initial request to the helper then set up the timer to perform the updates
    _this.sendSocketNotification('GET-2DAY-NOAA-FORECAST', _this.url);
    setTimeout(_this.getWeatherData, _this.config.interval, _this);
  },

  socketNotificationReceived: function(notification, payload) {
    // check to see if the response was for us and used the same url
    if (notification === 'GOT-2DAY-NOAA-FORECAST' && payload.url === this.url) {
      // we got some data so set the flag, stash the data to display then request the dom update
      this.loaded = true;
      this.forecast = payload.forecast;
      console.log(this.forecast);
      this.updateDom(1000);
    }
  },

  iconMap: {
    "skc": ["sun", "moon"],
    "few": ["sun", "moon"],
    "sct": ["cloud-sun", "cloud-moon"],
    "bkn": ["cloud-sun", "cloud-moon"],
    "ovc": ["cloud", "cloud"],
    "wind_skc": ["sun", "moon"],
    "wind_few": ["sun", "moon"],
    "wind_sct": ["cloud-sun", "cloud-moon"],
    "wind_bkn": ["cloud-sun", "cloud-moon"],
    "wind_ovc": ["cloud", "cloud"],
    "snow": ["snowflake", "snowflake"],
    "rain_snow": ["snowflake", "snowflake"],
    "rain_sleet": ["snowflake", "snowflake"],
    "fzra": ["snowflake", "snowflake"],
    "rain_fzra": ["snowflake", "snowflake"],
    "snow_fzra": ["snowflake", "snowflake"],
    "sleet": ["snowflake", "snowflake"],
    "rain": ["cloud-sun-rain", "cloud-moon-rain"],
    "rain_showers": ["cloud-rain", "cloud-rain"],
    "rain_showers_hi": ["cloud-showers-heavy", "cloud-showers-heavy"],
    "tsra": ["cloud-bolt", "cloud-bolt"],
    "tsra_sct": ["bolt", "bolt"],
    "tsra_hi": ["bolt-lightning", "bolt-lightning"],
    "tornado": ["tornado", "tornado"],
    "hurricane": ["hurricane", "hurricane"],
    "tropical_storm": ["hurricane", "hurricane"],
    "dust": ["smog", "smog"],
    "smoke": ["smog", "smog"],
    "haze": ["cloud-meatball", "cloud-meatball"],
    "hot": ["temperature-arrow-up", "temperature-arrow-up"],
    "cold": ["temperature-arrow-down", "temperature-arrow-down"],
    "blizzard": ["wind", "wind"],
    "fog": ["smog", "smog"],
  },

  convertDate: function(name, isday) {
    return name.split("T")[0].split("-").slice(1, 3).join("/") + ((isday) ? " Day" : " Night");
  },

  convertTemp: function(temp) {
    // convert F -> C
    return ((this.units == "metric")
      ? (Math.round(((temp - 32) * 5) / 9) + ' &deg;C')
      : (Math.round(temp) + ' &deg;F')
    );
  },

  convertWindSpeed: function(wspd) {
    // convert mph -> m/s
    var converted = (this.units == "metric") ? wspd.map((x) => x * 0.447) : wspd;
    var unit = (this.units == "metric") ? "m/s" : "mph";

    return ((converted.length == 1)
      ? (Math.round(converted[0]) + ' ' + unit)
      : (Math.round(converted[0]) + '-'
        + Math.round(converted[1]) + ' ' + unit)
    );
  },


});
