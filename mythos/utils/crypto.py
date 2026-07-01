"""Cryptographic utility helpers."""

from __future__ import annotations

import hashlib
import hmac

from cryptography.fernet import Fernet


def hash_text(value: str) -> str:
    """Returns SHA-256 hash for a string."""
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def verify_hash(value: str, digest: str) -> bool:
    """Compares string hash with timing-safe check."""
    return hmac.compare_digest(hash_text(value), digest)


def encrypt_text(value: str, key: bytes) -> str:
    """Encrypts text with Fernet key."""
    return Fernet(key).encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_text(value: str, key: bytes) -> str:
    """Decrypts text with Fernet key."""
    return Fernet(key).decrypt(value.encode("utf-8")).decode("utf-8")
