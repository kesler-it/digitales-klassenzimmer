"use strict";
function dataexchange(url, callback, data) {
	var req = false;
	data = data || "";
	console.log("Save Data: ", data);

	req = new XMLHttpRequest();

	req.onreadystatechange = function () {
		if (req.readyState === 4 && req.status === 200) {
			callback(req.responseText);
		} else if (req.readyState === 4 && (req.status === 404)) {
			callback('{"error":"Klassenzimmer existiert nicht"}');
		}
	};

	if (data !== "") {
		req.open("POST", url, true);

		//Send the proper header information along with the request
		req.setRequestHeader("Content-type", "application/json");

		req.send(JSON.stringify(data));
	} else {
		req.open("GET", url, true);
		req.send(null);
	}
}

