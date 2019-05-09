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

```
const { fetchNews } = require('example-news-loader')

class TestDataSource extends GenericDataSource {
  constructor() {
    super('prefix:', 10)
  }

  async getNews(provider) {
    return this.get(provider, () => fetchNews(provider))
  }
}
```
