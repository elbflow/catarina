import * as migration_20260201_102539 from './20260201_102539';

export const migrations = [
  {
    up: migration_20260201_102539.up,
    down: migration_20260201_102539.down,
    name: '20260201_102539'
  },
];
