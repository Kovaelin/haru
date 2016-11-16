module.exports = {
  type: 'string',
  resolve: (content, { choices = [], categories = [], max = Infinity, min = 0, optional = false }) => {
    if (typeof content === 'undefined') {
      if (!optional) {
        return Promise.reject({ message: '{{%resolver.string.NOT_STRING}}' })
      }
      return Promise.resolve(content)
    }
    const num = content.length
    if (num > max) {
      return Promise.reject({
        message: '{{%resolver.string.MAX}}',
        tags: { max }
      })
    }
    if (num < min) {
      return Promise.reject({
        message: '{{%resolver.list.MIN}}',
        tags: { min }
      })
    }
    if (choices.length && !choices.includes(content)) {
      return Promise.reject({
        message: `{{%resolver.string.ONE_OF}}: ${choices.map(c => '`' + c + '`').join(', ')}`
      })
    }
    if (categories.length) {
      for (const [ cat, choice ] of Object.entries(categories)) {
        if (choice.includes(content)) return Promise.resolve(cat)
      }
      return Promise.reject({
        message: `{{%resolver.string.ONE_OF}}: ${Object.keys(categories).map(c => '`' + c + '`').join(', ')}`
      })
    }
    return Promise.resolve(content)
  }
}
