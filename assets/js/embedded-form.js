$(document).ready(function() {
  $("#embedded-form-iframe").on("load", function() {
    $(".embedded-form-loading").remove();
    $(this).css("visibility", "visible");

    var height = $(this).data("height") ?? "1600"
    $(this).height(`${height}px`);
  });
});
