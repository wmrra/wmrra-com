const SCHEDULE_TABLE_CELLS = [
  { className: "round", key: "round" },
  { className: "date", key: "date" },
  { className: "location", key: "location" },
  { className: "day-schedule", key: "eventSchedule" },
  { className: "joint-round", key: "jointRound" },
];

function displayCurrentSchedule() {
  const scheduleSection = $(".home-content-section.homepage-schedule");
  const scheduleData = scheduleSection?.data("schedule") ?? {};
  const [scheduleToDisplay, scheduleYear] = pickScheduleToDisplay(scheduleData);

  // probably means there's no schedule data
  // just drop the schedule section off the page
  if (scheduleToDisplay == null) {
    if (scheduleSection.length > 0) {
      scheduleSection.remove();
    }
    return;
  }

  // remove the data attr to hide our sins
  scheduleSection.removeAttr("data-schedule");

  // add the year in the header
  scheduleSection.find(".home-content-section-header").find("#current-year").text(scheduleYear);

  // add the event rows to the schedule table
  const scheduleTable = scheduleSection.find(".schedule-table");
  const jointRoundIcon = $("<i>").addClass("fas fa-check-circle joint-round-icon").attr({"aria-hidden": true, "title": "Joint round with OMRRA" });
  const jointRoundText = $("<span>").addClass("joint-round-text").text("Joint round with OMRRA");
  
  for (const raceEventData of scheduleToDisplay) {
    const scheduleRow = $("<div>").addClass("schedule-table-row");
    for (const cellData of SCHEDULE_TABLE_CELLS) {
      const { className, key } = cellData;
      const cellElement = $("<div>").addClass(`schedule-table-cell ${className}`);
      const cellContents = raceEventData[key];
      if (cellContents) {
        switch(key) {
          case "round":
            cellElement.text(`Round ${cellContents}`);
            break;
          case "eventSchedule":
            const scheduleLink = $("<a>").attr({ href: cellContents, target: "_blank"});
            cellElement.append(scheduleLink);
            break;
          case "jointRound":
            cellElement.append(jointRoundIcon.clone());
            cellElement.append(jointRoundText.clone());
            break;
          default:
            cellElement.text(cellContents);
            break;
        }
      }
      scheduleRow.append(cellElement);     
    }
    scheduleTable.append(scheduleRow);
  }

  scheduleSection.removeClass("loading");
}

function pickScheduleToDisplay(scheduleData) {
  const currentYear = new Date().getFullYear();
  const [previousYear, nextYear] = [currentYear -1, currentYear + 1];
  if (scheduleData[nextYear]){
    return [scheduleData[nextYear], nextYear];
  } else if (scheduleData[currentYear]) {
    return [scheduleData[currentYear], currentYear];
  } else {
    return [scheduleData[previousYear], previousYear];
  }
}

$(document).ready(function() {
  if ($(".home-content-section.homepage-schedule").length > 0) {
    displayCurrentSchedule();
  }
});