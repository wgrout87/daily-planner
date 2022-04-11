// WHEN I view the time blocks for that day
// THEN each time block is color-coded to indicate whether it is in the past, present, or future
// WHEN I click into a time block
// THEN I can enter an event
// WHEN I click the save button for that time block
// THEN the text for that event is saved in local storage
// WHEN I refresh the page
// THEN the saved events persist

// BEGIN MEDIA QUERIES
var currentDay = $("#currentDay");
// END MEDIA QUERIS



// BEGIN GLOBAL VARIABLES
var tilNextHour = null;
// END GLOBAL VARIABLES



// BEGIN FUNCTION EXPRESSIONS
// Updates the date at the top of the scheduler
var updateDate = function () {
    currentDay.text(moment().format("MMMM Do YYYY"));
};

// Checks the time and compares that against the time blocks on the planner, changing the color of their textareas based on how they compare
var timeAudit = function (rowEl) {
    // Gets the integer part of the time listed in the <p> element in the rows in the HTML
    var time = parseInt($(rowEl).find("p").text().trim());
    // Converts the afternoon hours to military time. Each row will now be represented with an integer value from 9 to 17
    if (time < 9) {
        time += 12;
    };

    // Checks if the time for the row is in the past 
    if (time < moment().format("H")) {
        // Adds the "past" class to the textarea
        $(rowEl).find("textarea").addClass("past");
        // Removes the "present" class if present
        $(rowEl).find("textarea").removeClass("present");
    };

    // Checks if the time for the row is in the present 
    if (time == moment().format("H")) {
        // Adds the "present" class to the textarea
        $(rowEl).find("textarea").addClass("present");
        // Removes the "future" class if present
        $(rowEl).find("textarea").removeClass("future");
    };

    // Checks if the time for the row is in the future 
    if (time > moment().format("H")) {
        $(rowEl).find("textarea").addClass("future");
        // Adds the "future" class to the textarea
        $(rowEl).find("textarea").removeClass("past");
        // Removes the "past" class if present
    };
}

// Runs timeAudit for each time period to properly color each <textarea>
var updateTextarea = function () {
    $(".row").each(function (index, el) {
        timeAudit(el);
    });
}

// Determines an approximate time until the next hour begins
var tilNextHourBegins = function () {
    // Determines the current time and returns only the minutes and seconds formatted as 00:00
    var time = moment().format("m:s");
    // Removes the colon and adds each number to either side into an array
    var timeArr = time.split(":");
    // Converts the time values in the array into milliseconds and subtracts that value from the number of milliseconds in an hour to determine the number of milliseconds until the next hour
    tilNextHour = (60 * 60 * 1000) - ((timeArr[0] * 60 * 1000) + (timeArr[1] * 1000));
    console.log("Time until next hour in seconds: " + ((60 * 60) - ((timeArr[0] * 60) + (timeArr[1] * 1))));
    console.log("Time until next hour: " + (59 - JSON.parse(timeArr[0])) + " minutes " + (60 - JSON.parse(timeArr[1])) + "seconds");
}

// Ensures the correct date is displayed and updates the textarea color every hour
var updateHourly = function () {
    // Ensures the correct date is displayed
    updateDate();
    // Calls the function again after an hour and continues with that interval
    setInterval(updateTextarea, (1000 * 60 * 60));
    console.log("Time of update: " + moment().format("hh:mm"));
}
// END FUNCTION EXPRESSIONS



// BEGIN EVENT LISTENERS
$(".saveBtn").on("click", function () {
    var keyword = $(this).parent().find("p").text().trim();
    console.log(keyword);
    var textToSave = $(this).parent().find("textarea").val();
    console.log(textToSave);
    localStorage.setItem(keyword,textToSave);
})
// END EVENT LISTENERS



// BEGIN FUNCTIONS RUN ON LOAD
// Updates the date at the top of the scheduler
updateDate();

// Runs timeAudit for each time period to properly color each <textarea>
updateTextarea();

// Finds the time left until the next hour begins in milliseconds and saves it in the tilNextHour variable
tilNextHourBegins();

// Updates the text areas on the next hour and sets up the updateHourly function to run every hour thereafter
setTimeout(function(){
    // Calls the function to update the textareas immediately
    updateTextarea();
    // Updates the date at the top of the scheduler
    updateDate();
    // Starts the interval to update hourly
    updateHourly();
}, tilNextHour);
// END FUNCTIONS RUN ON LOAD