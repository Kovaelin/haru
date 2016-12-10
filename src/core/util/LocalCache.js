const logger = require('winston')
const moment = require('moment')
const Collection = require('./Collection')

class LocalCache extends Collection {
  constructor (model, ttl = 3600) {
    super()

    this.ttl = ttl * 1000
    this.timers = new Collection()

    if (model) {
      model.changes().then(feed => {
        feed.each((err, doc) => {
          if (err) return logger.error(err)
          if (doc.isSaved() === false) {
            this.delete(doc.id)
          } else {
            this.store(doc.id, doc)
          }
        })
      }).error(logger.error)
      this.model = model
    }
  }

  async fetch (key, pure = false) {
    let value = this.get(key)
    if ((typeof value === 'undefined' && this.model) || pure) {
      try {
        value = await this.model.get(key).run()
        this.store(key, value)
      } catch (err) {
        if (err.name === 'DocumentNotFoundError') {
          const Model = this.model
          value = new Model({ id: key })
          await value.save()
          this.store(key, value)
        }
      }
    }
    return value
  }

  async fetchJoin (key, options) {
    let value = await this.fetch(key)
    for (let type in options) {
      if (options[type] === true && typeof value[type] === 'undefined') {
        try {
          if (!this.model) return
          value = await this.model.get(key).getJoin(options).run()
        } catch (err) {
          if (err.name === 'DocumentNotFoundError') {
            const Model = this.model
            value = new Model({ id: key })
            await value.save()
          }
        }
        this.store(key, value)
        return value
      }
    }
    return value
  }

  async update (key, newValue) {
    let oldValue = await this.fetch(key)
    this.store(key, newValue)
    return oldValue
  }

  clearAll () {
    this.clear()
    this.timers.clear()
  }

  clear (key) {
    this.delete(key)
    this.clearTimer(key)
  }

  store (key, value) {
    this.set(key, value)
    this.refresh(key)
  }

  ttl (key) {
    return this.timers.get(key).expiry - +moment()
  }

  clearTimer (key) {
    if (!this.timers.has(key)) return
    const timer = this.timers.get(key)
    clearTimeout(timer.timer)
  }

  refresh (key) {
    this.clearTimer(key)
    const timer = setTimeout(() => this.clear(key), this.ttl)
    this.timers.set(key, { timer, expiry: +moment() + this.ttl })
  }

  persist (key) {
    this.clearTimer(key)
    let ttl = this.ttl(key)
    this.timers.delete(key)
    return ttl
  }
}

module.exports = LocalCache
