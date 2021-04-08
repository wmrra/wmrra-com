// cache the next race event so we only need to look it up once
var nextRaceEvent = null;

function selectHeroImage() {
  var homeContent = $(".home-content-wrapper")
  var images = homeContent.data("images");
  var imageIndex =  Math.floor(Math.random() * images.length);
  var heroImageData = images[imageIndex];

  if (heroImageData.shift) {
    homeContent.children(".hero").addClass("shift-align");
  }

  var heroImageStyle = $("<style>").html(`.hero::after{ background-image: url(${window.location.origin}/images/hero/${heroImageData.filename}) };`);
  $("head").append(heroImageStyle);

  homeContent.removeAttr("data-images");
}

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
  // also, if you don't put the slashes in the date, Safari cries about it
  var nextRaceEventDate = new Date(`${month + 1}/${day}/${new Date().getFullYear()}`);

  var textContainer = $(block).children(".hero-announcement-text");
  if (areSameDate(new Date(), nextRaceEventDate)) {
    textContainer.append($("<h1>").text("It's Race Day!"));
  } else {
    var eventTime = nextRaceEventDate.getTime();

    textContainer.append($("<h1>").text("Next Race Round"));
    textContainer.append($("<h2>").text(`${nextRaceEvent.date} at ${nextRaceEvent.location}`));

    // if next race event Date object isn't valid, we can bail out before adding the countdown
    if (!nextRaceEventDate instanceof Date || isNaN(nextRaceEventDate)) {
      return;
    }

    // populate the countdown clock immediately, 
    // then start updating every second (otherwise it is momentarily invisible)
    var countdownContainer = buildCountdownContainerHtml();
    textContainer.append(countdownContainer);
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
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // if any of these numbers is invalid, don't so anything
  if (isNaN(days) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return;
  }

  const timeContainers = countdownContainer.children()

  timeContainers.filter("#days").children(".countdown-number").text(formatCountdownNumber(days));
  timeContainers.filter("#hours").children(".countdown-number").text(formatCountdownNumber(hours));
  timeContainers.filter("#minutes").children(".countdown-number").text(formatCountdownNumber(minutes));
  timeContainers.filter("#seconds").children(".countdown-number").text(formatCountdownNumber(seconds));
}

function buildCountdownContainerHtml() {
  var countdownContainer = $("<h1>").attr("id", "race-countdown-clock");

  ["days", "hours", "minutes", "seconds"].forEach(function(divId) {
    countdownContainer.append($("<div>").addClass("countdown-number-wrapper").attr("id", divId));
  });

  countdownContainer.children().each(function(_index, child) {
    const container = $(child);
    container.append($("<span>").addClass("countdown-number"));
    container.append($("<span>").addClass("countdown-label").text(container.attr("id")));
  });

  return countdownContainer;
}

// event data format: "May 17-18"
function extractRaceEventMonthAndDay(raceEvent) {
  var eventDateParts = raceEvent.date.split(" ");
  return { 
    month: getMonthNumber(eventDateParts[0]), 
    day: parseInt(eventDateParts[1].split("-")[0]), 
  };
}

// Returns true if year, month, and day of both of the
// passed dates are the same
function areSameDate(date1, date2) {
  return (
    date1.getYear() === date2.getYear() 
    && date1.getMonth() === date2.getMonth() 
    && date1.getDate() === date2.getDate()
  );
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
  selectHeroImage();
  displayHeroContent();
});