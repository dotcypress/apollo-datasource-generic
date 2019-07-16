const { InMemoryLRUCache, PrefixingKeyValueCache } = require('apollo-server-caching')

class GenericDataSource {
  constructor (keyPrefix = 'gen:', ttl, resolveFn) {
    this.keyPrefix = keyPrefix
    this.resolveFn = resolveFn
    this.ttl = ttl
  }

  initialize (config) {
    this.context = config.context
    const kvCache = config.cache || new InMemoryLRUCache()
    this.cache = new PrefixingKeyValueCache(kvCache, this.keyPrefix)
  }

  get (key, resolveFn, ttl) {
    const load = resolveFn || this.resolveFn
    return this.cache.get(key)
      .then((raw) => raw
        ? JSON.parse(raw)
        : Promise.resolve(load(key))
          .then((value) => value
            ? this.set(key, value, ttl)
            : value
          )
      )
  }

  set (key, value, ttlVal) {
    const ttlFn = ttlVal || this.ttl
    const ttl = typeof ttlFn === 'function' ? ttlFn(value) : ttlFn
    return this.cache.set(key, JSON.stringify(value), ttl && { ttl })
      .then(() => value)
  }

  delete (key) {
    return this.cache.delete(key)
  }
}

module.exports = GenericDataSource
