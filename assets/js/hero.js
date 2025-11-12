// cache some stuff about upcoming race events 
// so we don't have to continually look it up
var nextRaceEvent = null;
var nextRaceEventDays = null;

// precedence order for hero blocks (i.e. which should show first)
// if you add a new hero block, ADD THE ID TO THIS LIST
const ORDERED_HERO_BLOCK_IDS = ["race-day", "latest-announcement", "next-race-event", "default"]

function selectHeroImage() {
  const homeContent = $(".home-content-wrapper")
  const images = homeContent.data("images");
  const imageIndex =  Math.floor(Math.random() * images.length);
  const heroImageData = images[imageIndex];

  if (heroImageData.shift) {
    homeContent.children(".hero").addClass("shift-align");
  }

  const heroImageStyle = $("<style>").html(`.hero::after{ background-image: url(${window.location.origin}/images/hero/${heroImageData.filename}) };`);
  $("head").append(heroImageStyle);

  homeContent.removeAttr("data-images");
}

function displayHeroContent() {
  let blockToShow;
  const heroBlocks = $(".hero-announcement-content-block");
  const raceEventYear = heroBlocks.filter("#next-race-event")?.data("year");
  const raceSchedule = heroBlocks.filter("#next-race-event")?.data("schedule");
  nextRaceEvent = getNextRaceEvent(raceSchedule, raceEventYear);
  nextRaceEventDays = extractRaceEventDates(nextRaceEvent, raceEventYear);

  for (const blockId of ORDERED_HERO_BLOCK_IDS) {
    const block = heroBlocks.filter(`#${blockId}`);
    if (shouldShowBlock(block)) {
      blockToShow = block;
      break;
    }
  }

  if (!blockToShow){
    blockToShow = heroBlocks.filter(`#default`);
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
  const featureUntilData = $(latestAnnouncementBlock).data("feature-until");

  if (!featureUntilData) {
    return false;
  }

  // appending T00:00:00 will treat this as "midnight" of the featured day, local time
  return new Date(`${featureUntilData}T00:00:00`) > new Date();
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
    let now = new Date();
    if (now.getFullYear() != year){
      // If the next season is in the following year, figure out the first
      // event by using Jan 1, next-year, as 'now'
      // TODO: could change date math to account for year also, though this has
      // the same effect
      now = new Date(year,1,1);
    }
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const scheduleIndex = 0;
    
    while (!nextRaceEvent && scheduleIndex < schedule.length) {
      const currentEvent = schedule[scheduleIndex];
      const raceEventDays = extractRaceEventDates(currentEvent, year);     
      const eventMonth = raceEventDays[0].getMonth();

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
  const schedule = nextRaceEvent["eventSchedule"];
  const textContainer = $(block).children(".hero-announcement-text");
  const circuitInfoButton = $("<a>").addClass("hero-announcement-button").attr("href", nextRaceEvent.locationLink).attr("target", "_blank").attr("rel", "noreferrer").text("Circuit Info");
  const scheduleUrl = schedule.startsWith("http") ? schedule : `${window.location.origin}${schedule}`;
  const scheduleButton = $("<a>").addClass("hero-announcement-button").attr("href", scheduleUrl).attr("target", "_blank").text("Event Schedule");

  textContainer.append($("<h2>").text(`Round ${nextRaceEvent.round} at ${nextRaceEvent.location}`))
  textContainer.siblings(".race-day-button-wrapper").append(scheduleButton);
  textContainer.siblings(".race-day-button-wrapper").append(circuitInfoButton);
}

// if there is an upcoming race event, we'll show a countdown clock
function populateNextRaceEventContent(block) {
  const textContainer = $(block).children(".hero-announcement-text");
  const eventStartDate = nextRaceEventDays[0];

  textContainer.append($("<h2>").text(`${nextRaceEvent.date} at ${nextRaceEvent.location}`));

  // if next race event Date object isn't valid, we can bail out before adding the countdown
  if (!eventStartDate instanceof Date || isNaN(eventStartDate)) {
    return;
  }

  // populate the countdown clock immediately, 
  // then start updating every second (otherwise it is momentarily invisible)
  const eventTime = eventStartDate.getTime();
  const countdownContainer = buildCountdownContainerHtml();
  textContainer.append(countdownContainer);
  calculateNextCountdownTime(eventTime, countdownContainer);
  setInterval(function() {
    calculateNextCountdownTime(eventTime, countdownContainer);
  }, 1000);
}

// https://www.w3schools.com/howto/howto_js_countdown.asp
function calculateNextCountdownTime(eventTime, countdownContainer) {
  const nowTime = new Date().getTime();
  const distance = eventTime - nowTime;

  // time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

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
  const countdownContainer = $("<h1>").attr("id", "race-countdown-clock");

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

// returns a list of Date objects representing all the dates of a race event
function extractRaceEventDates(raceEvent, year) {
  if (!raceEvent) {
    return [];
  }

  // race schedule data now stores startDate and endDate with the format "MM/DD/YYYY"
  const startDate = new Date(raceEvent.startDate);
  const endDate = new Date(raceEvent.endDate);

  // fill any days between the start and end
  let currentDate = startDate;
  const eventDates = [];

  while (currentDate <= endDate) {
    eventDates.push(currentDate);

    // lol this is how you increment the day by 1 in Javascript (╯°□°)╯︵ ┻━┻
    const nextDate = new Date(currentDate)
    currentDate = new Date(nextDate.setDate(nextDate.getDate() + 1));
  }

  return eventDates;
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

$(document).ready(function() {
  if ($(".home-content-wrapper").length > 0) {
    selectHeroImage();
    displayHeroContent();
  }
});