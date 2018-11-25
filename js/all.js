var map;
var mychart;

// 宣告 map
map = L.map('map').setView([22.9185024, 120.5786888], 9);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
	maxZoom: 18,
}).addTo(map);

// 按下去的時候
map.on('click', (e) => {
	loadRainData(e.latlng.lat, e.latlng.lng);
});

function loadRainData(lat, lng){
	// 取得資料

	if(mychart) mychart.destroy();
	$.getJSON('https://api-proxy.noob.tw/http://140.127.220.46:5002/api/NearWStation?location=' + lat + ',' + lng, (data) => {
		if(data.length){
			var stationName = Object.keys(data[0]);
			var distance = Object.values(data[0])[0].slice(0, -3);

			$('h2').html('來自 <span id="station">' + stationName + '</span>的觀測站資料（距離 ' + Math.floor(distance * 100) / 100 + ' km）')
			$.getJSON('https://api-proxy.noob.tw/http://140.127.220.46:5002/api/RainFall?WS=' + stationName, (rainData) => {
				rainData = rainData.filter(x => x[0].startsWith('2018'));

				var rainsPerHour = [];
				var rains = [];
				var labels = [];

				var j = 0;
				for(let i = moment('2018-01-01 00:00:00'); i.unix() < moment().unix(); i = moment(i).add(1, 'hours')){
					// var data = rainData.find( x => x[0] === moment(i).format('YYYY-MM-DD HH:mm:ss'));

					if(j < rainData.length && moment(rainData[j][0]).unix() === moment(i).unix()){
						rainsPerHour.push(rainData[j][1]);
						j++;
					}else{
						rainsPerHour.push(0);
					}

					if(moment(i).format('HH:mm') === '23:00'){
						labels.push(moment(i).format('YYYY-MM-DD'));
						rains.push(rainsPerHour.reduce((x, y) => x+y));
						rainsPerHour = [];
					}
				}


				var ctx = document.getElementById("chart").getContext('2d');
				mychart = new Chart(ctx, {
					type: 'bar',
					data: {
						labels: labels,
						datasets: [{
							label: stationName + ' 日雨量',
							data: rains,
							backgroundColor: '#ff4500',
							borderColor: '#ff4500',
							borderWidth: 1
						}]
					},
					options: {
						maintainAspectRatio: false
					},
				})
			});
		}else{
			$('h2').text('沒有資料');
		}
	});
}
