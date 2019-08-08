const { InMemoryLRUCache, PrefixingKeyValueCache } = require('apollo-server-caching')

class GenericDataSource {
  constructor (keyPrefix = 'gen:', config = {}) {
    this.keyPrefix = keyPrefix
    this.config = config
    this.cache = new PrefixingKeyValueCache(new InMemoryLRUCache(), keyPrefix)
  }

  initialize ({ cache, context }) {
    this.cache = new PrefixingKeyValueCache(cache || new InMemoryLRUCache(), this.keyPrefix)
    this.context = context
  }

  get (key, resolveFn, ttl) {
    const load = resolveFn || this.config.resolveFn
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
    const ttlFn = ttlVal || this.config.ttl
    const ttl = typeof ttlFn === 'function' ? ttlFn(value) : ttlFn
    return this.cache.set(key, JSON.stringify(value), ttl && { ttl })
      .then(() => value)
  }

  store (value, ttlVal) {
    if (typeof this.config.storeKeyFn !== 'function') {
      throw new Error('Missing config: storeKeyFn')
    }
    const key = this.config.storeKeyFn(value)
    return this.set(key, value, ttlVal)
  }

  delete (key) {
    return this.cache.delete(key)
  }
}

module.exports = GenericDataSource
