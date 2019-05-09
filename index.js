const { InMemoryLRUCache, PrefixingKeyValueCache } = require('apollo-server-caching')

class GenericDataSource {
  constructor (keyPrefix = 'gencache:', ttl) {
    this.keyPrefix = keyPrefix
    this.ttl = ttl
  }

  initialize (config) {
    this.context = config.context
    const kvCache = config.cache || new InMemoryLRUCache()
    this.cache = new PrefixingKeyValueCache(kvCache, this.keyPrefix)
  }

  get (key, loaderFn, valueTTL) {
    return this.cache.get(key)
      .then((value) => {
        if (value) {
          return JSON.parse(value)
        }
        return Promise.resolve(loaderFn())
          .then((value) => {
            const ttl = valueTTL || this.ttl
            const options = ttl && { ttl }
            return value && this.cache.set(key, JSON.stringify(value), options)
              .then(() => value)
          })
      })
  }
}

module.exports = GenericDataSource
