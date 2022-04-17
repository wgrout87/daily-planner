// BEGIN MEDIA QUERIES
var currentDay = moment().format("MMMM Do YYYY");
// END MEDIA QUERIS



// BEGIN GLOBAL VARIABLES
var tilNextHour = null;
var keyword = null;
var savedArr = [9, 10, 11, 12, 1, 2, 3, 4, 5, "savedDate"];
var intervalID = null;
var blinkIntervalIDArr = [9, 10, 11, 12, 1, 2, 3, 4, 5];
var timeoutID = null;
var timeOfAudit = null;
var dayOfAudit = null;
// END GLOBAL VARIABLES



// BEGIN FUNCTION EXPRESSIONS
// Updates the date at the top of the scheduler
var updateDate = function () {
    $("#currentDay").text(currentDay);
};

// Checks the time and compares that against the time blocks on the planner, changing the color of their <textarea> elements based on how they compare
var timeAudit = function (rowEl) {
    // Gets the time value of the row from the dataset
    var time = parseInt(rowEl.dataset.time);

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

// Runs timeAudit for each time period to properly color each <textarea>
var updateTextarea = function () {
    $(".row").each(function (index, el) {
        timeAudit(el);
    });
    timeOfAudit = moment().format("hh:mm");
    dayOfAudit = moment().format("MMMM Do YYYY");
    console.log("Time of update: " + timeOfAudit);
    console.log("Date of update: " + dayOfAudit);
};

// Determines an approximate time until the next hour begins
var tilNextHourBegins = function () {
    // Determines the current time and returns only the minutes and seconds formatted as 00:00
    var timeToNextHour = moment().format("m:s");
    // Removes the colon and adds each number to either side into an array
    var timeArr = timeToNextHour.split(":");
    // Converts the time values in the array into milliseconds and subtracts that value from the number of milliseconds in an hour to determine the number of milliseconds until the next hour
    tilNextHour = (60 * 60 * 1000) - ((timeArr[0] * 60 * 1000) + (timeArr[1] * 1000));
    console.log("Time until next hour in seconds: " + ((60 * 60) - ((timeArr[0] * 60) + (timeArr[1] * 1))));
};

// Ensures the correct date is displayed and updates the <textarea> color every hour
var autoUpdate = function () {
    // Calls the function upDateOnTheHour() every minute to ensure the best accuracy
    setInterval(upDateOnTheHour, (1000 * 60));
};

// Loads any saved <textarea> entries
var loadSaves = function () {
    // Retrieves and parses saved array from local storage if such an array has been saved
    if (localStorage.getItem("savedTasks")) {
        savedArr = JSON.parse(localStorage.getItem("savedTasks"));
    }
    // Loads anything saved for the current day by checking if the day the saveArr array was saved on was today
    if (savedArr[9] == currentDay) {
        // Performs this annonymous function for each row
        $(".row").each(function () {
            // Runs a for loop to look through the savedArr array, but ignores the last value of the array
            for (i = 0; i < 9; i++) {
                // Checks the arrPosition value of the row against the arrayPosition property of the object in position i of the savedArr array
                if ($(this).data().arrPosition == savedArr[i].arrayPosition) {
                    // If the values are equal, inserts the saved text content into the <textarea> of the current row
                    $(this).find("textarea").val(savedArr[i].textContent);
                }
            }
        });
    };
};

// Function for intermittently adding and removing "bg-danger" class to and from save buttons
var blink = function (btnEl) {
    // Capture the interval id in the global variable "intervalID"
    intervalID = setInterval(() => {
        // Checks if the "bg-danger" class is already present and removes it if it is
        if (btnEl.hasClass("bg-danger")) {
            btnEl.removeClass("bg-danger")
        }

        // Adds the "bg-danger" class if not already present
        else {
            btnEl.addClass("bg-danger")
        };
    }, 400);
}

// Function for stopping the blinking save buttons
var clearBlink = function (btnEl) {
    // Determines the arrPosition value for the current row
    var btnReference = btnEl.parent().data().arrPosition;
    // Clears the interval based on the saved ID in the position determined by the arrPosition value for the current row
    clearInterval(blinkIntervalIDArr[btnReference]);
    // Removes the "bg-danger" class if it is present
    if (btnEl.hasClass("bg-danger")) {
        btnEl.removeClass("bg-danger")
    };
}

// Updates the text areas on the next hour
var upDateOnTheHour = function () {
    // Cancels any previously established timeout
    clearTimeout(timeoutID);
    // Finds the time left until the next hour begins in milliseconds and saves it in the tilNextHour variable
    tilNextHourBegins();
    // Sets a new timeout that will update the text areas on the our
    timeoutID = setTimeout(function () {
        // Calls the function to update the <textarea> elements immediately after the timeout ends
        updateTextarea();
        // Updates the date at the top of the scheduler
        updateDate();
    }, tilNextHour);
    console.log(moment().format("hh:mm:ss"));
    console.log(tilNextHour);
};
// END FUNCTION EXPRESSIONS



// BEGIN EVENT LISTENERS
// Event listener for the save buttons
$(".saveBtn").on("click", function () {
    // Updates the date saved in the savedArr array
    savedArr[9] = currentDay;
    // Stops the save button flashing if it was
    clearBlink($(this));
    // Sets the "textToSave" variable to the text content of the <textarea> element on the same row as the button that was clicked
    var textToSave = $(this).parent().find("textarea").val();
    // Sets the information to be saved as properties of the timeframeObj
    var timeframeObj = {
        arrayPosition: $(this).parent().data().arrPosition,
        textContent: textToSave
    };
    // Adds the new timeframeObj into the "savedArr" array
    savedArr[timeframeObj.arrayPosition] = timeframeObj;
    // Saves the text using the time of that row as the keyword
    localStorage.setItem("savedTasks", JSON.stringify(savedArr));
});

// The save button will blink red if changes are not saved
$("textarea").on("change", function () {
    // Selects the button of the row in which changes were made
    var changedRowBtn = $(this).parent().find("button");
    // Adds the "bg-danger" class to the button
    changedRowBtn.addClass("bg-danger");
    // Starts blinking between the new and original background colors
    blink(changedRowBtn);
    // Retrieves the arrPosition value saved for the row
    var blinkAltIntervalIDPosition = $(this).parent().data().arrPosition;
    // Saves the interval ID for the blinking effect in an array that can be referenced again when the changes are saved
    blinkIntervalIDArr[blinkAltIntervalIDPosition] = intervalID;
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

// Starts the interval to update automatically
autoUpdate();
// END FUNCTIONS RUN ON LOAD