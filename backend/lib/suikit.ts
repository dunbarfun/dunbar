import { SuiKit } from '@scallop-io/sui-kit';

export default (mnemonic: string) => {
  return new SuiKit({
    mnemonics: mnemonic,
    networkType: 'testnet',
  });
}
