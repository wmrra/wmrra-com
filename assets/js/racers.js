function activateRacerSearch() {
  var searchTerm = "";
  var racerContainer = $(".racers-wrapper");
  var racers = $(".racer-flipper-container");

  $(".racer-search-input").keyup(function() {
    searchTerm = $(this).val();

    var matches = racers.filter(function() {
      var racer = $(this);
      var normalizedSearchTerm = searchTerm.toLowerCase();
      var normalizedName = racer.attr("data-name").toLowerCase();
      var number = racer.attr("data-number");
      return normalizedName.includes(normalizedSearchTerm) || number.includes(normalizedSearchTerm);
    });

    if (searchTerm.length > 0) {
      racerContainer.addClass("search-results");
      matches.removeClass("hidden").removeClass("fancy");
      racers.not(matches).addClass("hidden");
    } else {
      racerContainer.removeClass("search-results");
      racers.addClass("fancy").removeClass("hidden");
    }

  })
}


$(document).ready(function() {
  if ($(".racers-wrapper").length > 0) {
    activateRacerSearch();
  }
});