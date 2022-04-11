// BEGIN MEDIA QUERIES
var currentDay = moment().format("MMMM Do YYYY");
// END MEDIA QUERIS



// BEGIN GLOBAL VARIABLES
var tilNextHour = null;
var keyword = null;
var time = null;
var savedArr = [9, 10, 11, 12, 1, 2, 3, 4, 5, "savedDate"];
// END GLOBAL VARIABLES



// BEGIN FUNCTION EXPRESSIONS
// Updates the date at the top of the scheduler
var updateDate = function () {
    $("#currentDay").text(currentDay);
};

// Checks the time and compares that against the time blocks on the planner, changing the color of their <textarea> elements based on how they compare
var timeAudit = function (rowEl) {
    // Gets the integer part of the time listed in the <p> element in the rows in the HTML and converts it to military time
    time = toMilitaryTime(parseInt($(rowEl).find("p").text().trim()));

    // Checks if the time for the row is in the past 
    if (time < moment().format("H")) {
        // Adds the "past" class to the <textarea>
        $(rowEl).find("textarea").addClass("past");
        // Removes the "present" class if present
        $(rowEl).find("textarea").removeClass("present");
    };

    // Checks if the time for the row is in the present 
    if (time == moment().format("H")) {
        // Adds the "present" class to the <textarea>
        $(rowEl).find("textarea").addClass("present");
        // Removes the "future" class if present
        $(rowEl).find("textarea").removeClass("future");
    };

    // Checks if the time for the row is in the future 
    if (time > moment().format("H")) {
        $(rowEl).find("textarea").addClass("future");
        // Adds the "future" class to the <textarea>
        $(rowEl).find("textarea").removeClass("past");
        // Removes the "past" class if present
    };
}

// Changes "time" variable to military time
var toMilitaryTime = function (timeValue) {
    // Converts the afternoon hours to military time. Each row will now be represented with an integer value from 9 to 17
    if (timeValue < 9) {
        timeValue += 12;
    };
    return timeValue;
}

// Runs timeAudit for each time period to properly color each <textarea>
var updateTextarea = function () {
    $(".row").each(function (index, el) {
        timeAudit(el);
    });
};

// Determines an approximate time until the next hour begins
var tilNextHourBegins = function () {
    // Determines the current time and returns only the minutes and seconds formatted as 00:00
    var timeToNextHour = moment().format("m:s");
    // Removes the colon and adds each number to either side into an array
    var timeArr = timeToNextHour.split(":");
    // Converts the time values in the array into milliseconds and subtracts that value from the number of milliseconds in an hour to determine the number of milliseconds until the next hour
    tilNextHour = (60 * 60 * 1000) - ((timeArr[0] * 60 * 1000) + (timeArr[1] * 1000));
    // console.log("Time until next hour in seconds: " + ((60 * 60) - ((timeArr[0] * 60) + (timeArr[1] * 1))));
    // console.log("Time until next hour: " + (59 - JSON.parse(timeArr[0])) + " minutes " + (60 - JSON.parse(timeArr[1])) + "seconds");
};

// Ensures the correct date is displayed and updates the <textarea> color every hour
var updateHourly = function () {
    // Ensures the correct date is displayed
    updateDate();
    // Calls the function again after an hour and continues with that interval
    setInterval(updateTextarea, (1000 * 60 * 60));
    console.log("Time of update: " + moment().format("hh:mm"));
};

// Loads any saved <textarea> entries
var loadSaves = function () {
    // Retrieves and parses saved array from local storage
    savedArr = JSON.parse(localStorage.getItem("savedTasks"));
    // Loads anything saved for the current day by checking if the day the saveArr array was saved on was today
    if (savedArr[9] == currentDay) {
        // Performs this annonymous function for each row
        $(".row").each(function () {
            // Sets the value of "currentRowValue" to the integer value in the <p> element of the current row converted to military time
            var currentRowValue = toMilitaryTime(parseInt($(this).find("p").text().trim()));
            // Runs a for loop to look through the savedArr array, but ignores the last value of the array
            for (i = 0; i < 9; i++) {
                // "currentRowValue" - 9 will yield a value equal to a position in the savedArr array that corresponds to the 
                if (currentRowValue - 9 == savedArr[i].arrayPosition) {
                    $(this).find("textarea").val(savedArr[i].textContent);
                }
            }
        });
    };
};
// END FUNCTION EXPRESSIONS



// BEGIN EVENT LISTENERS
// Event listener for the save buttons
$(".saveBtn").on("click", function () {
    savedArr[9] = currentDay;
    // Sets the "hour" variable to the time held in the <p> element on the same row as the button that was clicked
    var timeframe = $(this).parent().find("p").text().trim();
    // "time" variable is set to the integer value taken from "timeframe" and converted to military time
    time = toMilitaryTime(parseInt(timeframe));
    // 9 is subtracted from the "time" variable, now in military time, so that it can properly be positioned in the "savedArr" array
    var determinePosition = time - 9;
    // Sets the "textToSave" variable to the text content of the <textarea> element on the same row as the button that was clicked
    var textToSave = $(this).parent().find("textarea").val();
    // Sets the information to be saved as properties of the timeframeObj
    var timeframeObj = {
        arrayPosition: determinePosition,
        hour: timeframe,
        textContent: textToSave
    }
    // Adds the new timeframeObj into the "savedArr" array
    savedArr[timeframeObj.arrayPosition] = timeframeObj;
    // Saves the text using the time of that row as the keyword
    localStorage.setItem("savedTasks", JSON.stringify(savedArr));
});
// END EVENT LISTENERS



// BEGIN FUNCTIONS RUN ON LOAD
// Updates the date at the top of the scheduler
updateDate();

// Loads saved entries for all <textarea> elements
loadSaves();

// Runs timeAudit for each time period to properly color each <textarea>
updateTextarea();

// Finds the time left until the next hour begins in milliseconds and saves it in the tilNextHour variable
tilNextHourBegins();

// Updates the text areas on the next hour and sets up the updateHourly function to run every hour thereafter
setTimeout(function () {
    // Calls the function to update the <textarea> elements immediately after the timeout ends
    updateTextarea();
    // Updates the date at the top of the scheduler
    updateDate();
    // Starts the interval to update hourly
    updateHourly();
}, tilNextHour);
// END FUNCTIONS RUN ON LOAD