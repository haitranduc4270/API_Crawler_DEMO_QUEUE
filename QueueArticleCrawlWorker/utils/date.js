async function getISODate(date) {
  return new Date(date).toISOString();
}

async function getPublicDate(date1, date2) {
  const publicDate = getISODate(date1)
    .catch(() => getISODate(date2))
    .catch(() => new Date().toISOString());
  if (new Date(await publicDate) > new Date()) return new Date().toISOString();
  return publicDate;
}

module.exports = {
  getPublicDate,
};
