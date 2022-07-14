async function findAll(
  model,
  searchFields,
  { search, query, offset, limit, fields, sort },
) {
  try {
    const s = searchFields
      .filter(
        field =>
          !(
            model.schema.paths[field].instance === 'Number' &&
            // eslint-disable-next-line no-restricted-globals
            isNaN(parseInt(search, 10))
          ),
      )
      .map(field => {
        return model.schema.paths[field].instance === 'Number'
          ? { [field]: parseInt(search, 10) }
          : { [field]: new RegExp(search, 'g') };
      });

    const count = await model.countDocuments(
      search ? { $or: s, ...query } : query,
    );

    const documents = await model
      .find(search ? { $or: s, ...query } : query)
      .skip(offset || 0)
      .limit(limit || null)
      .sort(
        sort
          ? JSON.parse(
              `{${sort
                .map(element => {
                  const field = element.substring(0, element.lastIndexOf('_'));
                  const value =
                    element.substring(element.lastIndexOf('_') + 1) === 'asc'
                      ? 1
                      : -1;
                  return `"${field}":${value}`;
                })
                .join(',')}}`,
            )
          : { _id: 1 },
      )
      .select(
        fields
          ? JSON.parse(`{${fields.map(element => `"${element}":1`).join(',')}}`)
          : {},
      );

    return { documents, count };
  } catch (error) {
    return { error };
  }
}

async function findById(model, id, fields) {
  const document = await model
    .findById(id)
    .select(
      fields
        ? JSON.parse(`{${fields.map(element => `"${element}":1`).join(',')}}`)
        : {},
    )
    .lean();
  return document;
}

module.exports = { findAll, findById };
