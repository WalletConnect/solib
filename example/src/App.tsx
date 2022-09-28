import {
  connect,
  signMessage,
  getBalance,
  signAndSendTransaction,
  watchTransaction,
} from "solib";
import { useCallback, useState } from "react";
import "./App.css";
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
  useToast,
} from "@chakra-ui/react";

function App() {
  const toast = useToast();
  const [address, setAddress] = useState<string | undefined>("");
  const [balance, setBalance] = useState<string | undefined>("");
  const [signature, setSignature] = useState<string | undefined>("");
  const [message, setMessage] = useState<string | undefined>("");
  const [toAddress, setToAddress] = useState<string | undefined>("");
  const [amount, setAmount] = useState<number>(0);
  const onClick = useCallback(() => {
    connect()
      .then((publicKey) => setAddress(publicKey!))
      .then(() => {
        getBalance().then((value) => setBalance(value.toString()));
      });
  }, []);

  const onSign = useCallback((message: string | undefined) => {
    if (message) {
      signMessage(message).then(({ signature }) => {
        setSignature(signature);
      });
    }
  }, []);

  const onSendTransaction = useCallback(
    (to: string, amountInLamports: number) => {
      console.log({ to, amountInLamports });
      if (to && amountInLamports) {
        signAndSendTransaction("transfer", {
          to,
          amountInLamports,
          feePayer: "from",
        }).then((result) => {
          console.log({ result });
          watchTransaction(result!, () => {
            toast({
              status: "success",
              title: "Transaction successful",
            });
          });
        });
      }
    },
    []
  );

  return (
    <div className="App">
      <Heading mb="5em">Solib Example</Heading>
      <Flex gap="10" flexDirection="column" width={"100%"}>
        {!address && <Button onClick={onClick}>Connect</Button>}
        {address && (
          <Flex gap="5" flexDirection="column" alignItems={"flex-start"}>
            <Badge fontSize="1em" fontStyle={"italic"}>
              Address {address}
            </Badge>
            <Badge fontSize="1em" fontStyle={"italic"}>
              Balance: {balance}
            </Badge>
          </Flex>
        )}
        {address && (
          <Flex gap="5" flexDirection="column" alignItems={"flex-start"}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Flex gap="2" flexDirection="column">
                <Input
                  type="text"
                  placeholder="Send to.."
                  onChange={({ target }) => {
                    setToAddress(target.value);
                  }}
                ></Input>
                <NumberInput
                  placeholder="Amount to send"
                  onChange={(_, value) => {
                    setAmount(value);
                  }}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>
              <Button onClick={() => onSendTransaction(toAddress!, amount)}>
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
      </Flex>
    </div>
  );
}

export default App;
