//TODO
//auto-detect GetCalendarAccount endpoint
//separate location value
//event URL
//automatic AccountID detection
//default export calendar name
//separate function for response parsing

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

//start .ics file
let outputCalendar = `BEGIN:VCALENDAR
VERSION:2.0`

//object for returned data
let rawCalJSON = {};

//get MyRec data
let rawCalResponse = $.post(
	'https://carlislema.myrec.com/info/calendar/CalWebService.asmx/GetCalendarAccount', {
		AccountID: 237781, 
		AccountMemberID: 525008, 
		ShowFacilities: true, 
		Debug: false,
		start: '2024-07-28',
		end: '2025-09-08'
	}, 
    // do stuff with that data
    function(data) {
    	rawCalJSON = JSON.parse(rawCalResponse.responseText)
        for (calEvent of rawCalJSON) {
        	let newEvent =`
BEGIN:VEVENT
DTSTART: ${formatDateForICal(calEvent.start)}
DTEND: ${formatDateForICal(calEvent.end)}
SUMMARY: ${calEvent.title}
END:VEVENT`
        	outputCalendar = outputCalendar + newEvent;
        }
       let text = outputCalendar + "\nEND:VCALENDAR";
	   let filename =   "test-cal.ics";
	   downloadString(filename, text);
    });
