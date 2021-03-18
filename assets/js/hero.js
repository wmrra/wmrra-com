// cache the next race event so we only need to look it up once
var nextRaceEvent = null;

function displayHeroContent() {
  var blockToShow;
  var heroBlocks = $(".hero-announcement-content-block");

  for (var block of heroBlocks) {
    if (shouldShowBlock(block)) {
      blockToShow = block;
      break;
    }
  }

  if (blockToShow) {
    // if there's an upcoming race event, 
    // we need to populate some extra dynamic content
    if (nextRaceEvent) {
      populateRaceEventContent(blockToShow);
    }
    heroBlocks.not(blockToShow).remove();
    $(blockToShow).addClass("the-chosen-one");
  }
}

function shouldShowBlock(block) {
  switch ($(block).attr("id")) {
    case "latest-announcement":
      return shouldShowLatestAnnouncement(block)
    case "next-race-event":
      return shouldShowNextRaceEvent(block);
    case "default":
      return true;
    default:
      return false;
  }
}

function shouldShowLatestAnnouncement(latestAnnouncementBlock) {
  var dateData = $(latestAnnouncementBlock).data("date");

  if (!dateData) {
    return false;
  }

  var announcementDate = new Date(dateData)
  var daysSinceAnnouncement = Math.floor(((new Date() - announcementDate) / 1000) / (60 * 60 *24));

  return daysSinceAnnouncement <= 7;
}

function shouldShowNextRaceEvent(raceScheduleBlock) {
  var scheduleData = $(raceScheduleBlock).data("schedule");

  if (!scheduleData) {
    return false;
  }

  return !!getNextRaceEvent(scheduleData);
}

// looks through the schedule and finds the next
// race event in the list (based on the current date)
function getNextRaceEvent(schedule) {
  if (!nextRaceEvent) {
    var now  = new Date();
    var currentMonth = now.getMonth();
    var currentDay = now.getDate();
    var scheduleIndex = 0;
    
    while (!nextRaceEvent && scheduleIndex < schedule.length) {
      var currentEvent = schedule[scheduleIndex];
      var { month, day } = extractRaceEventMonthAndDay(currentEvent);
  
      // event is in a month that's in the past OR
      // event is this month, but is on a day that's in the past
      if (month < currentMonth || (month === currentMonth && day < currentDay)) {
        scheduleIndex++;
        continue;
      }
  
      // otherwise, this is the next event!
      nextRaceEvent = currentEvent;
    }
  }

  return nextRaceEvent;
}

// if there is an upcoming/current race event,
// we'll either show a countdown clock or let folx know it's race day
function populateRaceEventContent(block) {
  var { month, day } = extractRaceEventMonthAndDay(nextRaceEvent);
  // BUT Javascript dates are NOT ZERO-INDEXED when you're trying to make a date (╯°□°)╯︵ ┻━┻
  var nextRaceEventDate = new Date(`${month + 1} ${day} ${new Date().getFullYear()}`);

  var textContainer = $(block).children(".hero-announcement-text");
  if (new Date().getDate() === nextRaceEventDate.getDate()) {
    textContainer.append($("<h1>").text("It's Race Day!"));
  } else {
    var eventTime = nextRaceEventDate.getTime();
    var countdownContainer = $("<h1>").attr("id", "race-countdown-clock").text("");

    textContainer.append($("<h1>").text("Next Race Round"));
    textContainer.append($("<h2>").text(`${nextRaceEvent.date} at ${nextRaceEvent.location}`));
    textContainer.append(countdownContainer);

    // populate the countdown clock immediately, 
    // then start updating every second (otherwise it is momentarily invisible)
    calculateNextCountdownTime(eventTime, countdownContainer);
    setInterval(function() {
      calculateNextCountdownTime(eventTime, countdownContainer);
    }, 1000);
  }
}

// https://www.w3schools.com/howto/howto_js_countdown.asp
function calculateNextCountdownTime(eventTime, countdownContainer) {
  var nowTime = new Date().getTime();
  var distance = eventTime - nowTime;

  // time calculations for days, hours, minutes and seconds
  var days = formatCountdownNumber(Math.floor(distance / (1000 * 60 * 60 * 24)));
  var hours = formatCountdownNumber(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  var minutes = formatCountdownNumber(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
  var seconds = formatCountdownNumber(Math.floor((distance % (1000 * 60)) / 1000));

  var timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`
  countdownContainer.text(timeString);
}

// event data format: "May 17-18"
function extractRaceEventMonthAndDay(raceEvent) {
  var eventDateParts = raceEvent.date.split(" ");
  return { 
    month: getMonthNumber(eventDateParts[0]), 
    day: parseInt(eventDateParts[1].split("-")[0]), 
  };
}

// pads any single-digit numbers with a leading 0 
// so they don't constantly change the width of the timer
function formatCountdownNumber(countdownNumber) {
  return countdownNumber.toString().padStart(2, '0');
}

// AnNa WhY nOt JuSt UsE a lIbRaRy?
// it's overkill, that's why
// also, months in Javascript are zero-indexed, so
const MONTH_NAMES = [ 
  "January", 
  "February", 
  "March", 
  "April", 
  "May", 
  "June", 
  "July", 
  "August", 
  "September", 
  "October", 
  "November", 
  "December",
];

function getMonthNumber(name) {
  return MONTH_NAMES.indexOf(name);
}

$(document).ready(function() {
  displayHeroContent();
});