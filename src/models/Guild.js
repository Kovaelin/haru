module.exports = function () {
  const type = this.thinky.type
  const object = type.object
  const string = type.string
  const bool = type.boolean

  return {
    tableName: 'Guild',
    schema: {
      id: string(),
      permissions: object().default({}),
      deleted: bool().default(false),
      prefix: string().default(process.env.CLIENT_PREFIX),
      lang: string().default('en'),
      tz: string().default('utc'),
      events: object().default({})
    },
    cache: true,
    expiry: 300 * 1000,
    relations: {
      hasMany: ['RSS', 'rss', 'id', 'id']
    }
  }
}
