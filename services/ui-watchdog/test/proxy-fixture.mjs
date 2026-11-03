import { createServer, connect } from "node:net"

// Real SOCKS5 forwarding to the test's loopback origin; clients send DNS names.
export async function socksFixture(t, originPort, { stalled = false } = {}) {
  const sockets = new Set(),
    destinations = []
  const server = createServer((socket) => {
    sockets.add(socket)
    socket.on("error", () => {})
    socket.on("close", () => sockets.delete(socket))
    if (stalled) return
    let stage = 0,
      buffer = Buffer.alloc(0)
    const read = (data) => {
      buffer = Buffer.concat([buffer, data])
      if (stage === 0) {
        if (buffer.length < 2 || buffer.length < 2 + buffer[1]) return
        buffer = buffer.subarray(2 + buffer[1])
        socket.write(Buffer.from([5, 0]))
        stage = 1
      }
      if (stage === 1 && buffer.length >= 5) {
        const domain = buffer[3] === 3
        const size = domain ? buffer[4] : buffer[3] === 1 ? 4 : 16
        const offset = domain ? 5 : 4
        if (buffer.length < offset + size + 2) return
        destinations.push({
          type: buffer[3],
          host: buffer.subarray(offset, offset + size).toString(),
          port: buffer.readUInt16BE(offset + size),
        })
        const rest = buffer.subarray(offset + size + 2)
        stage = 2
        socket.removeListener("data", read)
        const upstream = connect(originPort, "127.0.0.1", () => {
          socket.write(Buffer.from([5, 0, 0, 1, 127, 0, 0, 1, 0, 0]))
          if (rest.length) upstream.write(rest)
          socket.pipe(upstream).pipe(socket)
        })
        sockets.add(upstream)
        upstream.on("error", () => socket.destroy())
        upstream.on("close", () => {
          sockets.delete(upstream)
          socket.destroy()
        })
        socket.on("close", () => upstream.destroy())
      }
    }
    socket.on("data", read)
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const close = () => {
    for (const s of sockets) s.destroy()
    server.close()
  }
  t.after(close)
  return {
    url: `socks5h://127.0.0.1:${server.address().port}`,
    destinations,
    close,
  }
}
