const { InMemoryLRUCache, PrefixingKeyValueCache } = require('apollo-server-caching')

class GenericDataSource {
  constructor (keyPrefix = 'gen:', ttl) {
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
      .then((raw) => raw
        ? JSON.parse(raw)
        : invalidate(key, loaderFn, valueTTL)
      )
  }

  set (key, value, valueTTL) {
    const ttlFn = valueTTL || this.ttl
    const ttl = typeof ttlFn === 'function' ? ttlFn(value) : ttlFn
    return this.cache.set(key, JSON.stringify(value), ttl && { ttl })
      .then(() => value)
  }

  invalidate (key, loaderFn, valueTTL) {
    return Promise.resolve(loaderFn())
      .then((value) => value
        ? this.set(key, value, valueTTL)
        : value
      )
  }
}

module.exports = GenericDataSource
