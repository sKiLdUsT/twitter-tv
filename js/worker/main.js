/* eslint-env worker */
/* eslint-disable no-unused-vars */
/* global twemoji, twttr, moment */

onmessage = e => {
  postMessage(functions[e.data.action](e.data.data))
}

let count

let functions = {
	digestTweets,
	renderTweets,
	renderSingle,
	pullLinkPreview
}

const twemoji = require('./twemoji')
const twttr = require('./twitter-text')
const moment = require('./moment-with-locales')

function digestTweets (rawTweets) {
  let sorted = []
  count = 0
  for (let trend in rawTweets) {
    // skip loop if the property is from prototype
    if (!rawTweets.hasOwnProperty(trend)) continue
    // skip loop if empty
    if (rawTweets[trend].length === 0) continue

    let tweets = rawTweets[trend]
    let nTweets = []
    let c = 0
    tweets.forEach(tweet => {
      nTweets.push({
        'id': tweet.id_str,
        'created': moment(tweet.created_at, 'ddd MMM D HH:mm:ss Z gggg').format('H:mm - D MMM YYYY'),
        'user': '<img class="user" src="' + tweet.user.profile_image_url_https + '"><strong>' + twemoji.parse(tweet.user.name) + '</strong><p class="screenName">@' + tweet.user.screen_name + '</p>',
        'text': twemoji.parse(twttr.autoLink(tweet.full_text, {urlEntities: tweet.entities.urls, targetBlank: true})),
        'src': tweet,
        'entities': tweet.entities
      })
      if (tweet.entities !== undefined && tweet.entities.urls[0] !== undefined && tweet.entities.urls[0].expanded_url.match(/(twitter.com)/) === null) {
        c++
      }
    })
    count = count + c
    sorted[trend] = nTweets
  }
  return {
    origin: 'digestTweets',
    data: sorted
  }
}

function renderTweets (tweets) {
  let rendered = []
  for (let trend in tweets) {
    // skip loop if the property is from prototype
    if (!tweets.hasOwnProperty(trend)) continue

    let tc = tweets[trend]
    let processed = []
    tc.forEach(tweet => {
      processed.push(renderSingle(tweet))
    })
    rendered[trend] = processed
  }
  return {
    origin: 'renderTweets',
    data: rendered
  }
}

function renderSingle (tweet) {
  let html = '<div class="tweet" data-tweet-id="' + tweet.id + '">'
  html += '<div class="uInfo">' + tweet.user + '</div>'
  html += '<p class="tText">' + tweet.text + '</p>'
  if (tweet.entities !== undefined && tweet.entities.urls[0] !== undefined && tweet.entities.urls[0].expanded_url.match(/(twitter.com)/) === null) {
    let lPData = pullLinkPreview(tweet.entities.urls[0].expanded_url)
    if (lPData && lPData.title !== '') {
      html += '<div class="linkPreview">'
      if (lPData.image !== null) {
        html += '<div class="imageHolder"><img src="' + lPData.image + '"></div>'
      }
      if (lPData.description.length > 140) lPData.description = lPData.description.substr(0, 417) + '...'
      html += '<div class="content"><h3>' + lPData.title + '</h3><p>' + lPData.description + '</p></div></div>'
    }
  }
  html += '<p class="date">' + tweet.created + '</p>'
  return html + '</div>'
}

function pullLinkPreview (url) {
  let request = new XMLHttpRequest()
  request.open('GET', '/api/lpreview?q=' + btoa(url), false)
  request.send(null)
  if (request.status >= 200 && request.status < 400) {
    postMessage({
      origin: 'pullLinkPreview',
      data: [1, count]
    })
    try {
      return (JSON.parse(request.responseText))
    } catch (e) {
      console.error(e)
      return false
    }
  } else {
    return false
  }
}
