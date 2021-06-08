const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const moment = require("moment");

console.log("RUNNING WOY!!");

// If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "modules/MMM-MyCalendar/token.json";

// Load client secrets from a local file.
fs.readFile("modules/MMM-MyCalendar/credentials.json", (err, content) => {
	if (err) return console.log("Error loading client secret file:", err);
	// Authorize a client with credentials, then call the Google Calendar API.
	authorize(JSON.parse(content), listEvents);
});

//remove file

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getAccessToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		callback(oAuth2Client);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		prompt: "consent",
		scope: SCOPES
	});
	console.log("Authorize this app by visiting this url:", authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question("Enter the code from that page here: ", (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error("Error retrieving access token", err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log("Token stored to", TOKEN_PATH);
			});
			callback(oAuth2Client);
		});
	});
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
	// console.log("ini auth gan")
	// console.log(auth)
	const calendar = google.calendar({ version: "v3", auth });
	calendar.events.list(
		{
			calendarId: "primary",
			timeMin: new Date().toISOString(),
			maxResults: 10,
			singleEvents: true,
			orderBy: "startTime"
		},
		(err, res) => {
			if (err) return console.log("The API returned an error: " + err);
			const events = res.data.items;
			console.log("ts");
			// console.log(res.data.items);
			ts(res.data.items);

			console.log("ts done");
			/***
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
    ***/
		}
	);
}

//add momment


//const pts = require("./jsonToIcal.js");

//jsonToicl.js

const beginICalendar =
	"BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//lanyrd.com//Lanyrd//EN\nX-ORIGINAL-URL:http://lanyrd.com/2016/xpdays/xpdays-schedule.ics\nX-WR-CALNAME;CHARSET=utf-8:XP Days Ukraine 2016 schedule\nMETHOD:PUBLISH\nX-MS-OLK-FORCEINSPECTOROPEN:TRUE\n";
const endICalendar = "END:VCALENDAR";
const maxLengthProperty = 70;
let googleEvents = "";
let dtStamp = dtStampGenerate();

async function ts(googleEvents_obj) {
	download(JSON.stringify(googleEvents_obj), "raw_data.json", "");
	await new Promise((r) => setTimeout(r, 1200));
	fs.readFile("raw_data.json", (err, qwe) => {
		// console.log(JSON.parse(qwe));
	});

	googleEvents = beginICalendar;
	for (let i = 0; i < googleEvents_obj.length; i++) {
		console.log("dalam");
		// console.log(googleEvents_obj[i]);
		googleEvents = eventToICalendar(googleEvents_obj[i], googleEvents);
	}
	googleEvents += endICalendar;

	console.log("ini ts");
	// console.log(googleEvents);

	download(googleEvents, "data_cal.txt", "ics");
}

