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
    heroBlocks.not(blockToShow).remove();
    $(blockToShow).addClass("the-chosen-one");
  }
}

function shouldShowBlock(block) {
  switch ($(block).attr("id")) {
    case "latest-announcement":
      return shouldShowLatestAnnouncement(block)
    case "default":
      return true;
    default:
      return false;
  }
}

function shouldShowLatestAnnouncement(latestAnnouncement) {
  var dateData = $(latestAnnouncement).data("date");

  if (!dateData) {
    return false;
  }

  var announcementDate = new Date(dateData)
  var daysSinceAnnouncement = Math.floor(((new Date() - announcementDate) / 1000) / (60 * 60 *24));

  return daysSinceAnnouncement <= 10;
}

$(document).ready(function() {
  displayHeroContent();
});