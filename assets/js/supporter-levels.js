function activateModalLinks() {
  var supporterLevelModal = $(".supporter-level-benefits-modal");
  $(".see-all-benefits-link").click(function(event) {
    event.preventDefault();
    
    var contentId = $(this).data("level-id");
    $(".modal-overlay").removeClass("hidden");
    $("html, body").addClass("modal-open");
    supporterLevelModal.show();
    supporterLevelModal.children(`#${contentId}`).removeClass("hidden");
  });

  supporterLevelModal.children(".modal-close-icon").click(function(){
    supporterLevelModal.children(".benefits-modal-content:visible").addClass("hidden");
    supporterLevelModal.hide();
    $(".modal-overlay").addClass("hidden");
    $("html, body").removeClass("modal-open");
  });
}

$(document).ready(function() {
  activateModalLinks();
});