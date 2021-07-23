import { getTemplateContract } from '../contracts';
import { buildLockScriptHash } from '../utils/helpers';

import { getPayerWallet, getPayeeWallet } from '../wallet';


export const defaultAddr = 'bitcoincash:qz2g9hg86tpdk0rhk9qg45s6nj3xqqerkvcmz5rrq0'
// eslint-disable-next-line
export const [ payer, payerPk, payerPkh, payerAddr ] = getPayerWallet()
export const [ payee, payeePk, payeePkh, payeeAddr ] = getPayeeWallet()

export const dust = 546
export const defaultEpoch = 2;
export const defaultMaxAmountPerEpoch = 3000
export const defaultRemainingTime = defaultEpoch
export const defaultRemainingAmount = defaultMaxAmountPerEpoch
export const initialSendAmountState = 1000
export const initialMinerFeeState = 1116 // Close to min relay fee of the network.
export const initialRevokeMinerFeeState = 542

export const MESSAGES: any = {
  EPOCH_TOO_LOW: 'Epoch should be greater than 0',
  MAX_AMOUNT_PER_EPOCH_TOO_LOW: "Max Amount/Epoch should be greater than 546",
  NEXT_STATE_NOT_DERIVE : "Next contract state is not derived. Press the 'Derive Next State' button on the bottom right.",
  NEXT_STATE_AMOUNT_TOO_LOW: 'Amount to next state should be greater than 546. amountToNextState = balance - minerFee - sendAmount',
  REVOKE_AMOUNT_TOO_LOW: 'Revokable amount should be greater than 546',
  SPEND_AMOUNT_TOO_LOW: 'Spending amount should be greater than 546',
  REMAINING_AMOUNT_HIGH: 'Remaining Amount should be less than maxAmountPerEpoch',
  HOVERABLE_EPOCH_TITLE: 'Epoch',
  HOVERABLE_EPOCH_INFO: 'Time frame in block height.',
  HOVERABLE_MAX_AMOUNT_PER_EPOCH_TITLE: 'MaxAmount/Epoch',
  HOVERABLE_MAX_AMOUNT_PER_EPOCH_INFO: 'Maximum amount spendable per epoch.',
  HOVERABLE_REMAINING_TIME_TITLE: 'Remaining Time',
  HOVERABLE_REMAINING_TIME_INFO: 'Current Valid From - Last Valid From = Remaining Time',
  HOVERABLE_REMAINING_SPENDABLE_AMOUNT_TITLE: 'Remaining Amount',
  HOVERABLE_REMAINING_SPENDABLE_AMOUNT_INFO: 'Revoke invoked by Payer, has less miner fee.',
  HOVERABLE_SPEND_TITLE: 'Spend',
  HOVERABLE_SPEND_INFO: 'Spend invoked by Payee. The amount should be less than the `MaxAmount/Epoch` and `Remaining Amount` However, If passedTime >= remainingTime than spendable remainingAmount = maxAmountPerEpoch ',
  HOVERABLE_REVOKE_TITLE: 'Revoke',
  HOVERABLE_REVOKE_INFO: 'Revoke invoked by Payer, has less miner fee.',
  HOVERABLE_NEXT_STATE_TITLE: 'Next state',
  HOVERABLE_NEXT_STATE_INFO: "If the next contract address is undefined then press the 'Derive Next State' button on the bottom right. Warning: Next contract state with amount less than 0 will not be spendable by payee."
}

export const getContractInfo = async (params, contractFile) => {
  let amount = 0

  const contract = await getTemplateContract(params, contractFile)
  const redeemScript = contract.getRedeemScriptHex();
  const completeLockScript = await buildLockScriptHash(redeemScript);

  const Utxos = await contract.getUtxos()
  // @ts-ignore
  if (Utxos.length < 1){
    console.log(contractFile, "No utxo available for this address", contract.address)
    //return
  } else {
    Utxos.sort((a, b) => b.satoshis - a.satoshis)
    // @ts-ignore
    Utxos.forEach((u, idx) => {
      console.log(u)
      amount += u.satoshis
    });
  }

  return [contract, amount, completeLockScript]
}

