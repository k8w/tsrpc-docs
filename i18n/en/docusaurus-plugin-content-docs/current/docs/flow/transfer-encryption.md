---
sidebar_position: 4
---

# Transfer encryption

## Thinking

TSRPC transmission is binary, so the encryption and decryption algorithm should be binary-based (`Uint8Array`) as well.
There are many mature algorithms that can be used directly (e.g. `RC4`, `AES`, `RES`, etc.), but you can also implement your own private algorithms.

On both the server and client side, there are `preSendBufferFlow` and `preRecvBufferFlow` that allow you to process the binary before sending and receiving it.
So you only need to encrypt the Buffer in `preSendBufferFlow` and decrypt the Buffer in `preRecvBufferFlow` to encrypt the transmission.

You can also share this code in the `shared` directory if the encryption and decryption logic is the same on the front and back ends.

## Implementation

### Encryption and decryption algorithm

Let's implement a simple encryption algorithm.

- Encrypt: take each byte in the binary stream `+1`
- Decrypt: each byte in the binary stream is `-1`

:::note
In `Uint8Array`, `0 - 1 === 255` and `255 + 1 === 0`, so the above algorithm works under boundary conditions.
:::

Since the same encryption and decryption operations are performed on both front and back ends, we share this algorithm in the `shared` directory as follows.

```ts title="shared/models/EncryptUtil"
export class EncryptUtil {
  // encrypt
  static encrypt(buf: Uint8Array): Uint8Array {
    for (let i = 0; i < buf.length; ++i) {
      buf[i] -= 1
    }
    return buf
  }

  // Decrypt
  static decrypt(buf: Uint8Array): Uint8Array {
    for (let i = 0; i < buf.length; ++i) {
      buf[i] += 1
    }
    return buf
  }
}
```

### Extending workflows with Flow

Now that the encryption algorithm is implemented, we use Flow to extend the server and client to automatically encrypt and decrypt binary data before sending and receiving it.

#### server-side

```ts
// Encrypt before sending
server.flows.preSendBufferFlow.push((v) => {
  v.buf = EncryptUtil.encrypt(v.buf)
  return v
})
// Decrypt before receiving
server.flows.preRecvBufferFlow.push((v) => {
  v.buf = EncryptUtil.decrypt(v.buf)
  return v
})
```

#### client

```ts
// Encrypt before sending
client.flows.preSendBufferFlow.push((v) => {
  v.buf = EncryptUtil.encrypt(v.buf)
  return v
})
// Decrypt before receiving
client.flows.preRecvBufferFlow.push((v) => {
  v.buf = EncryptUtil.decrypt(v.buf)
  return v
})
```

In this way, the transfer process will be automatically encrypted and decrypted using `EncryptUtil`, and you can see the result when you open your browser.

**Before encryption:**
! [](assets/before-encrypt.png)

**After encryption:** !
! [](assets/after-encrypt.png)

The encryption algorithm in this example is very simple to implement, you can implement more complex algorithms yourself, return a new `Uint8Array` or even change the length.

## Full example

See: https://github.com/k8w/tsrpc-examples/tree/main/examples/transfer-encryption
