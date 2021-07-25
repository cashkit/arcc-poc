import { BITBOX } from 'bitbox-sdk';
const bitbox = new BITBOX();

const DUST = 546

export const isValidAmount = ({ amount, maxAmountPerEpoch, remainingAmount }) => {
  if (remainingAmount <= maxAmountPerEpoch && amount >= DUST && amount <= remainingAmount){
    return true
  }
  return false
}

export const isValidEpoch = ({ epoch }) => {
  if (epoch >= 0){
    return true
  }
  return false
}

export const isValidMaxAmountPerEpoch = ({ maxAmountPerEpoch }) => {
  if (maxAmountPerEpoch >= DUST){
    // TODO: Also add limit of 4 byte integer.
    return true
  }
  return false
}

export const isValidContractState = () => {
  // TODO
}

export const isValidRemainingAmount = ({ remainingAmount, maxAmountPerEpoch }) => {
  if (remainingAmount <= maxAmountPerEpoch){
    return true
  }
  return false
}

export const isValidRemainingTime = ({ epoch, remainingTime }) => {
  if (remainingTime <= epoch && remainingTime >= 0){
    return true
  }
  return false
}

/**
 *  Returns the max amount payee can spend at any given moment of time. 
 */
export const getSpendableAmount = async ({ epoch, maxAmountPerEpoch, remainingTime, remainingAmount, validFrom }) => {
  let newRemainingAmount = remainingAmount;

  const currentBlockHeight = await bitbox.Blockchain.getBlockCount()
  const passedTime = currentBlockHeight - validFrom
  if (passedTime >= remainingTime || epoch === 0){
    newRemainingAmount = maxAmountPerEpoch;
  }
  return newRemainingAmount
}
  

/**
 * Returns the next state constructor parameters.
 */
export const deriveNextStateValues = async ({
  epoch,
  maxAmountPerEpoch,
  remainingAmount,
  validFrom,
  remainingTime,
  amount }) => {

  const currentBlockHeight = await bitbox.Blockchain.getBlockCount()
  const passedTime = currentBlockHeight - validFrom

  let newRemainingTime = remainingTime
  let newRemainingAmount = remainingAmount - amount;
  let sameMaxAmountPerEpoch = maxAmountPerEpoch
  let sameEpoch = epoch

  if (sameEpoch === 0){
    newRemainingTime = 0
    newRemainingAmount = maxAmountPerEpoch
  } else {
    if (passedTime >= newRemainingTime){
      newRemainingAmount = sameMaxAmountPerEpoch - amount;
    }
    if (newRemainingTime >= (passedTime % sameEpoch)) {
      newRemainingTime = newRemainingTime - (passedTime % sameEpoch);
    } else {
      newRemainingTime = sameEpoch - ((passedTime % sameEpoch) - newRemainingTime);
    }
  }

  if (newRemainingTime === 0) {
    // In case of collision.
    newRemainingTime = sameEpoch;
  }

  return {
    validFrom: currentBlockHeight,
    remainingAmount: newRemainingAmount,
    remainingTime: newRemainingTime }
}