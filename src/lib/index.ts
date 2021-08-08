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
  if (maxAmountPerEpoch >= DUST && maxAmountPerEpoch <= 2147483647){
    return true
  }
  return false
}

export const isValidRemainingAmount = ({ remainingAmount, maxAmountPerEpoch }) => {
  if (remainingAmount <= maxAmountPerEpoch && remainingAmount >= 0){
    return true
  }
  return false
}

export const isValidRemainingTime = ({ epoch, remainingTime }) => {
  if (epoch === 0 && remainingTime === 0){
    return true
  }
  if (remainingTime <= epoch && remainingTime > 0){
    return true
  }
  return false
}

export const isValidValidFrom = ({ validFrom }) => {
  if (validFrom >= 0){
    return true
  }
  return false
}

export const isValidContractState = ({ epoch, maxAmountPerEpoch, remainingTime, remainingAmount, validFrom, amount }) => {
  let isValid = false

  if (isValidAmount({ amount, maxAmountPerEpoch, remainingAmount }) &&
      isValidEpoch({ epoch }) &&
      isValidMaxAmountPerEpoch({ maxAmountPerEpoch }) &&
      isValidRemainingAmount({ remainingAmount, maxAmountPerEpoch }) &&
      isValidRemainingTime({ epoch, remainingTime }) &&
      isValidValidFrom({ validFrom })
  ) {
    isValid = true
  }
  return isValid
}


/**
 *  Returns the max amount payee can spend at any given moment of time. 
 */
export const getSpendableAmount = async ({ epoch, maxAmountPerEpoch, remainingTime, remainingAmount, validFrom, prevValidFrom = undefined }) => {
  console.log({ epoch, maxAmountPerEpoch, remainingTime, remainingAmount, validFrom, prevValidFrom })
  let spendableAmount = remainingAmount;

  const currentBlockHeight = await bitbox.Blockchain.getBlockCount()

  const passedTime = currentBlockHeight - validFrom
  if (passedTime >= remainingTime || epoch === 0){
    spendableAmount = maxAmountPerEpoch;
  }

  if (passedTime >= epoch){
    const missedEpochs = (passedTime - (passedTime % epoch))/epoch
    spendableAmount = remainingAmount + missedEpochs * maxAmountPerEpoch;
  }
  return spendableAmount
}

/**
 *  Returns the remaining amount spendable by payee.
 */
 export const getRemainingAmount = async ({ epoch, remainingAmount, sendAmount, validFrom, maxAmountPerEpoch }) => {
   console.log({ epoch, remainingAmount, sendAmount, validFrom, maxAmountPerEpoch })
   let newRemainingAmount;
   newRemainingAmount = remainingAmount - sendAmount;

   const currentBlockHeight = await bitbox.Blockchain.getBlockCount()
   const passedTime = currentBlockHeight - validFrom
   if (passedTime >= epoch){
      newRemainingAmount = maxAmountPerEpoch
  }

  return newRemainingAmount;
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

    // Default values to handle the case of epoch == 0.
  newRemainingAmount = sameMaxAmountPerEpoch;
    // The assignment newRemainingTime = sameEpoch enforces that the next epoch has started but this variable can be overwritten if conditions are different.
    // Useful for cases when: Epoch == 0 or timeDifference(defined later) == 0.
  newRemainingTime = sameEpoch;

  if (sameEpoch !== 0){
      newRemainingAmount = sameMaxAmountPerEpoch - amount;
      // timeDifference == 0(defined below), marks the beginning of a new epoch.
      // Start of a new epoch also means end of the previous one, just like a day in real life. that's why the value of remainingTime should never be 0. except epoch = 0.

      let timeDifference = remainingTime - (passedTime % sameEpoch);
      if (timeDifference > 0) {
          // Inside the same timeframe window. i.e same epoch.
          // remainingAmount is expected to be in the range of (0 to maxAmountPerEpoch) at time of contract creation.
          // The calculated value may be negative here but that would mean that the contract execution will fail because of the checks below.
          if (passedTime < sameEpoch){
              // If this condition fails then no transactions were done in the new epoch and hence payee can spend upto maxAmountPerEpoch.
              // If this condition passes then that means the there is still time left for the new epoch to start and payee can only spend from the remaining amount.
              newRemainingAmount = remainingAmount - amount;
          }
          newRemainingTime = timeDifference;
      }
      if (timeDifference < 0) {
          // When a new epoch has already started but no transactions are done yet.
          // Spendable amount should be upto maxAmountPerEpoch.
          newRemainingTime = sameEpoch - Math.abs(timeDifference);
      }
  }

  return {
    validFrom: currentBlockHeight,
    remainingAmount: newRemainingAmount,
    remainingTime: newRemainingTime }
}