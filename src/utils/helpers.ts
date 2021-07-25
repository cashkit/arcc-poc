import {
    hexToBin,
    instantiateSha256,
    instantiateRipemd160,
    HashFunction,
    flattenBinArray,
    binToHex,
    bigIntToScriptNumber,
    lockingBytecodeToCashAddress,
    cashAddressToLockingBytecode
} from '@bitauth/libauth';


export const getTime = () => {
  const d = new Date()
  return d.getFullYear() + '-' + (1 + d.getMonth()) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
}

export const hexToNum = (hex, length = 4, reverse = true) => {
    const h2b = hexToBin(hex)
    const buf = Buffer.from(h2b);
    if (reverse) { buf.reverse() }
    return buf.readUIntBE(0, length)
}

export const binToNum = (bin, length = 4, reverse = true) => {
    const buf = Buffer.from(bin);
    if (reverse) { buf.reverse() }
    return buf.readUIntBE(0, length)
}

export const redeemToAddress = async function(redeemScript) {
	// Derive the contract's address.
	//const contractLockScript = await buildLockScriptP2SH(binToHex(redeemScript));
	const contractLockScript = await buildLockScriptP2SH(redeemScript);

    const address = lockScriptToAddress(contractLockScript.substring(2));
    return address;
}

// Wrapper around libauth's hash functions
// Taken from :https://gitlab.com/GeneralProtocols/anyhedge/library
const hash = function(payload: Uint8Array, hashFunction: HashFunction): Uint8Array
{
	return hashFunction.hash(payload);
};

/**
 * Taken from :https://gitlab.com/GeneralProtocols/anyhedge/library
 * Sha256 hash a payload
 *
 * @param payload   Payload to be hashed
 *
 * @returns the sha256 hash of the payload
 */
export const sha256 = async function(payload: Uint8Array): Promise<Uint8Array>
{
	return hash(payload, await instantiateSha256());
};

/**
 * Taken from :https://gitlab.com/GeneralProtocols/anyhedge/library
 * Ripemd160 hash a payload
 *
 * @param payload   Payload to be hashed
 *
 * @returns the ripemd160 hash of the payload
 */
export const ripemd160 = async function(payload: Uint8Array): Promise<Uint8Array>
{
	return hash(payload, await instantiateRipemd160());
};

/**
 * Taken from :https://gitlab.com/GeneralProtocols/anyhedge/library
 * Sha256 hash a payload, then ripemd160 hash the result
 *
 * @param payload   Payload to be hashed
 *
 * @returns the ripemd160 hash of the sha256 hash of the payload
 */
export const hash160 = async function(payload: Uint8Array): Promise<Uint8Array>
{
	return ripemd160(await sha256(payload));
};


/**
 * Taken from :https://gitlab.com/GeneralProtocols/anyhedge/library
 * Helper function to construct a P2SH locking script hex string from a script bytecode hex string
 *
 * @param scriptBytecodeHex   Bytecode hex string of the script for which to create a P2SH locking script hex string
 *
 * @returns a P2SH locking script hex string corresponding to the passed script bytecode hex string
 */
 export const buildLockScriptP2SH = async function(scriptBytecodeHex: string): Promise<string>
 {
     // Output function call arguments for easier collection of test data.
 
     const scriptHash = await hash160(hexToBin(scriptBytecodeHex));
 
     // Build P2SH lock script (PUSH<23> HASH160 PUSH<20> <script hash> EQUAL)
     const lockScript = binToHex(flattenBinArray([ hexToBin('17a914'), scriptHash, hexToBin('87') ]));
 
     return lockScript;
 };

 /**
 * Helper function to construct a P2SH locking script hex string from a script bytecode hex string
 *
 * @param scriptBytecodeHex   Bytecode hex string of the script for which to create a P2SH locking script hex string
 *
 * @returns a P2SH locking script hex string corresponding to the passed script bytecode hex string
 */
  export const buildLockScriptHash = async function(scriptBytecodeHex: string): Promise<string>
  {
      // Output function call arguments for easier collection of test data.
  
      const scriptHash = await hash160(hexToBin(scriptBytecodeHex));
  
      return binToHex(scriptHash)
  };

/**
 * Taken from :https://gitlab.com/GeneralProtocols/anyhedge/library
 * Helper function to convert an address to a locking script hex string
 *
 * @param address   Address to convert to locking script hex string
 *
 * @returns a locking script hex string corresponding to the passed address
 */
 export const addressToLockScript = function(address: string): string
 {
     // Output function call arguments for easier collection of test data.
 
     const result = cashAddressToLockingBytecode(address);
 
     // The `cashAddressToLockingBytecode()` call returns an error string OR the correct bytecode
     // so we check if it errors, in which case we throw the error, otherwise return the result
     if(typeof result === 'string') throw(new Error(result));
 
     const lockScript = binToHex(result.bytecode);
 
     return lockScript;
 };

 /**
 * Taken from :https://gitlab.com/GeneralProtocols/anyhedge/library
 * Helper function to convert a locking script hex to a cashaddress
 *
 * @param lockScript   lock script to be converted to cashaddress
 *
 * @returns a cashaddress corresponding to the passed lock script
 */
export const lockScriptToAddress = function(lockScript: string): string
{
	// Output function call arguments for easier collection of test data.

	// Convert the lock script to a cashaddress (with bitcoincash: prefix).
	const address = lockingBytecodeToCashAddress(hexToBin(lockScript), 'bitcoincash');

	// A successful conversion will result in a string, unsuccessful will return AddressContents
	if(typeof address !== 'string')
	{
		throw(new Error(`Provided lock script ${lockScript} cannot be converted to address ${JSON.stringify(address)}`));
	}

	return address;
};

/**
 * Taken from :https://gitlab.com/GeneralProtocols/anyhedge/library
 * Encode a number as a hex encoded script number
 *
 * @param num   number to be encoded
 *
 * @returns hex encoded script number
 */
 export const hexEncodeScriptNum = function(num: number): string
 {
     // Output function call arguments for easier collection of test data.
 
     const scriptNum = bigIntToScriptNumber(BigInt(num));
     const scriptNumHex = binToHex(scriptNum);
 
     return scriptNumHex;
 };
 