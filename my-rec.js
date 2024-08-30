//TODO
//separate location value
//event URL
//default export calendar name
//separate function for response parsing
//all day handling

//via TF export
function downloadString(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

//via ChatGPT | only had to make one fix!
function formatDateForICal(date) {
	let icalDate = new Date(date);
    // Format the date as YYYYMMDDTHHMMSSZ
    const year = icalDate.getUTCFullYear();
    const month = String(icalDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(icalDate.getUTCDate()).padStart(2, '0');
    const hours = String(icalDate.getUTCHours()).padStart(2, '0');
    const minutes = String(icalDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(icalDate.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}


//returns object with separated title, paritipant, and location fields
//splitting strings for now
//maybe try some recursive regex plugins, though format can't really be guaranteed 
function parseTitle(eventTitle) {
    //assumes a single "*" joins the event title w/participant and venue
    let splitTitle = eventTitle.split("*");
    //take first half as-is for title
    let newTitle = splitTitle[0]
    //split the second half by start parenthesis
    let attendeeVenue = splitTitle[1].split("(");
    //first section is the attendee name
    let attendeeName = attendeeVenue[0].trim();
    //second is venue name
    let venueName = attendeeVenue[1].trim().slice(0,-1);
    //probably a more graceful wa to populate this
    let parsedTitle = {
        "eventTitle": newTitle,
        "eventAttendee": attendeeName,
        "eventVenue": venueName 
    } 
    return parsedTitle;
}

//pulls request values out of the script last script in the header
function getPostValue(postKey) {
    //assumes last script in head
    let pageScripts = document.head.getElementsByTagName("script");
    let lastScript = pageScripts[pageScripts.length - 1].innerHTML;
    const regexPatt = new RegExp(postKey + '\\s=\\s([0-9]*?);', 'm');
    let regexResponse = lastScript.match(regexPatt);
    return regexResponse[1];
}

//settings
let isTitleParsed = true;

//get host & build endpoint
let myrecHost = window.location.host;
let myrecEndpoint = myrecHost + "/info/calendar/CalWebService.asmx/GetCalendarAccount"

//start .ics file
let outputCalendar = `BEGIN:VCALENDAR
VERSION:2.0`

//object for returned data
let rawCalJSON = {};

//POST request that returns MyRec data using values pulled using getPostValue() above
let rawCalResponse = $.post(
	'https://' + myrecEndpoint, {
        //NB: shift to lowercase on first letter
		AccountID: getPostValue("accountID"), 
		AccountMemberID: getPostValue("accountMemberID"), 
		ShowFacilities: true, 
		Debug: false,
		start: '2024-07-28',
		end: '2025-09-08'
	}, 
    // do stuff with that data
    function(data) {
        //get the JSON
    	rawCalJSON = JSON.parse(rawCalResponse.responseText)
        //for each entry
        for (calEvent of rawCalJSON) {

            // assign a title
            let eventTitle = '';
            let extendedIcalValues = '';

            //check for title parser
            if (isTitleParsed === true) {
                //parse title
                let parsedValues = parseTitle(calEvent.title);
                //assign title variable
                eventTitle = parsedValues.eventTitle;
                //extended iCal values
                extendedIcalValues = "LOCATION:" + parsedValues.eventVenue + 
                                     "\nATTENDEE;CN=\"" + parsedValues.eventAttendee + "\";ROLE=PARTICIPANT\:"
                
            } else {
                eventTitle = calEvent.title;
            }
        	let newEvent =`
BEGIN:VEVENT
DTSTART:${formatDateForICal(calEvent.start)}
DTEND:${formatDateForICal(calEvent.end)}
SUMMARY:${eventTitle}
${extendedIcalValues}
END:VEVENT`
        	outputCalendar = outputCalendar + newEvent;
        }
       let text = outputCalendar + "\nEND:VCALENDAR";
	   let filename =   "test-cal.ics";
	   downloadString(filename, text);
    });
