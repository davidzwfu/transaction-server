function parseArguments(data) {
  let [command, key, ...value] = data.toString().trim().split(' ');
  value = value.join(' ');
  try {
    value = JSON.parse(value);
  }
  catch(e) {}

  return { command, key, value };
}

function formatResponse(json) {
  return JSON.stringify(json) + '\r\n';
}

module.exports = {
  parseArguments,
  formatResponse,
}
