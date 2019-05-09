const { InMemoryLRUCache, PrefixingKeyValueCache } = require('apollo-server-caching')

class GenericDataSource {
  constructor(prefix = 'gencache:', ttl) {
    this.keyPrefix = prefix
    this.ttl = ttl
  }

  initialize(config) {
    this.context = config.context
    const kvCache = config.cache || new InMemoryLRUCache()
    this.cache = new PrefixingKeyValueCache(kvCache, this.keyPrefix)
  }

  get(key, loaderFn) {
    return this.cache.get(key)
      .then((cached) => {
        if (cached) {
          return JSON.parse(cached)
        }
        return Promise.resolve(loaderFn())
          .then((value) => {
            return value && this.cache.set(key, JSON.stringify(value), this.ttl && { ttl: this.ttl })
              .then(() => value)
          })
      })
  }
}

module.exports = GenericDataSource
