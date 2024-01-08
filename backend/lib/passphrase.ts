import { bytesToHex, hexToBytes, randomBytes } from "@noble/hashes/utils";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

export function deriveKeypair(passphrase: string) {
  return Ed25519Keypair.deriveKeypair(passphrase);
}

/**
 * Generate mnemonics as 12 words string using the english wordlist.
 *
 * @returns a 12 words string separated by spaces.
 */
export function generateMnemonic(): string {
  return bip39.generateMnemonic(wordlist);
}

export function generateWallet() {
  const mnemonic = generateMnemonic();
  const keypair = deriveKeypair(mnemonic);
  return {
    mnemonic,
    publicKey: keypair.getPublicKey().toSuiAddress()
  };
}


