import * as migration_20260131_160000 from './20260131_160000';

export const migrations = [
  {
    up: migration_20260131_160000.up,
    down: migration_20260131_160000.down,
    name: '20260131_160000'
  },
];
