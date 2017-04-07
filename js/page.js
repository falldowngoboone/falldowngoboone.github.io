onload = function () {
  var pageHeader = document.querySelector('.js-page-header'),
      nav = document.querySelector('.js-nav'),
      navToggleBtn = document.querySelector('.js-nav-toggle'),
      headerOffset = document.querySelector('[data-header-offset]'),

      currentScrollY = 0,
      previousScrollY,
      ticking = false,
      navIsOpen = nav.classList.contains('is-open'),
      keepHeaderOpen = false

  // make sure copyright is always up-to-date
  document.querySelector('#copyright-date')
    .innerText = (new Date()).getFullYear()

  // event listeners
  pageHeader.addEventListener('click', function closeMenuOnLinkClick (e) {
    if (e.target.isEqualNode(navToggleBtn) || e.target.parentElement.isEqualNode(navToggleBtn)) {
      e.preventDefault()
    }
    if (e.target.nodeName === 'A' || e.target.parentElement.nodeName === 'A' ) {
      toggleNavOpenClass()
    }
  }, false)

  nav.addEventListener('transitionend', function removeTransitionClass (e) {
    pageHeader.classList.remove('is-transitioning')
  }, false)

  window.addEventListener('scroll', onScroll, false)

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

  function onScroll (e) {
    previousScrollY = currentScrollY
    currentScrollY = window.scrollY
    requestTick()
  }

  function requestTick () {
    if (!ticking) {
      requestAnimationFrame(togglePageHeaderHideClass)
    }
    ticking = true
  }

  function togglePageHeaderHideClass () {
    const changeInScrollPos = previousScrollY - currentScrollY,
          triggerThreshold = 5,
          offset = 0

    ticking = false

    // well, this _could_ use toggle, but IE doesn't support the 2nd argument
    if (currentScrollY > offset) {
      pageHeader.classList.add('is-past-offset')
    }
    else if (currentScrollY <= offset) {
      pageHeader.classList.remove('is-past-offset')
    }
  }
}