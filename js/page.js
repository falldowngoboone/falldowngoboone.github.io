onload = function() {
  var pageHeader = document.querySelector(".js-page-header"),
    nav = document.querySelector(".js-nav"),
    navLinks = nav.querySelectorAll("a"),
    bookmarks = document.querySelectorAll('a[rel="bookmark"]'),
    navToggleBtn = document.querySelector(".js-nav-toggle"),
    // page state
    currentScrollY = 0,
    ticking = false,
    navIsOpen = nav.classList.contains("is-open"),
    activeTargetOffset = 75,
    bookmarkIds = ["#contact"],
    offsetMap = createOffsetMap(bookmarkIds);

  document.querySelector(
    "#copyright-date"
  ).innerText = new Date().getFullYear();

  pageHeader.addEventListener(
    "click",
    function handlePageHeaderClick(e) {
      const linkEl = getNearestLinkAncestor(e.target);

      if (
        linkEl === undefined ||
        linkEl.origin + linkEl.pathname !==
          window.location.origin + window.location.pathname
      ) {
        return;
      } else if (linkEl.isEqualNode(navToggleBtn)) {
        toggleNavOpenClass();
      } else {
        const bookmark = findInArray(bookmarks, function(b) {
          return b.id === linkEl.hash.slice(1);
        });

        try {
          window.scrollTo({
            left: 0,
            top: getOffsetTop(bookmark) - activeTargetOffset,
            behavior: "smooth"
          });
        } catch (e) {
          window.scroll(0, getOffsetTop(bookmark) - activeTargetOffset);
        }

        if (navIsOpen) {
          toggleNavOpenClass();
        }
      }

      e.preventDefault();
    },
    false
  );

  nav.addEventListener(
    "transitionend",
    function handleNavTransitionEnd(e) {
      pageHeader.classList.remove("is-transitioning");
    },
    false
  );

  window.addEventListener("scroll", onScroll, false);
  window.addEventListener("resize", function updateOffsetMap() {
    offsetMap = createOffsetMap(bookmarkIds);
  });

  /*
   * toggleNavOpenClass
   *
   * This is a simple helper function that manages navIsOpen state and handles
   * the open class for the nav and the transitioning class for the nav
   * animation. The `is-transitioning` class prevents any additional transitions
   * to take place while the nav is opening or closing. `is-transitioning` is
   * removed by the `transitionend` listener attached to the nav.
   *
   * $TODO - pass the element (`pageHeader`) and open state (`navIsOpen`) in as
   * arguments to make this a pure function.
   */
  function toggleNavOpenClass() {
    if (navIsOpen) {
      pageHeader.classList.remove("is-open");
      pageHeader.classList.add("is-transitioning");
      navIsOpen = false;
    } else {
      pageHeader.classList.add("is-open");
      pageHeader.classList.add("is-transitioning");
      navIsOpen = true;
    }
  }

  /*
   * onScroll
   *
   * called by the `scroll` listener, sets `previousScrollY` and
   * `currentScrollY` state, then calls `requestTick`
   *
   * any scroll related parameter updates should be first set in state, then
   * updated here
   */
  function onScroll() {
    previousScrollY = currentScrollY;
    currentScrollY = window.scrollY;
    requestTick();
  }

  /*
   * requestTick
   */
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(function handleScroll() {
        toggleClassPastOffset();
        makeCurrentLinkActive();

        ticking = false;
      });
    }

    ticking = true;
  }

  /*
   * toggleClassPastOffset
   */
  // $TODO - pass in the node? and the class name? and the threshold?
  // probably just pass in an entire config object
  function toggleClassPastOffset() {
    const offset = pageHeader.offsetHeight;

    // well, this _could_ use classList.toggle, but IE doesn't support the 2nd argument
    if (currentScrollY > offset) {
      pageHeader.classList.add("is-past-offset");
    } else if (currentScrollY <= offset) {
      pageHeader.classList.remove("is-past-offset");
    }
  }

  /*
   * getNearestLinkAncestor
   *
   * el:Element -> el:HTMLAnchorElement|undefined
   */
  function getNearestLinkAncestor(el) {
    if (el.nodeName && el.nodeName === "A") {
      return el;
    } else if (el.parentNode) {
      return getNearestLinkAncestor(el.parentNode);
    } else {
      return undefined;
    }
  }

  /*
   * makeCurrentLinkActive
   *
   * links:NodeList -> void
   */
  // $TODO - possibly a config object?
  function makeCurrentLinkActive() {
    const activeThreshold = currentScrollY + activeTargetOffset,
      ids = offsetMap.ids || [],
      values = offsetMap.values || {};

    var i = 0,
      y = 0,
      activeBookmark;

    while (ids[i] && values[ids[i]] <= activeThreshold) {
      activeBookmark = ids[i];
      i++;
    }

    toggleActiveLink(activeBookmark);
  }

  function toggleActiveLink(targetId) {
    var activeLink;
    navLinks.forEach(function clearAllActive(link) {
      if (link.classList.contains("is-active")) {
        link.classList.remove("is-active");
      }
      if (link.hash === targetId) {
        activeLink = link;
      }
    });

    if (activeLink) {
      activeLink.classList.add("is-active");
    }
  }

  /*
   * createOffsetMap
   *
   * ids:Array<String> -> offsetMap{ ids:Array<String>, values{ [id]:Number } }
   */
  function createOffsetMap(ids) {
    const offsetMap = {
      ids: ids,
      values: ids.reduce(function(map, id) {
        var offset = getOffsetTop(document.querySelector(id));
        map[id] = offset;
        return map;
      }, {})
    };

    return offsetMap;
  }

  /*
   * findInArray
   *
   * arr:Array<T>, check:Function -> result<T>
   */
  function findInArray(arr, check) {
    if (arr.length === undefined) {
      throw new Error("Expected an iterable for first argument.");
    }
    if (typeof check !== "function") {
      throw new Error("Expected a function for second argument.");
    }

    const length = arr.length;
    var i = 0;

    while (i < length) {
      if (check(arr[i])) {
        return arr[i];
      }
      i++;
    }

    return undefined;
  }

  /*
   * getOffsetTop
   *
   * node:Node -> offsetTop:Number
   */
  function getOffsetTop(node) {
    var offsetTop = node.offsetTop;
    while (node.offsetParent) {
      node = node.offsetParent;
      offsetTop += node.offsetTop;
    }
    return offsetTop;
  }
};
