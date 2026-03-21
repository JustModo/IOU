// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_wakeful_wraith.sql';
import m0001 from './0001_majestic_paladin.sql';
import m0002 from './0002_motionless_marvex.sql';
import m0003 from './0003_bitter_klaw.sql';
import m0004 from './0004_lowly_orphan.sql';
import m0005 from './0005_brisk_sparrow.sql';
import m0006 from './0006_yellow_sasquatch.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005,
m0006
    }
  }
  