import { Contract } from "@ethersproject/contracts"
import { InfuraProvider } from "@ethersproject/providers"
import AIRDROP_ABI from "static/abis/airdrop.json"
import ROLE_TOKEN_ABI from "static/abis/roletoken.json"

enum AirdropAddresses {
  GOERLI = "0x254EF5F30A7260dC9132CFbD4cF9663Ef106b10A",
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
      ROLE_TOKEN_ABI,
      new InfuraProvider("goerli", process.env.INFURA_KEY)
    ),
}

export { AirdropAddresses, tokenContractGetters }
export default airdropContracts
