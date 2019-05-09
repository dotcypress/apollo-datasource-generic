# apollo-datasource-generic

A generic implementaion of apollo datasource.

## Install

```
npm install --save apollo-datasource-generic
```

or

```
yarn add apollo-datasource-generic
```

## Usage

Define a data source by extending the `GenericDataSource` class.

```js
const { fetchNewsSources, fetchNews } = require('example-news-api')

class TestDataSource extends GenericDataSource {
  constructor () {
    super('news:', 60)
  }

  getNewsSources () {
    return this.get('sources', fetchNewsSources, 60 * 60)
  }

  getNews (source) {
    return this.get(source, () => fetchNews(source))
  }
}
```
