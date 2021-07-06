import { BITBOX } from 'bitbox-sdk';
import { Contract, BitboxNetworkProvider } from 'cashscript';
import { compileString } from 'cashc';


export const getTemplateContract = async (params, contractFile) => {

  const contractFetch = await fetch(contractFile) // Inside public folder.
  const source = await contractFetch.text();
  const artifact = compileString(source)

  const bitbox = new BITBOX();

  // Initialise a network provider for network operations on MAINNET
  // @ts-ignore
  const provider = new BitboxNetworkProvider('mainnet', bitbox);
  //const provider = new ElectrumNetworkProvider('mainnet');

  // Instantiate a new contract using the compiled artifact and network provider
  // AND providing the constructor parameters (pkh: alicePkh)
  const contract = new Contract( artifact, [...params], provider);
  // Get contract balance & output address + balance
  console.log(contractFile, 'contract address:', contract.address);
  // console.log(contractFile, 'contract balance:', await contract.getBalance());
  // console.log(contractFile, 'contract opcount:', contract.opcount);
  // console.log(contractFile, 'contract bytesize:', contract.bytesize);
  return contract
}
