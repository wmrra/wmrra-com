// cache some stuff about upcoming race events 
// so we don't have to continually look it up
var nextRaceEvent = null;
var nextRaceEventDays = null;

// precedence order for hero blocks (i.e. which should show first)
// if you add a new hero block, ADD THE ID TO THIS LIST
const ORDERED_HERO_BLOCK_IDS = ["race-day", "latest-announcement", "next-race-event"]

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
  var raceEventYear = heroBlocks.filter("#next-race-event")?.data("year");
  var raceSchedule = heroBlocks.filter("#next-race-event")?.data("schedule");
  nextRaceEvent = getNextRaceEvent(raceSchedule, raceEventYear);
  nextRaceEventDays = extractRaceEventDates(nextRaceEvent, raceEventYear);

  for (var blockId of ORDERED_HERO_BLOCK_IDS) {
    const block = heroBlocks.filter(`#${blockId}`);
    if (shouldShowBlock(block)) {
      blockToShow = block;
      break;
    }
  }

  if (!blockToShow){
    // Default to showing the latest news announcement.
    blockToShow = heroBlocks.filter(`#latest-announcement`);
  }

  heroBlocks.not(blockToShow).remove();
  populateBlockContent(blockToShow);
  $(blockToShow).addClass("the-chosen-one");

  // remove all data attrs from hero blocks so they don't pollute the dom
  heroBlocks.removeAttr("data")
}

function shouldShowBlock(block) {
  switch ($(block).attr("id")) {
    case "race-day":
      return isRaceDay();
    case "latest-announcement":
      return shouldShowLatestAnnouncement(block)
    case "next-race-event":
      return !!nextRaceEvent;
    case "default":
      return true;
    default:
      return false;
  }
}

function populateBlockContent(block) {
  switch ($(block).attr("id")) {
    case "race-day":
      populateRaceDayContent(block);
      return;
    case "next-race-event":
      populateNextRaceEventContent(block);
      return;
    case "default":
      return;
  }
}

function shouldShowLatestAnnouncement(latestAnnouncementBlock) {
  var dateData = $(latestAnnouncementBlock).data("date");

  if (!dateData) {
    return false;
  }

  var announcementDate = new Date(dateData)
  var daysSinceAnnouncement = Math.floor(((new Date() - announcementDate) / 1000) / (60 * 60 *24));

  return daysSinceAnnouncement <= 30;
}

function isRaceDay() {
  return nextRaceEventDays.some(eventDate => areSameDate(new Date(), eventDate));
}

// looks through the schedule and finds the next
// race event in the list (based on the current date)
function getNextRaceEvent(schedule, year) {
  if (!schedule) {
    return null;
  }

  if (!nextRaceEvent) {
    var now  = new Date();
    if (now.getFullYear() != year){
      // If the next season is in the following year, figure out the first
      // event by using Jan 1, next-year, as 'now'
      // TODO: could change date math to account for year also, though this has
      // the same effect
      now  = new Date(year,1,1);
    }
    var currentMonth = now.getMonth();
    var currentDay = now.getDate();
    var scheduleIndex = 0;
    
    while (!nextRaceEvent && scheduleIndex < schedule.length) {
      var currentEvent = schedule[scheduleIndex];
      var raceEventDays = extractRaceEventDates(currentEvent, year);
      var eventYear =  raceEventDays[0].getFullYear();      
      var eventMonth = raceEventDays[0].getMonth();

      // event is in a month that's in the past OR
      // event is this month, but is on a day that's in the past
      if (eventMonth < currentMonth || (eventMonth === currentMonth && raceEventDays.every(day => day.getDate() < currentDay))) {
        scheduleIndex++;
        continue;
      }

      // otherwise, this is the next event!
      nextRaceEvent = currentEvent;
    }
  }

  return nextRaceEvent;
}

// it's race day! put the pertinent info front and center
function populateRaceDayContent(block) {
  var schedule = nextRaceEvent["eventSchedule"];
  var textContainer = $(block).children(".hero-announcement-text");
  var circuitInfoButton = $("<a>").addClass("hero-announcement-button").attr("href", nextRaceEvent.locationLink).attr("target", "_blank").text("Circuit Info");
  var scheduleUrl = schedule.startsWith("http") ? schedule : `${window.location.origin}${schedule}`;
  var scheduleButton = $("<a>").addClass("hero-announcement-button").attr("href", scheduleUrl).attr("target", "_blank").text("Event Schedule");

  textContainer.append($("<h2>").text(`Round ${nextRaceEvent.round} at ${nextRaceEvent.location}`))
  textContainer.siblings(".race-day-button-wrapper").append(scheduleButton);
  textContainer.siblings(".race-day-button-wrapper").append(circuitInfoButton);
}

// if there is an upcoming race event, we'll show a countdown clock
function populateNextRaceEventContent(block) {
  var textContainer = $(block).children(".hero-announcement-text");
  var eventStartDate = nextRaceEventDays[0];

  textContainer.append($("<h2>").text(`${nextRaceEvent.date} at ${nextRaceEvent.location}`));

  // if next race event Date object isn't valid, we can bail out before adding the countdown
  if (!eventStartDate instanceof Date || isNaN(eventStartDate)) {
    return;
  }

  // populate the countdown clock immediately, 
  // then start updating every second (otherwise it is momentarily invisible)
  var eventTime = eventStartDate.getTime();
  var countdownContainer = buildCountdownContainerHtml();
  textContainer.append(countdownContainer);
  calculateNextCountdownTime(eventTime, countdownContainer);
  setInterval(function() {
    calculateNextCountdownTime(eventTime, countdownContainer);
  }, 1000);
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
// return format: [ "05/17/<current-year>", "05/18/<current-year>" ]
function extractRaceEventDates(raceEvent, year) {
  if (!raceEvent) {
    return [];
  }

  var eventDateParts = raceEvent.date.split(" ");
  var month = getMonthNumber(eventDateParts[0]);
  var startAndEndDays = eventDateParts[1].split("-").map(dayString => parseInt(dayString));

  // total days of event: start + end + all days between
  // if the event is longer than 2 days, we need to add
  // the days between
  var startDate = startAndEndDays[0];
  var endDate = startAndEndDays[1];
  var eventDays = startAndEndDays;
  
  if (endDate - startDate > 1) {
    // trick for building an " x-to-y range" array:
    // build an array the length of the range
    // populate with the index values offset by the range start
    eventDays = [...Array(endDate - startDate + 1).keys()].map(index => index + startDate);
  }

  // Javascript months are NOT ZERO-INDEXED when you're trying to make a date (╯°□°)╯︵ ┻━┻
  // also, if you don't put the slashes in the date, Safari cries about it
  return eventDays.map(day => new Date(`${month + 1}/${day}/${year}`));
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
// also, months in Javascript are zero-indexed, so ¯\_(ツ)_/¯
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
  if ($(".home-content-wrapper").length > 0) {
    selectHeroImage();
    displayHeroContent();
  }
});