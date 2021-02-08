var submenuActive = false;
var submenuTimeout = null;

function activateHeaderMenu() {
  $(".header-menu > .header-menu-item").hover(function() {
    clearTimeout(submenuTimeout);
    $(".header-menu-item-submenu").hide();
    var submenu = $(this).children(".header-menu-item-label").children(".header-menu-item-submenu");
    showSubmenu(submenu);
  }, function() {
    hideSubmenuIfInactive($(this).children(".header-menu-item-submenu").children(".header-menu-item-submenu"));
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
      $(submenu).css("left", "-10px");
    }
  }, 500);
}

function showSubmenu(submenu) {
  // if the menu is going to be off screen, we'll nudge it to the left
  var menu = $(submenu);

  // so gross, but we need to show the menu ever so 
  // briefly to figure out where it is; the screen
  // shouldn't repaint during this time, so users
  // won't see a flicker (according to the internet)
  menu.show()
  var menuLeft = menu.offset().left;
  menu.hide()
  
  var menuWidth = menu.outerWidth();
  var windowWidth = $(window).width();
  var menuRight = menuLeft + menuWidth;

  if (menuRight > windowWidth) {
    var newLeft = ((menuRight - windowWidth)  * -1) - 15;
    menu.css("left", `${newLeft}px`);
  }

  menu.show();
}

$(document).ready(function() {
  activateHeaderMenu();
});