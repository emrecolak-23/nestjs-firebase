import { Db } from 'mongodb';

module.exports = {
  async up(db: Db) {
    console.log('Migration has been executed successfully');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  },
};
