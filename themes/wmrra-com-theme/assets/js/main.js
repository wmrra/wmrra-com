var submenuActive = false;
var submenuTimeout = null;

function activateHeaderMenu() {
  $(".header-menu > .header-menu-item").hover(function() {
    clearTimeout(submenuTimeout);
    $(".header-menu-item-submenu").hide();
    $(this).children(".header-menu-item-submenu").show();
  }, function() {
    hideSubmenuIfInactive($(this).children(".header-menu-item-submenu"));
  });

  $(".header-menu-item-submenu").hover(function() {
    clearTimeout(submenuTimeout);
    submenuActive = true;
  }, function() {
    submenuActive = false;
    hideSubmenuIfInactive(this);
  });
}

function hideSubmenuIfInactive(submenu) {
  submenuTimeout = setTimeout(function() {
    if(!submenuActive) {
      $(submenu).hide();
    }
  }, 500);
}

$(document).ready(function() {
  activateHeaderMenu();
});