/* global particlesJS */
/* eslint-env browser */
/* eslint-disable no-undef */

const tools = require('./tools')

switch (window.location.pathname) {
  case '/':
    document.addEventListener('DOMContentLoaded', () => {
      tools.getTweets(tools.displayData)
      setInterval(() => {
        tools.getTweets(tools.displayData)
      }, 300000)
    })
    document.addEventListener('AppReady', () => {
      tools.updateLoader(2)
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
