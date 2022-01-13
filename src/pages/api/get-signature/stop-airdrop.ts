import { defaultAbiCoder } from "@ethersproject/abi"
import { arrayify } from "@ethersproject/bytes"
import { keccak256 } from "@ethersproject/keccak256"
import { Wallet } from "@ethersproject/wallet"
import { fetchRoles } from "components/start-airdrop/NFTSections/components/Uploaders/hooks/useRoles"
import { fetchContractByDeployer } from "components/[drop]/ClaimCard/hooks/useContractByDeployer"
import { Chains } from "connectors"
import { AirdropAddresses } from "contracts"
import { Platform } from "contract_interactions/types"
import type { NextApiRequest, NextApiResponse } from "next"
import checkParams from "utils/api/checkParams"

type Body = {
  chainId: number
  serverId: string
  platform: Platform
  address: string
  roleId: string
  tokenAddress: string
  contractId: number
}

const REQUIRED_BODY = [
  { key: "contractId", type: "number" },
  { key: "chainId", type: "number" },
  { key: "serverId", type: "string" },
  { key: "platform", type: "string" },
  { key: "address", type: "string" },
  { key: "roleId", type: "string" },
  { key: "tokenAddress", type: "string" },
]

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method === "POST") {
    const paramsCorrect = checkParams(req, res, REQUIRED_BODY)
    if (!paramsCorrect) return

    const {
      chainId,
      serverId,
      platform,
      address,
      roleId,
      tokenAddress,
      contractId,
    }: Body = req.body
    // Is there a deployed airdrop contract on the chain
    if (!AirdropAddresses[Chains[chainId]]) {
      res.status(400).json({
        errors: [
          {
            key: "chainId",
            message: `No airdrop contract on network ${Chains[chainId]}.`,
          },
        ],
      })
      return
    }

    try {
      await Promise.all([
        platform === "DISCORD"
          ? fetchRoles("", serverId).then((roles) => {
              if (!(roleId in roles)) throw Error("Not valid role of server")
            })
          : new Promise<void>((resolve) => resolve()),
        fetchContractByDeployer("", chainId, address, contractId).then(
          (contractAddress) => {
            if (contractAddress !== tokenAddress)
              throw Error("Only the deployer can stop the drop")
          }
        ),
      ])

      const payload = defaultAbiCoder.encode(
        ["address", "string", "string", "address", "address", "string"],
        [
          AirdropAddresses[Chains[chainId]],
          platform,
          roleId,
          tokenAddress,
          address,
          "stop",
        ]
      )
      const message = keccak256(payload)
      const wallet = new Wallet(process.env.SIGNER_PRIVATE_KEY)
      const signature = await wallet.signMessage(arrayify(message)).catch(() => {
        throw Error("Failed to sign data")
      })
      res.status(200).json({ signature })
    } catch (error) {
      res.status(500).json({
        errors: [{ message: error.message }],
      })
    }
  } else
    res
      .status(501)
      .send(`Method ${req.method} is not implemented for this endpoint.`)
}

export default handler
