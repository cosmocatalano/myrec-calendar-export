# MyRec Calendar Export

This Chrome Extension takes data from a [MyRec](https://www.myrec.com/) calendar page and exports it as an [iCalendar](https://en.wikipedia.org/wiki/ICalendar) (.ics) file.

## Installation

1. Clone or download this repo to your local machine.

2. Go to [chrome://extensions](chrome://extensions) in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox:  The menu's icon is three horizontal bars. and select Extensions under the Tools menu to get to the same place).
  
3. Ensure that the **Developer mode** toggle in the top right-hand corner is set to on. Click the **Load unpacked** button to pop up a file-selection dialog:
![screenshot of chrome://extensions, highlighting the location of the Developer Mode toggle and the Load Unpacked button with a red circle](https://github.com/user-attachments/assets/dcf7a391-8ad3-4a18-ae79-b53ad651a949)

4. Navigate to the directory where you cloned/downlaoded this repo in (1). Alternatively, you can drag and drop the directory where your extension files live onto chrome://extensions in your browser to load it.

You can read more about the developer Extensions process at the [Chrome Developer site](https://developer.chrome.com/extensions/getstarted#unpacked)

## Use 

Log in to the MyRec account you'd like to export the calendar from, and navigate to the **Calendar** page. The URL should be something like "https://\[yourCityName\].myrec.com/info/calendar/account.aspx".

Click the **Extensions** icon in your Chrome Toolbar and select **MyRec Calendar Export** from the dropdown. An .ics file of your MyRec events should automatically download.

![screenshot of a MyRec calendar page, with the Extensions icon and MyRec Calendar Exporter dropdown item highlighted with a red circle](https://github.com/user-attachments/assets/c1a381a9-5516-4a43-a4f2-41f07609bcfa)

## Details / Caveats

By default, extension exports a full year of calendar items, starting on the day the script is run. You can change this by supplying your own `Date()` objects for the `startTime` and  `endTime` variables in `my-rec.js`.

Exported calendars **do not** sync with changes in MyRec—you will need to re-export any time you add/remove/change your schedule. Also, successive exports/imports  **will not** overwrite/update existing event data. I would recommend creating a separate calendar for MyRec events within the calendar app of your choosing that you can fully delete before making a new import.

Finally, MyRec sandwiches the name of the event _participant_ and event _venue_ into its event _titles_. By default, this Extension attempts (in the `parseTitle()` function)  to parse those into the ICS fields for [Attendee](https://www.kanzaki.com/docs/ical/attendee.html) and [Location](https://www.kanzaki.com/docs/ical/location.html). This is based on some possibly unreliable assumptions about title text format. 

The script does attempt to check for problems (in `checkSafeTitle()`) but if you run into issues and/or want all events formatted consistently, you can turn off this title parsing by setting `isTitleParsed` to `false`.

The script does check for titles that might break it, and in those instanaces