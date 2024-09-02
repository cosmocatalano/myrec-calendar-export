(function(){
	"use strict";
    //TODO
    //better (any!) UX
    //dynamic export calendar name
    //separate function for response parsing
    //all-day handling

    //downloads a file, via TF export
    function downloadString(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    //formats dates for iCal | via ChatGPT | only had to make one fix!
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

    //formats date for MyRec post request
    function formatDateForMyrec(date) {
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, '0')
        let day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    //via ChatGPT | initially tried to sendme for() loop 
    function wrapLineCSRF(input) {
        const maxLineLength = 70;

        //human wants to limit use to lines that need it because they tell me regex is expensive slow
        if ( input.length > maxLineLength ) {

            // Match the string in chunks of up to 75 characters
            const wrappedLines = input.match(new RegExp(`.{1,${maxLineLength}}`, 'g'));

            // Add the required space for any continuation lines and join with CRLF
            return wrappedLines.map((line, index) => (index > 0 ? ' ' + line : line)).join('\r\n');
        } else {
            return input;
        }
    }

    //removes blank lines
    function removeBlankLinesRetainCRLF(str) {
        // 1. Normalize all line endings to CRLF
        const normalized = str.replace(/\r\n|\r|\n/g, '\r\n');
        // 2. Remove blank lines using regex
        const output = normalized.replace(/^[ \t]*\r\n/gm, '');
        return output;
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
        //probably a more graceful way to populate this
        let parsedTitle = {
            "eventTitle": newTitle,
            "eventAttendee": attendeeName,
            "eventVenue": venueName 
        } 
        return parsedTitle;
    }

    //quick string check to make parseTitle() less brittle
    //checks for more than one * or ( and returns false if found
    function checkSafeTitle(titleString) {
        if ( /\*{2,}|\({2,}/.test(titleString) ) {
            return false;
        } else {
            return true;
        }
    }
        

    //pulls request values out of the script last script in the header
    function getPostValue(postKey) {
        //assumes last script in head
        let pageScripts = document.head.getElementsByTagName("script");
        let lastScript = pageScripts[pageScripts.length - 1].innerHTML;
        //using a RegExp to allow variable
        const regexPatt = new RegExp(postKey + '\\s=\\s([0-9]*?);', 'm');
        let regexResponse = lastScript.match(regexPatt);
        return regexResponse[1];
    }

    //parses URL path from JavaScript:OpenUrl command
    //probably needs to be less brittle
    function parseEventUrl(eventObject) {
        const urlPatt = /OpenUrl\(\"(.*?)\"/
        let regexUrl = eventObject.url.match(urlPatt);
        return regexUrl[1];
    }

    //flag to parse title into attendee/location optons
    let isTitleParsed = true; //change this to false to NOT attempt to separate venue, time, etc.

    //set time window to pull events from
    //supply your own Date() objects to change the time window, e.g. below
    let rightNow = new Date();
    let nextYear = new Date(rightNow);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    let startTime = rightNow;  // change to (for example) new Date('March 20, 2025')
    let endTime = nextYear;    // change to (for example) new Date('March 30, 2025')


    //get host & build endpoint
    let myrecHost = window.location.host;

    //maybe attempt to auto-detect at some point 
    let myrecEndpoint = myrecHost + "/info/calendar/CalWebService.asmx/GetCalendarAccount"

    //start string for .ics output file
    let outputCalendar = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:MyRec-to-ICS";

    //POST data
    const postData = {
        AccountID: getPostValue("accountID"),
        AccountMemberID: getPostValue("accountMemberID"),
        ShowFacilities: true,
        Debug: false,
        start: formatDateForMyrec(startTime),
        end: formatDateForMyrec(endTime)
    };

    //URL encoding to keep the server happy
    const urlEncodedData = new URLSearchParams(postData).toString();

    //making requqest with correctly-encoded POST data
    fetch(`https://${myrecEndpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'charset': 'UTF-8',
            'X-Requested-With': 'XMLHttpRequest' 
        },
        body: urlEncodedData
    })
    .then(response => response.json())
    .then(data => {

        //set iterator for iCalendar UID
        let i = 0;

        //timestamp for each item
        let timestampIcal = formatDateForICal(rightNow);

        //for each calendar entry
        for (let calEvent of data) {

            //start counting at 1 like humans 
            i++

            // assign a title
            let eventTitle = '';
            let extendedIcalValues = '';

            //check for title parser flag, problematic strings
            if (checkSafeTitle(calEvent.title) === true && isTitleParsed === true) {
                //parse title
                let parsedValues = parseTitle(calEvent.title);
                //assign title variable
                eventTitle = parsedValues.eventTitle;
                //extended iCal values
                extendedIcalValues = wrapLineCSRF("LOCATION:" + parsedValues.eventVenue) + "\r\n" +
                                    wrapLineCSRF("ATTENDEE;CN=\"" + parsedValues.eventAttendee + "\";ROLE=PARTICIPANT\:")
                
            } else {
                //if off, dump everything in title
                eventTitle = calEvent.title;
            }

            //template for each event, whitespace is important here
            let newEvent =`
BEGIN:VEVENT
UID:${"event-" + i + "@example.com"}
DTSTAMP:${timestampIcal}
DTSTART:${formatDateForICal(calEvent.start)}
DTEND:${formatDateForICal(calEvent.end)}
${wrapLineCSRF('SUMMARY:' + eventTitle)}
${wrapLineCSRF('DESCRIPTION:' + calEvent.title + "\\nMore info: https://" + myrecHost + parseEventUrl(calEvent) )}
${extendedIcalValues}
END:VEVENT`
            outputCalendar = outputCalendar + newEvent;
        } //end for-of loop 

        //string to end ICS file
        let text = outputCalendar + "\nEND:VCALENDAR\r\n";

        //clean up ICS file line endings
        let crlfText = removeBlankLinesRetainCRLF(text);
        
        //assign file a name
        let filename =   "myrec-calendar.ics";

        //download the file
        downloadString(filename, crlfText);
    })
    .catch(error => {
        console.error('MyRec Export Error:', error);
    });
})();
 