onload = function () {
  var pageHeader = document.querySelector('.js-page-header'),
      pageHeaderLogo = pageHeader.querySelector('page-header__logo'),
      nav = document.querySelector('.js-nav'),
      // $TODO - change to all internal links???
      navLinks = nav.querySelectorAll('a'),
      navToggleBtn = document.querySelector('.js-nav-toggle'),

      // page state...yikes!
      currentScrollY = 0,
      previousScrollY,
      ticking = false,
      navIsOpen = nav.classList.contains('is-open'),
      currentSection = {},
      activeTargetOffset = 75,
      targetConfig = {
        bookmarks: updateSectionOffsetList(navLinks),
        offset: activeTargetOffset
      }

  // make sure copyright is always up-to-date
  // $TODO - create setCopyrightDate(el) function for better clarity
  document.querySelector('#copyright-date')
    .innerText = (new Date()).getFullYear()



  /* EVENTS *******************************************************************/

  pageHeader.addEventListener('click', function handlePageHeaderClick (e) {
    // $TODO - should only prevent default is the link is internal
    e.preventDefault()

    const linkEl = getNearestLinkAncestor(e.target),
          bookmarks = targetConfig.bookmarks, // Array{id:String, element:HTMLElement}
          offset = targetConfig.offset

    if (linkEl.isEqualNode(navToggleBtn)) {
      toggleNavOpenClass()
    }

    // something screwy here when the URL has a hash... (ex. localhost:3000#experience)
    // target is always expereience link for whatever reason
    else if (linkEl !== undefined) {
      const bookmark = findInArray(bookmarks, function(target) {
        return target.id === linkEl.hash
      })

      scrollToBookmark(bookmark.id, offset)

      if ( navIsOpen ) {
        toggleNavOpenClass()
      }
    }
  }, false)

  nav.addEventListener('transitionend', function handleNavTransitionEnd (e) {
    pageHeader.classList.remove('is-transitioning')
  }, false)

  window.addEventListener('scroll', onScroll, false)

  /* END EVENTS ***************************************************************/



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
  function toggleNavOpenClass () {
    if (navIsOpen) {
      pageHeader.classList.remove('is-open')
      pageHeader.classList.add('is-transitioning')
      navIsOpen = false
    }
    else {
      pageHeader.classList.add('is-open')
      pageHeader.classList.add('is-transitioning')
      navIsOpen = true
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
  function onScroll () {
    previousScrollY = currentScrollY
    currentScrollY = window.scrollY
    requestTick()
  }

  /*
   * requestTick
   */
  function requestTick () {
    if (!ticking) {
      requestAnimationFrame(function handleScroll () {
        // all scroll-related functions go here
        togglePageHeaderPastOffsetClass()
        detectActiveTargetAndAdjustStyle(targetConfig)

        // after executing the code, we reset ticking state
        ticking = false
      })
    }

    // while waiting for an animation frame, set ticking state to true
    ticking = true
  }

  /*
   * togglePageHeaderPastOffsetClass
   */
  function togglePageHeaderPastOffsetClass () {
    const changeInScrollPos = previousScrollY - currentScrollY,
          triggerThreshold = 5,
          offset = pageHeader.offsetHeight

    // well, this _could_ use toggle, but IE doesn't support the 2nd argument
    if (currentScrollY > offset) {
      pageHeader.classList.add('is-past-offset')
    }
    else if (currentScrollY <= offset) {
      pageHeader.classList.remove('is-past-offset')
    }
  }

  /*
   * getNearestLinkAncestor
   */
  function getNearestLinkAncestor(el) {
    if (isLink(el)) {
      return el
    }
    else if (el.parentNode) {
      return getNearestLinkAncestor(el.parentNode)
    }
    else {
      return undefined
    }

    function isLink (element) {
      return element.nodeName && element.nodeName === 'A'
    }
  }

  /*
   * detectActiveTargetAndAdjustStyle
   *
   * Adds the active class to the appropriate nav link according to the scroll
   * position of the window.
   *
   * params:Object -> void
   *
   * params properties
   * ---------------------------------------------------------------------------
   * bookmarks:Array<{id:String, element:HTMLElement}>
   * offset:Number
   */
  function detectActiveTargetAndAdjustStyle ( params ) {
    params = params || {}
    const bookmarks = params.bookmarks || [],
          offset = params.offset || 0
    
    var currentTarget = bookmarks[0] || {}

    for (var i = 0, l = bookmarks.length; i < l; i++) {
      var target = bookmarks[i]

      if ( currentScrollY + offset >= target.element.offsetTop ) {
        currentTarget = target
      }
    }

    currentSection = currentTarget.id === currentSection.id ? currentSection : currentTarget

    makeTargetLinkActive(currentSection.id)

    function makeTargetLinkActive (targetId) {
      var activeLink
      navLinks.forEach(function clearAllActive (link) {
        if (link.classList.contains('is-active')) {
          link.classList.remove('is-active')
        }
        if (link.hash === targetId) {
          activeLink = link
        }
      })

      if (activeLink) {
        activeLink.classList.add('is-active')
      }
    }
  }
  // kick off to do initial select
  detectActiveTargetAndAdjustStyle(targetConfig)

  /*
   * createSectionOffsetMap
   *
   * Takes a list of elements and builds a map of each section and its offset for use
   * in scrollToBookmark.
   */
  function updateSectionOffsetList (list) {
    var offsetList = []

    list.forEach(function registerSectionOffset (link) {
      if (link.href.indexOf(location.href) === 0) {
        var el = document.querySelector(link.hash)
        offsetList.push({
          id: link.hash,
          element: el
        })
      }
    })

    return offsetList
  }

  /*
   * scrollToBookmark
   *
   * bookmark:String
   */
  function scrollToBookmark (bookmark, offset) {
    offset = offset || 0
    var element = document.querySelector(bookmark),
        scrollTop = getOffsetTop(element) - offset
    // $TODO - support history? there is a problem with having a hash in the url
    window.scroll(0, scrollTop)
  }

  function findInArray (arr, check) {
    if (!Array.isArray(arr)) {
      throw new Error('Expected an array for first argument.')
    }
    if (typeof check !== 'function') {
      throw new Error('Expected a function for second argument.')
    }

    const length = arr.length
    var i = 0
    // while there's still length in the array and the check is false
    
    while (i < length) {
      if ( check(arr[i]) ) {
        return arr[i]
      }
      i++
    }

    return undefined;
  }

  function getOffsetTop (node) {
    var offsetTop = node.offsetTop
    while (node.offsetParent) {
      node = node.offsetParent
      offsetTop += node.offsetTop
    }
    return offsetTop
  }
}