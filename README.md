# MyRec Calendar Export

This Chrome Extension takes data from a MyRec calendar page and exports it as an iCalendar (.ics) file.

## Installation

1. Clone or download this repo to your local machine.

2. Go to [chrome://extensions](chrome://extensions) in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox:  The menu's icon is three horizontal bars. and select Extensions under the Tools menu to get to the same place).

3. Ensure that the **Developer mode checkbox** in the top right-hand corner is checked. Click **Load unpacked extension…** to pop up a file-selection dialog.

4. Navigate to the directory where you cloned/downlaoded this repo in (1). Alternatively, you can drag and drop the directory where your extension files live onto chrome://extensions in your browser to load it.

You can read more about the developer Extensions process at the [Chrome Developer site](https://developer.chrome.com/extensions/getstarted#unpacked)

## Use 

Log in to the MyRec account you'd like to export the calendar from, and navigate to the **Calendar** page. The URL should be something like "https://\[yourCityName\].myrec.com/info/calendar/account.aspx".

Go to Extensions icon in your Chrome Toolbar and click **MyRec Calendar Export** from the dropdown. An .ics file of your MyRec events should automatically download.