function eventToICalendar(event, googleEvents) {
	Object.size = function (obj) {
		var size = 0,
			key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};

	// console.log('#eventToIcalendar')
	var newLine = "\n";

	googleEvents += "BEGIN:VEVENT\n";
	//googleEvents += "TITLE:\n";
	//googleEvents += "CLASS:" + event.className[0] + "\n";
	googleEvents += "CLASS:" + "\n";
	googleEvents += "SUMMARY:" + event.summary + "\n";
	googleEvents += "LOCATION:" + event.location + "\n";
	//googleEvents += "URL:" + event.url + "\n";
	googleEvents += "UID:" + event.id + "\n";
	googleEvents += "DTSTAMP:" + dtStamp + "\n";
	googleEvents += "DTSTART:" + moment(event.start.dateTime).format("LLLL") + "\n";
	googleEvents += "DTEND:" + moment(event.end.dateTime).format("LLLL") + "\n";

	//googleEvents += "ALLDAY:" + event.allDay + "\n";
	//googleEvents += "ICONURL:" + event.iconUrl + "\n";
	googleEvents += "DESCRIPTION:" + event.description + "\n";
	// //diplayname penanggung jawab lurd
	// googleEvents += "ATTENDEES:" + event.attendees[0].displayName + "\n";
	// //nambahin status
	// googleEvents += "ATTENDEES:" + event.attendees[2].responseStatus + "\n";

	// tmp_el[1] = [1,2,3];
	var tmp_el = [];
	console.log("TMP_EL Before");
	console.log(event.attendees);
	event.attendees.forEach((el) => {
		//from
		if (Object.size(el) == 5) {
			tmp_el[1] = el.displayName;
		}
		//to
		if (Object.size(el) == 3) {
			tmp_el[2] = el.displayName;
		}
		if (Object.size(el) == 2) {
			tmp_el[2] = el.email;
		}
		//location
		if (Object.size(el) == 4) {
			tmp_el[3] = el.displayName;
		}
	});

	googleEvents += "ATTENDEES:" + tmp_el[1] + "\n";
	if (tmp_el[2].displayName === "") {
		console.log("####EMAIL: " + tmp_el[2]);
		// googleEvents += "ATTENDEES:" + tmp_el[2].email + "\n";
	} else {
		googleEvents += "ATTENDEES:" + tmp_el[2] + "\n";
	}
	googleEvents += "ATTENDEES:" + +"\n";
	googleEvents += "ATTENDEES:" + tmp_el[3] + "\n";

	googleEvents += "END:VEVENT\n";
	return googleEvents;
}

// ????????? ??? ?????? ? ??????
String.prototype.byteLength = function () {
	var byteCounts = [127, 2047, 65535, 2097151, 67108863];
	var str = this,
		length = str.length,
		count = 0,
		i = 0,
		ch = 0;
	for (i; i < length; i++) {
		ch = str.charCodeAt(i);
		if (ch <= byteCounts[0]) {
			count++;
		} else if (ch <= byteCounts[1]) {
			count += 2;
		} else if (ch <= byteCounts[2]) {
			count += 3;
		} else if (ch <= byteCounts[3]) {
			count += 4;
		} else if (ch <= byteCounts[4]) {
			count += 5;
		} else {
			count += 6;
		}
	}
	return count;
};

// ??????????? ??????? ??????? ?????? ? ???????????? ?? ????????????? RFC
function contentLinesRFC(str) {
	str += "";
	if (str.byteLength() > maxLengthProperty) {
		result = str.slice(0, str.length / 2) + "\n" + " ";
		result += str.slice(str.length / 2, str.length - 1);
		return result;
	}
}

// ??????????? ????
function cleaningDate(date) {
	//console.log("ini date lurd");

	//console.log(date);
	for (date2 in date) {
		//console.log(date);
		date = date[date2].slice(0, 10);
		for (var i = 0; i < date.length; i++) {
			date = date.replace(/:|-|\+/g, "");
		}
		return date;
	}
}

// Function to download data to a file
function download(data, filename, type) {
	console.log("ini download");
	// console.log(data);

	fs.writeFile(filename, data, function (err) {
		if (err) throw err;
		console.log(filename + "Saved!");
	});

	/***
	fs.writeFile('mynewfile3.txt', 'Hello content!', function (err) {
	if (err) throw err;
	    console.log('Saved!');
	}); ***/

	//fs.create('test.txt');
	// var a = document.createElement("a"),
	/***
      var file = new Blob([data], {type: type});
	window.navigator.msSaveOrOpenBlob(file, filename);
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 

    } ***/
}

// ????????????? ???????? ??????? ???? ? dtStamp ?????????? ??? ??? ?????? ICS
/**
	????? ??? (?????? ??????? ???? ???????????):
	let now = new Date();
	now.toISOString().replace(/-|:|\..*$/g, ""); 
 **/
function dtStampGenerate() {
	var now = new Date();
	var dateString = now.getFullYear() + "" + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2) + "T" + now.getHours() + "" + ("0" + (now.getMinutes() + 1)).slice(-2) + "" + ("0" + (now.getSeconds() + 1)).slice(-2);
	return dateString;
}
