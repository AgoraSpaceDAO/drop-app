import { Contract } from "@ethersproject/contracts"
import { InfuraProvider } from "@ethersproject/providers"
import AIRDROP_ABI from "static/abis/airdrop.json"

enum AirdropAddresses {
  GOERLI = "0xb503D6f75F0c9A6110B22E434849257127266e44",
}

const airdropContracts = {
  GOERLI: new Contract(
    AirdropAddresses.GOERLI,
    AIRDROP_ABI,
    new InfuraProvider("goerli", process.env.INFURA_KEY)
  ),
}

const tokenContractGetters = {
  GOERLI: (tokenAddress: string): Contract =>
    new Contract(
      tokenAddress,
      AIRDROP_ABI,
      new InfuraProvider("goerli", process.env.INFURA_KEY)
    ),
}

export { AirdropAddresses, tokenContractGetters }
export default airdropContracts
