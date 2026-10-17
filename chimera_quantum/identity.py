from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import hashlib
import os

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

SIGNING_ALGORITHM = "ed25519"
AETHER_IDENTITY_SOURCE = "aixaria0/aether-runtime@93e6f7c6e4276ad92e2fcccbae8d6ab8fda21a1e"


def domain_message(domain: str, payload: bytes) -> bytes:
    """Aether-compatible domain framing: u64be(len(domain UTF-8)) || domain || payload."""
    if "\x00" in domain:
        raise ValueError("NUL is not allowed in a signature domain")
    domain_bytes = domain.encode("utf-8")
    return len(domain_bytes).to_bytes(8, "big", signed=False) + domain_bytes + payload


@dataclass(frozen=True)
class IdentityInfo:
    algorithm: str
    public_key_hex: str
    fingerprint_sha256: str


class PersistentEd25519Identity:
    """Persistent 32-byte Ed25519 seed with Aether-compatible signing semantics."""

    def __init__(self, key: Ed25519PrivateKey):
        self._key = key

    @classmethod
    def load_or_create(cls, path: str | Path) -> "PersistentEd25519Identity":
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.exists():
            raw = path.read_bytes()
            if len(raw) != 32:
                raise ValueError("identity key must contain exactly 32 bytes")
            if os.name == "posix" and (path.stat().st_mode & 0o077):
                raise PermissionError("identity key permissions must be owner-only")
            return cls(Ed25519PrivateKey.from_private_bytes(raw))

        key = Ed25519PrivateKey.generate()
        raw = key.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        )
        flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
        fd = os.open(path, flags, 0o600)
        try:
            with os.fdopen(fd, "wb", closefd=True) as fh:
                fh.write(raw)
                fh.flush()
                os.fsync(fh.fileno())
        except Exception:
            try:
                path.unlink(missing_ok=True)
            finally:
                raise
        return cls(key)

    def info(self) -> IdentityInfo:
        public = self._key.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        )
        return IdentityInfo(
            algorithm=SIGNING_ALGORITHM,
            public_key_hex=public.hex(),
            fingerprint_sha256=hashlib.sha256(public).hexdigest(),
        )

    def sign_domain(self, domain: str, payload: bytes) -> str:
        return self._key.sign(domain_message(domain, payload)).hex()

    @staticmethod
    def verify_domain(public_key_hex: str, signature_hex: str, domain: str, payload: bytes) -> bool:
        try:
            public = bytes.fromhex(public_key_hex)
            signature = bytes.fromhex(signature_hex)
            if len(public) != 32 or len(signature) != 64:
                return False
            Ed25519PublicKey.from_public_bytes(public).verify(signature, domain_message(domain, payload))
            return True
        except (ValueError, TypeError):
            return False

    @staticmethod
    def fingerprint_public_key_hex(public_key_hex: str) -> str | None:
        try:
            public = bytes.fromhex(public_key_hex)
        except ValueError:
            return None
        if len(public) != 32:
            return None
        return hashlib.sha256(public).hexdigest()
