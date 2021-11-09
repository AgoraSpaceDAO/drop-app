import { FormControl, FormErrorMessage, Input } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import { getDataOfDrop } from "contract_interactions/airdrop"
import useDeployedTokens from "hooks/airdrop/useDeployedTokens"
import useTokenName from "hooks/roletoken/useTokenName"
import { ReactElement, useEffect } from "react"
import { useFormContext, useFormState, useWatch } from "react-hook-form"
import slugify from "utils/slugify"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const NameInput = (): ReactElement => {
  const { chainId } = useWeb3React()
  const { setValue, register, trigger } = useFormContext()
  const { errors } = useFormState()
  const name = useWatch({ name: "name" })
  const deployedTokens = useDeployedTokens()
  const contractId = useWatch({ name: "contractId" })
  const tokenName = useTokenName(deployedTokens?.[contractId])

  useEffect(() => {
    if ((name?.length <= 0 || !!errors.name) && tokenName?.length > 0) {
      setValue("name", tokenName)
      trigger("name")
    }
    // Including "name" would set the name back to tokenName in some cases
  }, [tokenName, contractId, setValue, trigger, errors])

  return (
    <FormControl isInvalid={!!errors?.name}>
      <Input
        maxWidth="sm"
        type="text"
        placeholder="name"
        {...register("name", {
          required: "This field is required",
          validate: async (value) =>
            getDataOfDrop(chainId, slugify(value.toString())).then(
              ({ tokenAddress }) =>
                tokenAddress === ZERO_ADDRESS || "Drop already exists"
            ),
          onChange: (value) => setValue("urlName", slugify(value.toString())),
        })}
      />
      {errors?.name?.message && (
        <FormErrorMessage>{errors.name.message}</FormErrorMessage>
      )}
    </FormControl>
  )
}

export default NameInput
