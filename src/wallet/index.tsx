import { BITBOX } from 'bitbox-sdk';

const bitbox = new BITBOX();

const rootSeed = bitbox.Mnemonic.toSeed('CashSciptTemplate');
const hdNode = bitbox.HDNode.fromSeed(rootSeed);

const payer = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

const payerPk = bitbox.ECPair.toPublicKey(payer);
const payerPkh = bitbox.Crypto.hash160(payerPk);
const payerAddr = bitbox.ECPair.toCashAddress(payer);

const payee = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));
const payeePk = bitbox.ECPair.toPublicKey(payee);
const payeePkh = bitbox.Crypto.hash160(payeePk);
const payeeAddr = bitbox.ECPair.toCashAddress(payee);

export const getPayerWallet = () => {
  return [payer, payerPk, payerPkh, payerAddr]
}

export const getPayeeWallet = () => {
  return [payee, payeePk, payeePkh, payeeAddr]
}