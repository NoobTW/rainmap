var map;

// 宣告 map
map = L.map('map').setView([22.9185024, 120.5786888], 9);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
	maxZoom: 18,
}).addTo(map);

// 按下去的時候
map.on('click', (e) => {
	// 取得資料
	$.getJSON('https://api-proxy.noob.tw/http://140.127.220.46:5001/api/NearWStation?location=' + e.latlng.lat + ',' + e.latlng.lng, (data) => {
		console.log(data)
	});
});
