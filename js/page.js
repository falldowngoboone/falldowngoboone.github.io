onload = function () {
  var pageHeader = document.querySelector('.js-page-header'),
      menuToggle = document.querySelector('.js-menu-toggle')

  // js class for styles relying on js functionality
  document.documentElement.classList.add('js')

  // make sure copyright is always up-to-date
  document.querySelector('#copyright-date')
    .innerText = (new Date()).getFullYear()

  menuToggle.addEventListener('click', toggleMenuOpen)
  pageHeader.addEventListener('click', function (e) {
    if (e.target.nodeName === 'A' ) {
      toggleMenuOpen()
    }
  })

  function toggleMenuOpen () {
    pageHeader.classList.contains('is-collapsed') ?
      pageHeader.classList.remove('is-collapsed') :
      pageHeader.classList.add('is-collapsed')
  }
}