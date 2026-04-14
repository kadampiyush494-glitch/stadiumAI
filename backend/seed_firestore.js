const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

async function seed() {
  const vnId = 'stadium_001';
  
  // 1. Venues/Zones
  console.log('Seeding zones...');
  const zones = ['Z1', 'Z2', 'Z3', 'Z4'];
  for (const z of zones) {
    await db.collection('venues').doc(vnId).collection('zones').doc(z).set({
      density: 0.1,
      capacity: 5000,
      name: `Zone ${z}`,
      lastUpdate: admin.firestore.Timestamp.now()
    });
  }

  // 2. Queues
  console.log('Seeding queues...');
  const queues = ['Q1', 'Q2', 'Q3'];
  for (const q of queues) {
    await db.collection('venues').doc(vnId).collection('queues').doc(q).set({
      type: q === 'Q1' ? 'FOOD' : 'GATE',
      waitTime: 5,
      lastUpdated: admin.firestore.Timestamp.now(),
      status: 'OPEN'
    });
  }

  // 3. Events
  console.log('Seeding events...');
  await db.collection('venues').doc(vnId).collection('events').doc('E1').set({
    name: 'Derby Finals 2026',
    startTime: admin.firestore.Timestamp.now(),
    endTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7200000)),
    status: 'LIVE'
  });

  console.log('Done.');
}

seed().catch(console.error);
