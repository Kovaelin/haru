const pattern = new RegExp([
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
].join('|'), 'g')

module.exports = {
  stripColor: input => typeof input === 'string' ? input.replace(pattern, '') : input,
  LocalCache: require('./LocalCache')
}