// js class for styles relying on JavaScript functionality
document.documentElement.classList.add('js')

// use ios class to get rid of pesky hover style persistence
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  document.documentElement.classList.add('ios')
}