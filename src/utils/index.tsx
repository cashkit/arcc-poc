import { Script, Crypto } from 'bitbox-sdk';
import { ECPair } from 'bitcoincashjs-lib';
import { SignatureAlgorithm } from 'cashscript';
import { BITBOX } from 'bitbox-sdk';

export const truncate = (str) => {
	const strlen = str.length
	return strlen > 10 ? str.substring(0, 20) + "......" + str.substring(strlen-5, strlen): str;
}

export class Signer {
  constructor(public keypair: ECPair) {}

  createMessage(baton: number, quantity: number): Buffer {
    const lhs = Buffer.alloc(4, 0);
    const rhs = Buffer.alloc(4, 0);
    new Script().encodeNumber(baton).copy(lhs);
    new Script().encodeNumber(quantity).copy(rhs);
    return Buffer.concat([lhs, rhs]);
  }

  createSingleMessage(messageType: number): Buffer {
    const lhs = Buffer.alloc(4, 0);
    new Script().encodeNumber(messageType).copy(lhs);
    return lhs
  }

  signMessage(message: Buffer): Buffer {
    return this.keypair.sign(new Crypto().sha256(message), SignatureAlgorithm.SCHNORR).toRSBuffer();
  }
}

export const refund = async () => {
  const bitbox = new BITBOX();
  // Initialise HD node and user's keypair
  const rootSeed = bitbox.Mnemonic.toSeed('CashSciptTemplate');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed);

  const user = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 1));
  const cashAddr = bitbox.ECPair.toCashAddress(user);
  const NETWORK = 'mainnet'
  const RECV_ADDR = 'bitcoincash:qrmz9ktxaptp8q8zacy8f6vftq7793cavvnwqjvtru'

  let sendAmount = 0
  const inputs = []

  const transactionBuilder = new bitbox.TransactionBuilder(NETWORK)


  const u = await bitbox.Address.utxo(cashAddr)
  console.log(u)
  // @ts-ignore
  u.utxos.forEach(utxo => {
    // @ts-ignore
    inputs.push(utxo)
    sendAmount += utxo.satoshis
    transactionBuilder.addInput(utxo.txid, utxo.vout)
  })

  const byteCount = bitbox.BitcoinCash.getByteCount(
    { P2PKH: inputs.length },
    { P2PKH: 1 }
  )
  console.log(`byteCount: ${byteCount}`)

  const satoshisPerByte = 1.0
  const txFee = Math.ceil(satoshisPerByte * byteCount)
  console.log(`txFee: ${txFee}`)

  console.log("Total amount: ", sendAmount)


  // Exit if the transaction costs too much to send.
  if (sendAmount - txFee < 0) {
    console.log(
      `Transaction fee costs more combined UTXOs. Can't send transaction.`
    )
    process.exit(1)
  }

  console.log("Gets: ", sendAmount - txFee)

  transactionBuilder.addOutput(RECV_ADDR, sendAmount - txFee)

  // sign w/ HDNode
  let redeemScript
  inputs.forEach((input, index) => {
    transactionBuilder.sign(
      index,
      user,
      redeemScript,
      transactionBuilder.hashTypes.SIGHASH_ALL,
      // @ts-ignore
      input.satoshis
    )
  })

  // build tx
  const tx = transactionBuilder.build()

  // output rawhex
  const hex = tx.toHex()
  console.log(`TX hex: ${hex}`)
  
  // Broadcast transation to the network
  const txid = await bitbox.RawTransactions.sendRawTransaction([hex])
  console.log(`Transaction ID: ${txid}`)
  console.log(`Check the status of your transaction on this block explorer:`)
  console.log(`https://explorer.bitcoin.com/tbch/tx/${txid}`)

}

// refund()