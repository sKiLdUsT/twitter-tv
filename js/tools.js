/* eslint-env browser */
/* eslint-disable no-unused-vars */

let rTweets
let worker = new Worker('/assets/worker.js')
let iBig
let iPro
let uPro
let bSeq = 0
let tCache = {}

module.exports = {
	getTweets,
	displayData,
	displayBig,
	updateLoader
}

function getTweets (callback) {
	updateLoader(0)
	let request = new XMLHttpRequest()
	request.open('GET', '/api/pull', true)
	request.onload = () => {
		if (request.status >= 200 && request.status < 400) {
		try {
			callback(JSON.parse(request.responseText))
		} catch (e) {
			updateLoader(-1)
			throw e
		}
		} else {
		updateLoader(-1)
		}
	}
	request.onerror = () => {
		updateLoader(-1)
	}
	request.send()
}

function displayData (data) {
  if (window.Worker) {
    worker.postMessage({
      action: 'digestTweets',
      data
    })
    worker.onmessage = e => {
      switch (e.data.origin) {
        case 'digestTweets':
          worker.postMessage({
            action: 'renderTweets',
            data: e.data.data
          })
          break
        case 'renderTweets':
          rTweets = e.data.data
          if (!iBig) {
            iBig = setInterval(displayBig, 10000)
            displayBig()
          }
          setTimeout(() => {
            let event = document.createEvent('Event')
            event.initEvent('AppReady', true, true)
            document.dispatchEvent(event)
          }, 2000)
          break
        case 'pullLinkPreview':
          updateLoader(e.data.data[0], e.data.data[1])
          break
      }
    }
  } else {
    alert('Your browser is outdated!')
    window.location = 'https://outdatedbrowser.com'
  }
}

function displayBig () {
  if (bSeq === 30) {
    tCache = {}
    bSeq = 0
  }
  let trend = Object.keys(rTweets)[Math.floor(Math.random() * Object.keys(rTweets).length)]
  while (trend in tCache && tCache[trend].length === rTweets[trend].length) {
    trend = Object.keys(rTweets)[Math.floor(Math.random() * Object.keys(rTweets).length)]
  }
  if (tCache[trend] === undefined) tCache[trend] = []
  let tweet = rTweets[trend][Math.floor(Math.random() * rTweets[trend].length)]
  while (tCache[trend].indexOf(tweet) !== -1) {
    tweet = rTweets[trend][Math.floor(Math.random() * rTweets[trend].length)]
  }
  tCache[trend].push(tweet)
  document.querySelectorAll('div.bigTweet')[0].classList.add('inv')
  setTimeout(() => {
    document.querySelectorAll('div.bigTweet')[0].innerHTML = tweet
    document.querySelectorAll('div.bigTweet')[0].classList.remove('inv')
  }, 300)
  bSeq++
}

function updateLoader (state, from) {
  let elm = document.querySelectorAll('#lProgress > .slider')[0]
  switch (state) {
    case 0:
      uPro = 0
      iPro = setInterval(() => {
        if (uPro !== 25) uPro = uPro + 1.5
        elm.style.width = uPro + '%'
      }, 1000)
      break
    case 1:
      clearInterval(iPro)
      if (uPro < 25) uPro = 25
      uPro = uPro + (((1 / from) * 0.75) * 100)
      elm.style.width = uPro + '%'
      break
    case 2:
      elm.style.width = '100%'
      break
    case -1:
      if (iPro) clearInterval(iPro)
      elm.style.backgroundColor = '#E64725'
      break
  }
}
