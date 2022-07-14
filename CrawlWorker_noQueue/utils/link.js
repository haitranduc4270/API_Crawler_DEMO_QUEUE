function getLink(origin, link) {
  const isRelativeLink = link.charAt(0) === '/';
  return `${isRelativeLink ? origin : ''}${link}`;
}

function removeTrailingSpash(link) {
  return link.replace(/\/$/, '');
}

module.exports = {
  getLink,
  removeTrailingSpash,
};
