const parseISO = require('date-fns/parseISO')
const subDays = require('date-fns/subDays')
const isBefore = require('date-fns/isBefore')
const fetch = require('../utilities/fetch')
const fetchAuthorId = require('../fetch-author-id')
const fetchPluginsData = require('../fetch-plugins-data')
const sortComparators = require('./sort-comparators')

async function figmaPluginsData ({ authorHandle, limit, sort, timeOffset }) {
  const plugins = await fetchPluginsData()
  const stats = await fetchScrapedStats(timeOffset)
  const authorId =
    typeof authorHandle === 'undefined'
      ? null
      : await fetchAuthorId(authorHandle)
  return parseData(plugins, stats, {
    authorId,
    limit,
    sortComparator: sortComparators[sort]
  })
}

const BASE_URL = 'https://yuanqing.github.io/figma-plugins-data'
const EARLIEST_DATE = new Date('2020-04-01')

async function fetchScrapedStats (timeOffset) {
  const response = await fetch(`${BASE_URL}/stats.json`)
  const json = await response.json()
  const stats = json.stats
  const endDate = parseISO(json.date)
  let i = 0
  let date = endDate
  const promises = []
  while (i < timeOffset) {
    date = subDays(date, 1)
    if (isBefore(date, EARLIEST_DATE) === true) {
      break
    }
    promises.push(
      new Promise(function (resolve) {
        fetch(`${BASE_URL}/${date.toISOString().slice(0, 10)}.json`)
          .then(function (response) {
            return response.json()
          })
          .then(function (json) {
            resolve(json.stats)
          })
      })
    )
    i++
  }
  const result = await Promise.all(promises)
  return [stats, ...result].reverse()
}

const MAP_KEY_TO_INDEX = {
  installCount: 0,
  likeCount: 1,
  viewCount: 2
}

function parseData (plugins, stats, { authorId, limit, sortComparator }) {
  if (authorId !== null) {
    plugins = plugins.filter(function (plugin) {
      return plugin.authorId === authorId
    })
  }
  let result = []
  for (const plugin of plugins) {
    const keys = Object.keys(MAP_KEY_TO_INDEX)
    const pluginCounts = {}
    for (const key of keys) {
      const index = MAP_KEY_TO_INDEX[key]
      const counts = []
      for (const stat of stats) {
        counts.push(
          typeof stat[plugin.id] === 'undefined' ? null : stat[plugin.id][index]
        )
      }
      counts.push(plugin[key])
      pluginCounts[key] = {
        currentCount: counts[counts.length - 1],
        counts,
        deltas: computeDeltas(counts),
        totalDelta: counts[counts.length - 1] - counts[0]
      }
    }
    result.push({
      name: plugin.name,
      author: plugin.authorName,
      ...pluginCounts
    })
  }
  result = result.sort(sortComparator)
  if (typeof limit === 'undefined' || limit === true) {
    return result
  }
  return result.slice(0, limit)
}

function computeDeltas (counts) {
  const result = []
  counts.forEach(function (count, index) {
    if (index === 0) {
      return
    }
    result.push(count - counts[index - 1])
  })
  return result
}

module.exports = figmaPluginsData