// TODO: fix hovering so that you can actually get to a menu
function activateHeaderMenu() {
  $(".header-menu > .header-menu-item").hover(function() {
    $(this).children(".header-menu-item-submenu").show();
  }, function() {
    $(this).children(".header-menu-item-submenu").hide();
  });
}

$(document).ready(function() {
  activateHeaderMenu();
});