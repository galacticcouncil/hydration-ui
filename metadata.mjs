import { writeFileSync } from "fs"
import pkg from "websocket"

const { w3cwebsocket } = pkg;

const main = () => {
  const endpoint = "wss://rpc.basilisk.cloud"

  console.log("Connecting to ", endpoint)
  const ws = new w3cwebsocket(endpoint)

  ws.onopen = () => {
    ws.send(
      '{"id":"1","jsonrpc":"2.0","method":"state_getMetadata","params":[]}',
    )
  }

  ws.onmessage = (msg) => {

    const metadata = JSON.parse(msg.data).result;
    writeFileSync('./src/metadata/static-latest.ts', `export default '${metadata}'`);
    writeFileSync('./src/metadata/static-latest.json', msg.data);

    console.log("Done")
    process.exit(0)
  }
}

main()
