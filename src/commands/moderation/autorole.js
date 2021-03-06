const { Command, Permitter } = require('sylphy')

class Autorole extends Command {
  constructor (...args) {
    super(...args, {
      name: 'autorole',
      description: 'Add a role to a user on join',
      usage: [
        { name: 'action', displayName: ' add <@role> | remove', type: 'string', optional: true }],
      subcommands: {
        add: {
          usage: [
            { name: 'role', type: 'role', optional: false }
          ]
        },
        remove: {
          aliases: ['delete']
        }
      },
      options: { guildOnly: true, localeKey: 'settings', modOnly: true, permissions: ['manageRoles'], botPerms: ['manageRoles'] },
      group: 'moderation'
    })
  }


  async handle ({ msg, data, settings }, responder) {
    try {
      if (settings.autorole === null) {
        return responder.format('emoji:info').reply('{{autorole.none}}')
      }
      let role = msg.channel.guild.roles.get(settings.autorole).name
      return responder.format('emoji:info').reply('{{autorole.current}}', { role: `**${role}**` })
    } catch (err) {
      this.logger.error(`Could not load autorole for ${msg.channel.guild.name} (${msg.channel.guild.id})`, err)
      return responder.error()
    }
  }

  async add ({ msg, args, data, settings }, responder) {
    try {
      settings.autorole = args.role[0].id
      await settings.save()
      return responder.success('{{autorole.success}}', {
        role: `**\`${args.role[0].name}\`**`
      })
    } catch (err) {
      this.logger.error(`Could not add autorole for ${msg.channel.guild.name} (${msg.channel.guild.id})`, err)
      return responder.error()
    }
  }

  async remove ({ msg, data, settings }, responder) {
    try {
      settings.autorole = null
      await settings.save()
      return responder.success('{{autorole.none}}')
    } catch (err) {
      logger.error(`Cound not remove autorole for ${msg.channel.guild.name} (${msg.channel.guild.id}) - ${err}`)
      return responder.error()
    }
  }

}

module.exports = Autorole
