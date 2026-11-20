# Release signing — CyberRiskGuardian Desktop

Every CyberRiskGuardian Desktop release published after 20 November 2026 is signed with the author's
[minisign](https://jedisct1.github.io/minisign/) key. The signature is the `.zip.minisig` file published next to each
release ZIP and its `.zip.sha256` checksum.

## The public key

```
RWR57THy8GZvqaD2lfamsmwouCcN+NhTPZQ8cumNeZvFZF8WUINkjg84
```

- Algorithm: Ed25519 (minisign).
- Key ID: `A96F66F0F231ED79`.
- Created: 20 November 2026, by Marc-André Léger. The secret key never leaves the author's computer.

The same key is pinned in the application (`desktop/app/serve.py`, `UPDATE_MINISIGN_PUBKEY`) and published on
cyberriskguardian.ca, so you can compare the three.

## What the application does

*Help → About & versions → Check for updates* keeps a downloaded release only if its signature verifies against the
pinned key. A release without a signature, or with one that does not verify, is refused. Versions 1.9.5 and earlier pin
no key and check the SHA-256 checksum only.

## Checking a release by hand

With minisign installed (macOS: `brew install minisign`; Windows: `scoop install minisign` or the release from
the minisign site; Linux: your package manager), in the folder that holds the ZIP and its `.minisig`:

```bash
minisign -Vm CyberRiskGuardian_Desktop_vX.Y.Z-beta.zip -P RWR57THy8GZvqaD2lfamsmwouCcN+NhTPZQ8cumNeZvFZF8WUINkjg84
```

The answer must be `Signature and comment signature verified`, followed by the trusted comment naming the release.
Anything else means the file was altered or not signed by this key: do not install it.

## If the key changes

A new key is announced on cyberriskguardian.ca and in the release notes, and is pinned in a release signed with the
previous key while that key is still available. Copies of the public key from any other source are not authoritative.
