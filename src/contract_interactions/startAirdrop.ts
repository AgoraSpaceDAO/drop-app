import { JsonRpcSigner, Provider } from "@ethersproject/providers"
import { StartAirdropData } from "components/start-airdrop/SubmitButton/hooks/useStartAirdrop"
import { Chains } from "connectors"
import { AirdropAddresses } from "contracts"
import ipfsUpload from "utils/ipfsUpload"
import { startAirdrop as airdropStartAirdrop } from "./airdrop"
import startAirdropSignature from "./utils/signatures/startAirdrop"

const textEncoder = new TextEncoder()

const startAirdrop = async (
  chainId: number,
  account: string,
  signer: JsonRpcSigner,
  data: StartAirdropData,
  provider?: Provider
): Promise<string> => {
  const { serverId, channel, urlName, platform, nfts, assetData, description } = data

  const roleIds = nfts.reduce((acc, curr) => [...acc, ...curr.roles], [])

  const metaDatas = roleIds.map((roleId) => {
    const nft = nfts.find((_) => _.roles.includes(roleId))

    return JSON.stringify({
      name: nft.name,
      description,
      image: `ipfs://${nft.hash}`,
      external_url: `https://drop.app/nft/${
        AirdropAddresses[Chains[chainId]]
      }/${platform}/${roleId}`,
      attributes: [
        {
          trait_type: "Server Id",
          value: serverId,
        },
        {
          trait_type: "Role Id",
          value: roleId,
        },
        ...nft.traits.map(({ key, value }) => ({ trait_type: key, value })),
      ],
    })
  })

  const metaDataHashes = await Promise.all(
    metaDatas.map((metaData) =>
      ipfsUpload(textEncoder.encode(metaData).buffer).then((result) => result.path)
    )
  )
  const signature = await startAirdropSignature(
    serverId,
    account,
    chainId,
    urlName,
    platform,
    roleIds,
    metaDataHashes
  ).catch((error) => {
    console.error(error)
    throw error
  })

  const tx = await airdropStartAirdrop(
    chainId,
    signer,
    signature,
    assetData.NFT.name,
    assetData.NFT.symbol,
    urlName,
    platform,
    assetData.NFT.name,
    serverId,
    roleIds,
    metaDataHashes,
    channel,
    provider
  )

  await tx.wait()

  return urlName
}

export default startAirdrop
