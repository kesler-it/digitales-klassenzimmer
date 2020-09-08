const domain = "meet.ffmuc.net";
let mode = "greeter";

let ytPlayer = null;
let klID = null;
let klName = null;
let ytVideoId = null;
let vimeoID = null;
let jitsiPlayer = null;

function updateVisibilities() {
	if (mode === "greeter") {
		document.getElementById("greeter").style.display = "block";
		document.getElementById("container").style.display = "none";
	} else {
		document.getElementById("greeter").style.display = "none";
		document.getElementById("container").style.display = "block";
	}
	document.getElementById("splitter").style.height = (window.innerHeight-120) + "px";
}

function onYouTubePlayerReady(event) {
	console.log("Player Ready", event);
	event.target.playVideo();
}
function onYouTubePlayerStateChange(event) {
	if (event.data == YT.PlayerState.UNSTARTED) {
		event.target.playVideo();
	}
	console.log("ytPlayerStateChange", event);
}

function onYouTubeIframeAPIReady() {
	ytPlayer = new YT.Player('ytPane', {
		width: '100%',
		height: '100%',
		videoId: ytVideoId,
		events: {
			'onReady': onYouTubePlayerReady,
			'onStateChange': onYouTubePlayerStateChange
		},
		playerVars: {
			'autoplay': 1,
			'origin': window.location.origin
		}
	});
}

function roomCallback(data) {
	jsData = JSON.parse(data);
	console.log(jsData);

	if (jsData.error) {
		alert(jsData.error);
		mode = "greeter";
		updateVisibilities();
		return;
	}

	if (jsData.vimeoID) {
		// embed vimeo
	} else if (jsData.ytLink) {
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		ytVideoId = jsData.ytLink;
		mode = "stream";
	}

	if (jsData.jitsiRoom) {
		const options = {
			roomName: jsData.jitsiRoom,
			width: '100%',
			height: '100%',
			configOverwrite: {
				startWithAudioMuted: true,
				startWithVideoMuted: true
			},
			parentNode: document.querySelector('#jitsiMeet')
		};
		const api = new JitsiMeetExternalAPI(domain, options);
		console.log("Jitsi API", api);
		if (mode === "stream") {
			mode = "conference";
		} else {
			mode = "jitsi";
		}
	}
	const labelKlID = document.getElementById("labelKlID");
	if (jsData.title) {
		klName = jsData.title;
	}
	if (klName) {
		labelKlID.innerText = klName;
	} else {
		labelKlID.innerText = klID;
	}
	updateVisibilities();
};

function startRoom() {
	klID = document.getElementById("klID").value;
	console.log("Start Room", klID);

	if (klID == "") {
		alert("Bitte Klassenzimmer-ID angeben");
		return;
	}
	mode = "loading";
	updateVisibilities();
	dataexchange("api/room/" + klID + ".json", roomCallback);

};

// function is used for dragging and moving
function dragElement(element, direction) {
	var md; // remember mouse down info
	const first = document.getElementById("first");
	const second = document.getElementById("second");

	element.onmousedown = onMouseDown;

	function onMouseDown(e) {
		//console.log("mouse down: " + e.clientX);
		md = {
			e,
			offsetLeft: element.offsetLeft,
			offsetTop: element.offsetTop,
			firstWidth: first.offsetWidth,
			secondWidth: second.offsetWidth
		};
		document.onmousemove = onMouseMove;
		document.onmouseup = () => {
			//console.log("mouse up");
			document.onmousemove = document.onmouseup = null;
		}
	}

	function onMouseMove(e) {
		//console.log("mouse move: " + e.clientX);
		var delta = {
			x: e.clientX - md.e.clientX,
			y: e.clientY - md.e.clientY
		};

		if (direction === "H") // Horizontal
		{
			// prevent negative-sized elements
			delta.x = Math.min(Math.max(delta.x, -md.firstWidth),
				md.secondWidth);

			element.style.left = md.offsetLeft + delta.x + "px";
			first.style.width = (md.firstWidth + delta.x) + "px";
			second.style.width = (md.secondWidth - delta.x) + "px";
		}
	}
}

function changeDia(val) {
	const first = document.getElementById("first");
	const second = document.getElementById("second");
	document.getElementsByClassName('gutter-horizontal')[0].style.display = "block";
	first.style.display = "block";
	second.style.display = "block";
	console.log(val);

	document.getElementById("spacer").style.display = "none";
	document.getElementsByClassName('splitter')[0].style.display = "flex";
	if (val == '25:75') {
		first.style.width = "25%";
		second.style.width = "75%";
	}
	else if (val == '75:25') {
		first.style.width = "75%";
		second.style.width = "25%";
	}
	else if (val == '50:50') {
		if (screen.width <= 760) {
			document.getElementsByClassName('gutter-horizontal')[0].style.display = "none"
			document.getElementsByClassName('splitter')[0].style.display = "block"
			document.getElementById("spacer").style.display = "block";
			first.style.width = "100%";
			second.style.width = "100%";
		} else {
			first.style.width = "50%";
			second.style.width = "50%";
		}

	} else if (val == '100-stream') {
		if (vimeoID !== null) {
			alert("vimeo not implemented");
		} else if (ytVideoId !== null) {
			console.log("Switch to youtube only", ytPlayer);
			ytPlayer.playVideo();
		}

		first.style.width = "100%";
		second.style.display = "none";
		document.getElementsByClassName('splitter')[0].style.display = "block";
		document.getElementsByClassName('gutter-horizontal')[0].style.display = "none";

	} else if (val == '100-conf') {
		if (vimeoID !== null) {
			alert("vimeo not implemented");
		} else if (ytVideoId !== null) {
			console.log("Switch to jitsi only", ytPlayer);
			ytPlayer.pauseVideo();
		}
		first.style.display = "none";
		second.style.width = "100%";
		document.getElementsByClassName('splitter')[0].style.display = "block";
		document.getElementsByClassName('gutter-horizontal')[0].style.display = "none";
	}
}
var leftPane = document.getElementById('first');
var rightPane = document.getElementById('second');
var paneSep = document.getElementById('separator');

// The script below constrains the target to move horizontally between a left and a right virtual boundaries.
// - the left limit is positioned at 10% of the screen width
// - the right limit is positioned at 90% of the screen width
var leftLimit = 10;
var rightLimit = 90;


paneSep.sdrag(function (el, pageX, startX, pageY, startY, fix) {

	fix.skipX = true;

	if (pageX < window.innerWidth * leftLimit / 100) {
		pageX = window.innerWidth * leftLimit / 100;
		fix.pageX = pageX;
	}
	if (pageX > window.innerWidth * rightLimit / 100) {
		pageX = window.innerWidth * rightLimit / 100;
		fix.pageX = pageX;
	}

	var cur = pageX / window.innerWidth * 100;
	if (cur < 0) {
		cur = 0;
	}
	if (cur > window.innerWidth) {
		cur = window.innerWidth;
	}

	var right = (100 - cur - 2);
	leftPane.style.width = cur + '%';
	rightPane.style.width = right + '%';

}, null, 'horizontal');