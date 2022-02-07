// HEADER MENUS
var submenuActive = false;
var submenuTimeout = null;

function activateHeaderMenu() {
  $(".header-menu > .header-menu-item").hover(function() {
    clearTimeout(submenuTimeout);
    $(".header-menu-item-submenu").hide();
    var submenu = $(this).children(".header-menu-item-label").children(".header-menu-item-submenu");
    showSubmenu(submenu);
  }, function() {
    hideSubmenuIfInactive($(this).children(".header-menu-item-label").children(".header-menu-item-submenu"));
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
      $(submenu).css("left", "-0.5rem");
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
    var newLeft = (((menuRight - windowWidth)  * -1) - 15) / 10;
    menu.css("left", `${newLeft}rem`);
  }

  menu.show();
}

// TODO: get some separate JS files
// MOBILE MENU
var resizeDebounce = null;
const MOBILE_BREAKPOINT = 768;
function activateMobileMenu() {
  $(window).resize(function() {
    if (resizeDebounce) {
      clearTimeout(resizeDebounce);
    }
    resizeDebounce = setTimeout(function() { 
      var windowWidth = $(window).width();
      if (windowWidth >= MOBILE_BREAKPOINT) {
        $(".header-menu-mobile-overlay").addClass("hidden");
        $("html, body").removeClass("modal-open");
        $(".header-menu-mobile-content").addClass("hidden");
        $(".header-menu-mobile").children(".menu-icon").show();
        $(".header-menu-mobile").children(".menu-close-icon").hide();
      }
    }, 100)
  });


  $(".header-menu-mobile").children(".menu-icon").click(function() {
    $(this).hide();
    $(this).siblings(".menu-close-icon").show();
    $(".header-menu-mobile-overlay").removeClass("hidden");
    $("html, body").addClass("modal-open");
    $(this).siblings(".header-menu-mobile-content.main").removeClass("hidden");
  });

  $(".header-menu-mobile").children(".menu-close-icon").click(function() {
    $(this).hide();
    $(this).siblings(".menu-icon").show();
    $(this).siblings(".header-menu-mobile-content").addClass("hidden");
    $("html, body").removeClass("modal-open");
    $(".header-menu-mobile-overlay").addClass("hidden");
  });

  $(".mobile-menu-link.main").click(function() {
    var submenuName = $(this).text().toLowerCase().trim();
    $(this).parents(".header-menu-mobile-content.main").addClass("hidden");
    $(`.header-menu-mobile-content.submenu.${submenuName}`).removeClass("hidden");
  });

  $(".header-menu-mobile-content").children(".go_back").click(function() {
    $(this).parent().addClass("hidden");
    $(".header-menu-mobile-content.main").removeClass("hidden");
  });
}

function activateSlidingDrawers() {
  const drawers = $(".sliding-drawer-header");

  if (drawers.length > 0) {
    drawers.click(function() {
      $(this).parent(".sliding-drawer").toggleClass("is-open");
    })
  }
}

$(document).ready(function() {
  activateHeaderMenu();
  activateMobileMenu();
  activateSlidingDrawers();
});