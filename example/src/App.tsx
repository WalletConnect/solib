import {
  connect,
  signMessage,
  getBalance,
  signAndSendTransaction,
} from "solib";
import { useCallback, useState } from "react";
import "./App.css";

function App() {
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
        });
      }
    },
    []
  );

  return (
    <div className="App">
      <button onClick={onClick}>Connect</button>
      <address>{address}</address>
      <address>Balance: {balance}</address>
      {address && (
        <div>
          <div>
            <input
              type="text"
              onChange={({ target }) => {
                console.log({ val: target.value });
                setToAddress(target.value);
              }}
            ></input>
            <input
              type="number"
              onChange={({ target }) => setAmount(Number(target.value))}
            ></input>
            <button onClick={() => onSendTransaction(toAddress!, amount)}>
              Send Transaction{" "}
            </button>
          </div>
          <div>
            <input
              type="text"
              onChange={({ target }) => setMessage(target.value)}
            ></input>
            <button onClick={() => onSign(message)}>Sign Message</button>
            <address>Signature: {signature}</address>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
