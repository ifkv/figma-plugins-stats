# figma-plugins-data [![npm Version](https://badgen.net/npm/v/figma-plugins-data)](https://www.npmjs.com/package/figma-plugins-data) [![build](https://github.com/yuanqing/figma-plugins-data/workflows/build/badge.svg)](https://github.com/yuanqing/figma-plugins-data/actions?query=workflow%3Abuild)

> Fetch the latest [Figma plugins](https://www.figma.com/community) meta data and stats

## API

```js
const { fetchAuthorId, fetchPluginsData } = require('figma-plugins-data')
```

#### const authorId = await fetchAuthorId([authorHandle])

Fetches the `authorId` of the given `authorHandle`.

#### const pluginsData = await fetchPluginsData()

Fetches the latest meta data and stats of all public Figma plugins. Each object literal in the `pluginsData` array has the following keys:

- `id`
- `name`
- `description`
- `lastUpdateDate`
- `tags`
- `authorId`
- `authorName`
- `installCount`
- `likeCount`
- `viewCount`

## Installation

```sh
$ yarn add figma-plugins-data
```

## License

[MIT](LICENSE.md)