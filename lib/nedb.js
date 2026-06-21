// Inside wrapCollection
insert: async (data) => {
  if (Array.isArray(data)) {
    const inserted = [];
    for (const d of data) {
      const copy = { ...d };
      if (copy.id == null) copy.id = idCounters[table]++;
      store.push(copy);
      inserted.push(copy);
    }
    await saveToDisk();
    return inserted;
  }
  const copy = { ...data };
  if (copy.id == null) copy.id = idCounters[table]++;
  store.push(copy);
  await saveToDisk();
  return copy;
},