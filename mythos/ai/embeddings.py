"""Vector embeddings for semantic threat similarity."""

from __future__ import annotations

import math


class EmbeddingEngine:
    """Deterministic lightweight embedding engine."""

    def __init__(self, dimensions: int = 32) -> None:
        self.dimensions = dimensions

    def embed_text(self, text: str) -> list[float]:
        """Embeds text into a fixed-size dense vector."""
        vector = [0.0] * self.dimensions
        for token in text.lower().split():
            index = hash(token) % self.dimensions
            vector[index] += 1.0
        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]


def cosine_similarity(vector_a: list[float], vector_b: list[float]) -> float:
    """Computes cosine similarity between two vectors."""
    if len(vector_a) != len(vector_b):
        raise ValueError("Vectors must have the same length.")
    numerator = sum(a * b for a, b in zip(vector_a, vector_b, strict=True))
    denominator_a = math.sqrt(sum(a * a for a in vector_a)) or 1.0
    denominator_b = math.sqrt(sum(b * b for b in vector_b)) or 1.0
    return numerator / (denominator_a * denominator_b)
