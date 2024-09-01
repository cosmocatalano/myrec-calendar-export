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


