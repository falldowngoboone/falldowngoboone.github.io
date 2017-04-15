onload = function () {
  var pageHeader = document.querySelector('.js-page-header'),
      pageHeaderLogo = pageHeader.querySelector('page-header__logo'),
      nav = document.querySelector('.js-nav'),
      // $TODO - change to all internal links???
      navLinks = nav.querySelectorAll('a'),
      bookmarks = document.querySelectorAll('a[rel="bookmark"]'),
      navToggleBtn = document.querySelector('.js-nav-toggle'),

      // page state...yikes!
      currentScrollY = 0,
      previousScrollY,
      ticking = false,
      navIsOpen = nav.classList.contains('is-open'),
      currentSection = {},
      activeTargetOffset = 75,
      bookmarkIds = ['#about', '#experience', '#projects', '#education', '#contact'],
      offsetMap = createOffsetMap(bookmarkIds)


  document.querySelector('#copyright-date')
    .innerText = (new Date()).getFullYear()


  /* EVENTS *******************************************************************/

  pageHeader.addEventListener('click', function handlePageHeaderClick (e) {

    const linkEl = getNearestLinkAncestor(e.target)

    if (linkEl === undefined || 
        linkEl.origin + linkEl.pathname !== window.location.origin + window.location.pathname) {
      return
    }
    else if (linkEl.isEqualNode(navToggleBtn)) {
      toggleNavOpenClass()
    }
    // something screwy here when the URL has a hash... (ex. localhost:3000#experience)
    // target is always expereience link for whatever reason
    else {
      const bookmark = findInArray(bookmarks, function(b) {
        return b.id === linkEl.hash.slice(1)
      })

      window.scroll(0, getOffsetTop(bookmark) - activeTargetOffset)

      if ( navIsOpen ) {
        toggleNavOpenClass()
      }
    }

    e.preventDefault()
  }, false)

  nav.addEventListener('transitionend', function handleNavTransitionEnd (e) {
    pageHeader.classList.remove('is-transitioning')
  }, false)

  window.addEventListener('scroll', onScroll, false)
  window.addEventListener('resize', function updateOffsetMap () {
    offsetMap = createOffsetMap(bookmarkIds)
  })

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
        toggleClassPastOffset()
        makeCurrentLinkActive()

        // after executing the code, we reset ticking state
        ticking = false
      })
    }

    // while waiting for an animation frame, set ticking state to true
    ticking = true
  }

  /*
   * toggleClassPastOffset
   */
   // $TODO - pass in the node? and the class name? and the threshold?
   // probably just pass in an entire config object
  function toggleClassPastOffset () {
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
    if (el.nodeName && el.nodeName === 'A') {
      return el
    }
    else if (el.parentNode) {
      return getNearestLinkAncestor(el.parentNode)
    }
    else {
      return undefined
    }
  }

  /*
   * makeCurrentLinkActive
   *
   * links:NodeList -> void
   */
   // $TODO - possibly a config object?
  function makeCurrentLinkActive () {
    const activeThreshold = currentScrollY + activeTargetOffset,
          ids = offsetMap.ids || [], values = offsetMap.values || {}

    var i = 0, y = 0,
        activeBookmark

    while (ids[i] && values[ids[i]] <= activeThreshold) {
      activeBookmark = ids[i]
      i++
    }

    toggleActiveLink(activeBookmark)
  }

  function toggleActiveLink (targetId) {
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

  function createOffsetMap (ids) {
    return {
      ids: ids,
      values: ids.reduce(function (map, id) {
        var offset = getOffsetTop( document.querySelector(id) )
        map[id] = offset
        return map
      }, {})
    }
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
    document.documentElement.scrollTop = scrollTop
  }

  function findInArray (arr, check) {
    // if (!Array.isArray(arr)) {
    //   throw new Error('Expected an array for first argument.')
    // }
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

  /*
   * getOffsetTop
   */
  function getOffsetTop (node) {
    var offsetTop = node.offsetTop
    while (node.offsetParent) {
      node = node.offsetParent
      offsetTop += node.offsetTop
    }
    return offsetTop
  }

  /*
   * getOffsetLeft
   */
  function getOffsetLeft (node) {
    var offsetLeft = node.offsetLeft
    while (node.offsetParent) {
      node = node.offsetParent
      offsetLeft += node.offsetLeft
    }
    return offsetLeft
  }
}