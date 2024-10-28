$(document).ready(function() {
  $("#new-racer-form-iframe").on("load", function() {
    $(".new-racer-form-loading").remove();
    $(this).css("visibility", "visible");
    $(this).height("1600px");
  });
});
