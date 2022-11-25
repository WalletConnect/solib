import {
  connect,
  signMessage,
  disconnect,
  getBalance,
  signAndSendTransaction,
  getConnectorIsAvailable,
  PhantomConnector,
  watchAddress,
  getFeeForMessage,
  getTransaction,
  watchTransaction,
  fetchName,
  fetchAddressFromDomain,
  getAccount
} from '@walletconnect/solib'
import { useCallback, useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Flex,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  useToast
} from '@chakra-ui/react'

function Home() {
  const toast = useToast()
  console.log('Phantom is ready', getConnectorIsAvailable(PhantomConnector.connectorName()))
  const [address, setAddress] = useState<string | undefined>('')
  const [name, setName] = useState<string | undefined>('')
  const [balance, setBalance] = useState<string | undefined>('')
  const [signature, setSignature] = useState<string | undefined>('')
  const [message, setMessage] = useState<string | undefined>('')
  const [toAddress, setToAddress] = useState<string | undefined>('')
  const [amount, setAmount] = useState<number>(0)

  useEffect(() => {
    console.log('ya hey')
    watchAddress(address2 => {
      console.log('Got address', address2)
      setAddress(address2)
    })
  }, [setAddress])

  useEffect(() => {
    if (address) {
      getBalance().then(value => setBalance(value?.decimals.toString() ?? '0'))
      fetchName('FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ').then(name2 => {
        setName(name2?.reverse ?? address)
      })
      fetchAddressFromDomain('bonfida.sol').then(addr => {
        console.log({ addressFromDomain: addr })
      })
      getAccount().then(acc => console.log({ accthing: acc?.rentEpoch }))
    }
  }, [address])

  const onClick = useCallback(() => {
    connect().then(publicKey => {
      console.log({ publicKey })
    })
  }, [])

  const onSign = useCallback((message2: string | undefined) => {
    if (message2)
      signMessage(message2).then(signature2 => {
        setSignature(signature2 ?? '')
      })
  }, [])

  const onSendTransaction = useCallback(
    (to: string, amountInLamports: number) => {
      console.log({ to, amountInLamports })

      getFeeForMessage('transfer', {
        to,
        amountInLamports,
        feePayer: 'from'
      }).then(fee => console.log({ fee }))

      if (to && amountInLamports)
        signAndSendTransaction('transfer', {
          to,
          amountInLamports,
          feePayer: 'from'
        }).then(async result => {
          console.log({ result })
          if (result)
            await watchTransaction(result, () => {
              getTransaction(result).then(tra => console.log({ tra }))
              toast({
                status: 'success',
                title: 'Transaction successful'
              })
            })
        })
    },
    [toast]
  )

  return (
    <div className="App">
      <Heading mb="5em">Solib Example</Heading>
      <Flex gap="10" flexDirection="column" width={'100%'}>
        {!address && <Button onClick={onClick}>Connect</Button>}
        {address && (
          <Flex gap="5" flexDirection="column" alignItems={'flex-start'}>
            <Badge fontSize="1em" fontStyle={'italic'}>
              Address {address}
            </Badge>
            <Badge fontSize="1em" fontStyle={'italic'}>
              Balance: {balance}
            </Badge>
            <Button onClick={async () => disconnect()}>Disconnect</Button>
          </Flex>
        )}
        {address && (
          <Flex gap="5" flexDirection="column" alignItems={'flex-start'}>
            <Flex justifyContent="space-between" alignItems="center" width="100%">
              <Flex gap="2" flexDirection="column">
                <Input
                  type="text"
                  placeholder="Send to.."
                  onChange={({ target }) => {
                    setToAddress(target.value)
                  }}
                ></Input>
                <NumberInput
                  placeholder="Amount to send"
                  onChange={(_, value) => {
                    setAmount(value)
                  }}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>
              <Button onClick={() => onSendTransaction(toAddress ?? '', amount)}>
                Send Transaction
              </Button>
            </Flex>
            <Flex flexDirection="column" gap="3" width="100%">
              <Flex justifyContent="space-between" width="100%">
                <Flex>
                  <Input
                    type="text"
                    placeholder="Message to sign..."
                    onChange={({ target }) => setMessage(target.value)}
                  ></Input>
                </Flex>
                <Button onClick={() => onSign(message)}>Sign Message</Button>
              </Flex>
              <address>Signature: {signature}</address>
            </Flex>
          </Flex>
        )}
        {name && <Flex>SNS Name: {name}</Flex>}
      </Flex>
    </div>
  )
}

export default Home
