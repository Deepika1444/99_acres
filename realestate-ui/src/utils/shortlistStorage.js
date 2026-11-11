const SHORTLIST_KEY = "shortlistedProperties";

function readList() {
  try {
    const raw = localStorage.getItem(SHORTLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(list) {
  try {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  } catch {
    // Ignore storage failures.
  }
}

export function getShortlistedProperties() {
  return readList();
}

export function isPropertyShortlisted(propertyId) {
  const id = String(propertyId || "").trim();
  if (!id) return false;
  return readList().some((item) => String(item?.propertyId || "").trim() === id);
}

export function toggleShortlistedProperty(property) {
  const propertyId = String(property?.propertyId || "").trim();
  if (!propertyId) return { shortlisted: false, list: readList() };

  const list = readList();
  const exists = list.some((item) => String(item?.propertyId || "").trim() === propertyId);
  if (exists) {
    const next = list.filter((item) => String(item?.propertyId || "").trim() !== propertyId);
    writeList(next);
    return { shortlisted: false, list: next };
  }

  const payload = {
    propertyId,
    title: String(property?.title || "").trim(),
    address: String(property?.address || "").trim(),
    priceText: String(property?.priceText || "").trim(),
    imageUrl: String(property?.imageUrl || "").trim(),
    city: String(property?.city || "").trim(),
    postedDate: String(property?.postedDate || "").trim(),
    addedAt: new Date().toISOString(),
  };
  const next = [payload, ...list];
  writeList(next);
  return { shortlisted: true, list: next };
}
