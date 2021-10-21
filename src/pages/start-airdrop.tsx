import { Alert, AlertIcon, VStack } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import Layout from "components/common/Layout"
import Section from "components/common/Section"
import Asset from "components/start-airdrop/Asset"
import NameInput from "components/start-airdrop/NameInput"
import PickRoles from "components/start-airdrop/PickRoles"
import ServerSelect from "components/start-airdrop/ServerSelect"
import SubmitButton from "components/start-airdrop/SubmitButton"
import TokenSelect from "components/start-airdrop/TokenSelect"
import useDeployedTokens from "hooks/useDeployedTokens"
import { useEffect } from "react"
import { FormProvider, useForm, useFormState, useWatch } from "react-hook-form"

const StartAirdropPage = (): JSX.Element => {
  const { deployedTokens } = useDeployedTokens()
  const { account } = useWeb3React()
  const methods = useForm({ mode: "all" })
  const serverId = useWatch({
    name: "serverId",
    control: methods.control,
  })
  const contractId = useWatch({
    name: "contractId",
    control: methods.control,
  })
  const { errors } = useFormState({ control: methods.control })

  useEffect(() => console.log(contractId), [contractId])

  if (!account)
    return (
      <Layout title="Drop to your community">
        <Alert status="error">
          <AlertIcon />
          Please connect your wallet to continue
        </Alert>
      </Layout>
    )

  return (
    <FormProvider {...methods}>
      <Layout title="Drop to your community">
        <VStack as="form" spacing={10}>
          <Section title="Choose a name for your DROP">
            <NameInput />
          </Section>
          <Section title="Choose a server">
            <ServerSelect />
          </Section>
          {deployedTokens?.length > 0 && (
            <Section title="Choose an existiong token">
              <TokenSelect />
            </Section>
          )}
          {contractId === "DEPLOY" && (
            <Section title="Choose a type of asset to deploy">
              <Asset />
            </Section>
          )}
          {!!serverId && errors?.name === undefined && (
            <Section title="Pick roles">
              <PickRoles />
            </Section>
          )}

          <SubmitButton />
        </VStack>
      </Layout>
    </FormProvider>
  )
}

export default StartAirdropPage
