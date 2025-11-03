function activateModalLinks() {
  $(".see-all-benefits-link").click(function(event) {
    event.preventDefault();

    $(".modal-overlay").removeClass("hidden");
    $("html, body").addClass("modal-open");
    $(this).siblings(".supporter-level-benefits-modal:first").show();
  });

  $(".modal-close-icon").click(function(){
    $(this).parent().hide();
    $(".modal-overlay").addClass("hidden");
    $("html, body").removeClass("modal-open");
  });
}

$(document).ready(function() {
  activateModalLinks();
});