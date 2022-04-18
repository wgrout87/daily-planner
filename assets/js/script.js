// BEGIN GLOBAL VARIABLES
var currentDay = moment().format("MMMM D YYYY");
var tilNextHour = null;
var timeOfAudit = null;
var dayOfAudit = null;
var timeoutID = null;
var savedArr = [9, 10, 11, 12, 1, 2, 3, 4, 5];
var intervalID = null;
var blinkIntervalIDArr = [9, 10, 11, 12, 1, 2, 3, 4, 5];
// END GLOBAL VARIABLES



// BEGIN FUNCTION EXPRESSIONS
// Updates the date at the top of the scheduler
var updateDate = function () {
    $("#currentDay").text(currentDay);
};

// Checks the time and compares that against the time blocks on the planner, changing the color of their <textarea> elements based on how they compare
var timeAudit = function (rowEl) {
    // Reassigns "currentDay" in case the page has been left open rolling into the next day
    currentDay = moment().format("MMMM D YYYY");
    // Checks if the displayed day is in the past and reloads the page if it is
    if (moment(parseInt($("#currentDay").text())).isBefore(parseInt(currentDay))) {
        location.reload();
    };
    // Checks if the calendar is displaying the current day. If a future date is displayed, the <textarea> elements will be set to the future color scheme
    if ($("#currentDay").text() == currentDay) {
        // Gets the time value of the row from the dataset
        var time = parseInt(rowEl.dataset.time);

        // Checks if the time for the row is in the past 
        if (time < moment().format("H")) {
            // Adds the "past" class to the <textarea>
            $(rowEl).find("textarea").addClass("past");
            // Removes the "present" class if present
            $(rowEl).find("textarea").removeClass("present");
            // Removes the "future" class if present
            $(rowEl).find("textarea").removeClass("future");
        };

        // Checks if the time for the row is in the present 
        if (time == moment().format("H")) {
            // Adds the "present" class to the <textarea>
            $(rowEl).find("textarea").addClass("present");
            // Removes the "past" class if present
            $(rowEl).find("textarea").removeClass("past");
            // Removes the "future" class if present
            $(rowEl).find("textarea").removeClass("future");
        };

        // Checks if the time for the row is in the future 
        if (time > moment().format("H")) {
            // Adds the "future" class to the <textarea>
            $(rowEl).find("textarea").addClass("future");
            // Removes the "past" class if present
            $(rowEl).find("textarea").removeClass("past");
            // Removes the "present" class if present
            $(rowEl).find("textarea").removeClass("present");
        };
    }

    else {
        // Adds the "future" class to the <textarea>
        $(rowEl).find("textarea").addClass("future");
        // Removes the "present" class if present
        $(rowEl).find("textarea").removeClass("past");
        // Removes the "past" class if present
        $(rowEl).find("textarea").removeClass("present");
    }
}

// Runs timeAudit for each time period to properly color each <textarea>
var updateTextarea = function () {
    $(".row").each(function (index, el) {
        timeAudit(el);
    });
    // Saves the hour and date of the most resent update
    timeOfAudit = moment().format("H");
    dayOfAudit = moment().format("MMMM D YYYY");
    console.log("Time of update: " + moment().format("hh:mm"));
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
};

// Updates the text areas on the next hour using a timeout
var upDateOnTheHour = function () {
    // Checks if the textareas haven't been updated for the current hour
    if (moment().format("H") !== timeOfAudit || moment().format("MMMM D YYYY") !== dayOfAudit) {
        // Calls updateTextarea() which will update the textareas if the timers have come out of sync (if for example the computer went to sleep)
        updateTextarea();
    };
    // Cancels any previously established timeout
    clearTimeout(timeoutID);
    // Finds the time left until the next hour begins in milliseconds and saves it in the tilNextHour variable
    tilNextHourBegins();
    // Sets a new timeout that will update the text areas on the hour
    timeoutID = setTimeout(function () {
        // Calls the function to update the <textarea> elements immediately after the timeout ends
        updateTextarea();
    }, tilNextHour);
};

