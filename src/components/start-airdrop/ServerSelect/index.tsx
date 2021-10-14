import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Select,
} from "@chakra-ui/react"
import { Check } from "phosphor-react"
import { useEffect, useMemo } from "react"
import { useFormContext, useFormState, useWatch } from "react-hook-form"
import useChannels from "./hooks/useChannels"

const ServerSelect = () => {
  const { register, setValue } = useFormContext()
  const inviteLink = useWatch<{ invite_link: string }>({
    name: "invite_link",
    defaultValue: "",
  })
  const { errors } = useFormState()

  const [{ serverId, channels }, loading] = useChannels(
    errors.invite_link?.message?.length > 0 ? "" : inviteLink
  )

  useEffect(() => setValue("serverId", serverId), [serverId])

  const isBotAdded = useMemo(
    () => Object.keys(channels ?? {})?.length > 0 && serverId > 0,
    [channels, serverId]
  )

  const shouldAddBot = useMemo(
    () => channels === null && serverId === null,
    [channels, serverId]
  )

  return (
    <Grid gridTemplateColumns="repeat(3, 1fr)" gap={5}>
      <FormControl isInvalid={errors?.invite_link}>
        <FormLabel>1. Paste invite link</FormLabel>
        <Input
          {...register("invite_link", {
            required: "This field is required.",
            pattern: {
              value: /^https:\/\/discord.gg\/[a-z0-9]{8}$/i,
              message: "Not a valid discord invite link",
            },
          })}
        />
        <FormErrorMessage>
          {errors.invite_link?.message ?? "Invalid invite"}
        </FormErrorMessage>
      </FormControl>

      <FormControl isDisabled={!isBotAdded && !shouldAddBot}>
        <FormLabel>2. Add bot to server</FormLabel>
        {!isBotAdded ? (
          <Button
            h="10"
            w="full"
            {...(shouldAddBot
              ? {
                  as: "a",
                  href: `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`,
                  target: "_blank",
                }
              : {})}
            isLoading={loading}
            disabled={!shouldAddBot}
          >
            Add bot
          </Button>
        ) : (
          <Button h="10" w="full" disabled rightIcon={<Check />}>
            Bot added
          </Button>
        )}

        <FormErrorMessage>
          {errors?.invite_link?.message ?? "Invalid invite"}
        </FormErrorMessage>
      </FormControl>

      <FormControl isDisabled={!isBotAdded}>
        <FormLabel>3. Select channel</FormLabel>
        <Select {...register("channel")}>
          {Object.entries(channels ?? {}).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
        <FormErrorMessage>
          {errors?.invite_link?.message ?? "Invalid invite"}
        </FormErrorMessage>
      </FormControl>
    </Grid>
  )
}

export default ServerSelect
