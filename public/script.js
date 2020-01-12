const copyBobPubKey = () => {
  var copyText = document.getElementById("bob-public-key").innerHTML;
  navigator.clipboard.writeText(copyText).then(res => console.log(res)).catch(err => console.log(err));
};

window.onload = () => {
  const socket = io();
  const conversation = document.getElementById("conversation");
  const textBox = document.getElementById("text-box");

  const getMessageEncoding = () => {
    const messageBox = document.querySelector("#text-box");
    let message = messageBox.value;
    let enc = new TextEncoder();
    return enc.encode(message);
  };

  const encryptMessage = async (key) => {
    let encoded = getMessageEncoding();
    return await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      key,
      encoded
    );
  };

  const decryptMessage = async (key, message) => {
    let decrypted = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      key,
      message
    );

    let dec = new TextDecoder();

    return dec.decode(decrypted);
  };

  const ab2str = buf => {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  const str2ab = (str) => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  };

  const importPublicKey = key => {
    const binaryDerString = window.atob(key);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);

    return window.crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-512"
      },
      true,
      ["encrypt"]
    );
  };

  const exportCryptoKey = async key => {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);

    return exportedAsBase64;
  };

  let privateKey;
  window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-512",
    },
    true,
    ["encrypt", "decrypt"]
  ).then(async (keyPair) => {
    privateKey = keyPair.privateKey;
    const sendBtn = document.getElementById("send-btn");
    const bobPublicKey = await exportCryptoKey(keyPair.publicKey);
    document.getElementById('bob-public-key').innerHTML = bobPublicKey;
    socket.emit('join', bobPublicKey);
    sendBtn.addEventListener("click", async() => {
      sendText();
    });
  });

  socket.on('message', async (msg) => {
    const message = await decryptMessage(privateKey, msg);
    conversation.scrollTop = conversation.scrollHeight;
    conversation.insertAdjacentHTML('beforeend', `<p class="alice-says">${message}</p>`);
  });

  textBox.addEventListener('keydown', function(e) {
    if(e.keyCode === 13 && e.metaKey) {
      sendText();
    }
  });

  const sendText = async() => {
    const alicePubStrKey = document.getElementById('alice-public-key').value;
    if (alicePubStrKey.length !== 736) {alert('Invalid key'); return;}
    const key = await importPublicKey(alicePubStrKey);
    let message = await encryptMessage(key);
    if (message.byteLength !== 512) {alert('Invalid Key'); return;}
    let unEncMessage = textBox.value;
    conversation.insertAdjacentHTML('beforeend', `<p class="bob-says">${unEncMessage}</p>`);
    conversation.scrollTop = conversation.scrollHeight;
    textBox.value = '';
    socket.emit('message', {to: alicePubStrKey, message});
    // window.location.replace('https://www.bbc.co.uk/');
  }

};
