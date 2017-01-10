module.exports = {
  type: 'role',
  resolve: (content, { includeEveryone = true }, msg) => {
    const guild = msg.guild
    content = String(content).toLowerCase()
    let role = content.match(/^<@&(\d{17,18})>$/)
    if (!role) {
      let roles = guild.roles.filter(r => {
        const name = r.name.toLowerCase()
        return name === content || name.includes(content) && name === '@everyone' ? includeEveryone : true
      })
      if (roles.length) {
        return Promise.resolve(roles)
      } else {
        return Promise.reject('role.NOT_FOUND')
      }
    } else {
      let r = guild.roles.get(role[1])
      if (!r) return Promise.reject('role.NOT_FOUND')
      return Promise.resolve([r])
    }
  }
}
