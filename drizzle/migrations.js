// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_wakeful_wraith.sql';
import m0001 from './0001_majestic_paladin.sql';
import m0002 from './0002_motionless_marvex.sql';
import m0003 from './0003_bitter_klaw.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  