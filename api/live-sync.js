// Arabian Sheikh - Native Vercel Serverless Sync Engine
let globalSyncState = {
  orders: [],
  users: [],
  inactiveProductIds: [],
  activeProductIds: [],
  deletedProductIds: [],
  modifiedProducts: {},
  newProducts: [],
  lastUpdated: new Date().toISOString()
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (body && typeof body === 'object') {
        const orderMap = new Map();
        (body.orders || []).forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });
        globalSyncState.orders.forEach(o => { if (o?.id) orderMap.set(String(o.id), o); });

        const userMap = new Map();
        (body.users || []).forEach(u => { if (u?.email) userMap.set(u.email.toLowerCase().trim(), u); });
        globalSyncState.users.forEach(u => { if (u?.email) userMap.set(u.email.toLowerCase().trim(), u); });

        const newProdMap = new Map();
        (body.newProducts || []).forEach(p => { if (p?.id) newProdMap.set(String(p.id), p); });
        globalSyncState.newProducts.forEach(p => { if (p?.id) newProdMap.set(String(p.id), p); });

        const activeList = Array.isArray(body.activeProductIds) ? body.activeProductIds.map(String) : globalSyncState.activeProductIds;
        const inactiveList = Array.isArray(body.inactiveProductIds) ? body.inactiveProductIds.map(String) : globalSyncState.inactiveProductIds;

        globalSyncState = {
          orders: Array.from(orderMap.values()),
          users: Array.from(userMap.values()),
          inactiveProductIds: inactiveList.filter(id => !activeList.includes(String(id))),
          activeProductIds: activeList.filter(id => !inactiveList.includes(String(id))),
          deletedProductIds: Array.isArray(body.deletedProductIds) ? body.deletedProductIds.map(String) : globalSyncState.deletedProductIds,
          modifiedProducts: {
            ...globalSyncState.modifiedProducts,
            ...(body.modifiedProducts || {})
          },
          newProducts: Array.from(newProdMap.values()),
          lastUpdated: body.lastUpdated || new Date().toISOString()
        };
      }
      return res.status(200).json({ success: true, data: globalSyncState });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(200).json(globalSyncState);
}
