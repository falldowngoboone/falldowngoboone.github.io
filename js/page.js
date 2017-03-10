onload = function () {
  var pageHeader = document.querySelector('.js-page-header'),
      nav = document.querySelector('.js-nav'),
      navToggleBtn = document.querySelector('.js-nav-toggle'),
      headerOffset = document.querySelector('[data-header-offset]'),

      currentScrollY = 0,
      previousScrollY,
      ticking = false,
      navIsOpen = nav.classList.contains('is-open')

  // make sure copyright is always up-to-date
  document.querySelector('#copyright-date')
    .innerText = (new Date()).getFullYear()

  // event listeners
  navToggleBtn.addEventListener('click', toggleNavOpenClass)
  pageHeader.addEventListener('click', function closeMenuOnLinkClick (e) {
    if (e.target.nodeName === 'A' ) {
      toggleNavOpenClass()
    }
  })
  nav.addEventListener('transitionend', function removeTransitionClass (e) {
    pageHeader.classList.remove('is-transitioning')
    if (!navIsOpen) {
      pageHeader.classList.add('is-hidden')
    }
  })
  window.addEventListener('scroll', onScroll)

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
          offset = headerOffset.offsetTop

    ticking = false

    if (changeInScrollPos < -(triggerThreshold / 2) && currentScrollY > 0 && !navIsOpen) {
      pageHeader.classList.add('is-hidden')
    }
    else if (changeInScrollPos > triggerThreshold || window.scrollY <= 0) {
      pageHeader.classList.remove('is-hidden')
    }

    // well, this _could_ use toggle, but IE doesn't support the 2nd argument
    if (currentScrollY > offset) {
      pageHeader.classList.add('is-past-offset')
    }
    else if (currentScrollY <= offset) {
      pageHeader.classList.remove('is-past-offset')
    }
  }
}