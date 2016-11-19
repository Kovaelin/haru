const util = require('util')
const { Command } = require('../../core')

class Eval extends Command {
  constructor (...args) {
    super(...args, {
      name: 'eval',
      description: 'Evaluates an expression',
      adminOnly: true,
      cooldown: 0
    })
  }

  async handle (container, responder) {
    const { msg, settings } = container
    let resp
    try {
      resp = eval(msg.content.substr(settings.prefix.length).split(' ').slice(1).join(' '))
    } catch (err) {
      resp = err
    }

    const success = !(resp instanceof Error)
    const isPromise = (resp instanceof Promise)

    const message = await responder.embed(this.createEmbed(isPromise ? null : success, isPromise, resp.message || resp)).send()

    if (!isPromise) return

    resp
    .then(result => message.edit({ content: '', embed: this.createEmbed(true, true, result) }))
    .catch(err => message.edit({ content: '', embed: this.createEmbed(false, true, err) }))
  }
}

class FullEval extends Command {
  constructor (...args) {
    super(...args, {
      name: 'fulleval',
      description: 'Evaluates an expression across processes',
      adminOnly: true,
      cooldown: 0
    })
  }

  async handle (container, responder) {
    const { msg } = container
    const content = msg.content.split(' ').slice(1).join(' ')
    this.bot.engine.ipc.awaitResponse('evaluate', { content })
    .then(data => responder.format('code:js').send(data.map(d => {
      const r = d.result || null
      return [
        `PROCESS ${d.id}:`,
        (r && r.length > 200 ? r.substr(0, 200) + '...' : r) + '\n'
      ].join('\n')
    }).join('\n')))
    .catch(err => responder.format('code:js').send(err))
  }
}

module.exports = [ Eval, FullEval ]
