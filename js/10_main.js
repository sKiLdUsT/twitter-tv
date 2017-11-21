/* global particlesJS */
/* eslint-env browser */
/* eslint-disable no-undef */

switch (window.location.pathname) {
  case '/':
    document.addEventListener('DOMContentLoaded', () => {
      getTweets(displayData)
      setInterval(() => {
        getTweets(displayData)
      }, 300000)
    })
    document.addEventListener('AppReady', () => {
      updateLoader(2)
      particlesJS.load('particles-js', 'assets/particles.json', () => {})
      document.getElementsByClassName('loader')[0].classList.add('lHide')
    })
    break
  default:
    document.getElementById('lProgress').style.display = 'none'
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementsByClassName('loader')[0].classList.add('lHide')
    })
    break
}