// Updates the <textarea> color every hour
var autoUpdate = function () {
    // Calls the function upDateOnTheHour() every minute to ensure the best accuracy
    setInterval(upDateOnTheHour, (1000 * 60));
};

// Loads any saved <textarea> entries
var loadSaves = function () {
    // Retrieves and parses saved array from local storage if such an array has been saved
    if (localStorage.getItem($("#currentDay").text())) {
        savedArr = JSON.parse(localStorage.getItem($("#currentDay").text()));
    }
    // Resets savedArr for days with no saved data
    else {
        savedArr = [9, 10, 11, 12, 1, 2, 3, 4, 5];
    };
    // Performs this annonymous function for each row
    $(".row").each(function () {
        // Clears out any existing text
        $(this).find("textarea").val("");
        // Runs a for loop to look through the savedArr array
        for (i = 0; i < savedArr.length; i++) {
            // Checks the arrPosition value of the row against the arrayPosition property of the object in position i of the savedArr array
            if ($(this).data().arrPosition == savedArr[i].arrayPosition) {
                // If the values are equal, inserts the saved text content into the <textarea> of the current row
                $(this).find("textarea").val(savedArr[i].textContent);
            }
        }
    });
};

// Function for intermittently adding and removing "bg-danger" class to and from save buttons
var blink = function (btnEl) {
    // Capture the interval id in the global variable "intervalID". This vaule will be saved in an array whenever blink() is called.
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
// END FUNCTION EXPRESSIONS



// BEGIN EVENT LISTENERS
// Event listener for the save buttons
$(".saveBtn").on("click", function () {
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
    // Saves the savedArr array as text using the displayed day as the keyword
    localStorage.setItem($("#currentDay").text(), JSON.stringify(savedArr));
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

// "#currentDay" <p> was clicked
$(".jumbotron").on("click", "p", function () {
    // The text is saved
    var date = $(this)
        .text()
        .trim();

    // A new <input> element is created
    var dateSelect = $("<input>")
        // type = text
        .attr("type", "text")
        // The saved date text is added into the new <input> element
        .val(date);

    // Replaces the <p> element with the newly created <input> element
    $(this).replaceWith(dateSelect);

    // Adds the datepicker to the new <input> element
    dateSelect.datepicker({
        // Today is the earliest day that can be selected
        minDate: 0,
        // The date is formatted to match the moment.js date format used in the #currentDay <p>
        dateFormat: "MM d yy",

        onClose: function () {
            // Causes a "change" event on the <input> element when the calendar is closed
            $(this).trigger("change");
        }
    });

    // Focuses on the new <input> element
    dateSelect.trigger("focus");
});

// Event listener for after the datepicker has been used
$(".jumbotron").on("change", "input[type='text']", function () {
    // The text is saved
    var date = $(this)
        .val()
        .trim();

    // A new <p> element is created to replace the <input> element
    var displayedDate = $("<p>")
        // Adds the class back
        .addClass("lead")
        // Reassigns the ID
        .attr("id", "currentDay")
        // Assigns the new text
        .text(date);

    // Replaces the <input> element with the newly created <p> element
    $(this).replaceWith(displayedDate);

    // Calls the loadSaves() function to bring in any saved information
    loadSaves();
    // Updates the <textarea> elements to represent the displayed day
    updateTextarea();
});
// END EVENT LISTENERS



// BEGIN FUNCTIONS RUN ON LOAD
// Updates the date at the top of the scheduler
updateDate();

// Loads saved entries for all <textarea> elements
loadSaves();

// Runs timeAudit for each time period to properly color each <textarea>
updateTextarea();

// Starts the interval to update automatically
autoUpdate();
// END FUNCTIONS RUN ON LOAD