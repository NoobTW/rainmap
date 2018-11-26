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
	$('#loading').show();
	$.getJSON('https://api-proxy.noob.tw/http://140.127.220.46:5002/api/NearWStation?location=' + lat + ',' + lng, (data) => {
		if(data.length){
			var stationName = Object.keys(data[0]);
			var distance = Object.values(data[0])[0].slice(0, -3);

			$('h2').html('來自 <span id="station">' + stationName + '</span>的觀測站資料（距離 ' + Math.floor(distance * 100) / 100 + ' km）');
			$.getJSON('https://api-proxy.noob.tw/http://140.127.220.46:5002/api/Temp?WS=' + stationName, (tempData) => {
				$.getJSON('https://api-proxy.noob.tw/http://140.127.220.46:5002/api/RainFall?WS=' + stationName, (rainData) => {
					rainData = rainData.filter(x => x[0].startsWith('2018'));
					tempData = tempData.filter(x => x[0].startsWith('2018'));

					var rainsPerHour = [];
					var rains = [];
					var labels = [];

					var tempPerHour = [];
					var temp = [];

					var j = 0;
					var k = 0;
					for(let i = moment('2018-01-01 00:00:00'); i.unix() < moment('2018-11-07 00:00:00').unix(); i = i.add(1, 'hours')){

						if(j < rainData.length && moment(rainData[j][0]).unix() === i.unix()){
							rainsPerHour.push(rainData[j][1]);
							j++;
						}else{
							rainsPerHour.push(0);
						}
						if(k < tempData.length && moment(tempData[k][0]).unix() === i.unix()){
							tempPerHour.push(tempData[k][1]);
							k++;
						}else{
							tempPerHour.push(0);
						}

						if(moment(i).format('HH:mm') === '23:00'){
							labels.push(i.format('YYYY-MM-DD'));
							rains.push(rainsPerHour.reduce((x, y) => x+y));
							rainsPerHour = [];
							temp.push(Math.round(tempPerHour.reduce((x, y) => x+y) / 24 * 10) / 10);
							tempPerHour = [];
						}
					}

					$('#loading').hide();
					var ctx = document.getElementById("chart").getContext('2d');
					mychart = new Chart(ctx, {
						type: 'bar',
						data: {
							labels: labels,
							datasets: [{
								type: 'bar',
								label: stationName + ' 日雨量',
								data: rains,
								backgroundColor: '#42A5F5',
								borderColor: '#42A5F5',
								borderWidth: 1,
								yAxisID: 'rain',
							},{
								type: 'line',
								label: stationName + ' 日均溫',
								data: temp,
								backgroundColor: 'transparent',
								borderColor: '#ff4500',
								borderWidth: 1,
								yAxisID: 'temp',
							}]
						},
						options: {
							maintainAspectRatio: false,
							scales:{
								yAxes: [
									{
										display: true,
										name: '雨量 (mm)',
										id: 'rain',
										type: 'linear',
										position: 'left',
										scalePositionLeft: true,
									},
									{
										display: true,
										name: '氣溫 (C)',
										id: 'temp',
										type: 'linear',
										position: 'right',
										scalePositionLeft: false,
									}
								]
							}
						},
					})
				});
			});
		}else{
			$('h2').text('沒有資料');
		}
	});
}
