onload = function () {
  // js class for styles relying on js functionality
  document.documentElement.classList.add('js')

  // make sure copyright is always up-to-date
  document.querySelector('#copyright-date')
    .innerText = (new Date()).getFullYear()
}