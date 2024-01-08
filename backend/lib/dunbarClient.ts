import { DunbarClient } from '@/lib/dunbar';
import sui from '@/lib/sui';

const PACKAGE_ID = "0xbd1b0be50e70d6c476d9691fbb035755a09cdf415a6de4e1d4beaba1efa4d848"
const GLOBAL_OBJECT_ID = "0x1e35fb5c5dfc198c8ecc8342d43de17c799b08f1e4e08aaecf590468e98714fb"

export default new DunbarClient(
  sui,
  PACKAGE_ID,
  GLOBAL_OBJECT_ID,
)
