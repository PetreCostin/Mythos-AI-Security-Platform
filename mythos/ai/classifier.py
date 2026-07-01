"""Multi-class threat classifier."""

from __future__ import annotations

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


class ThreatClassifier:
    """Text classifier for threat categories."""

    def __init__(self) -> None:
        self._vectorizer = TfidfVectorizer()
        self._model = LogisticRegression(max_iter=300)
        self._fitted = False

    def fit(self, samples: list[str], labels: list[str]) -> None:
        """Fits classifier with labeled samples."""
        features = self._vectorizer.fit_transform(samples)
        self._model.fit(features, labels)
        self._fitted = True

    def predict(self, text: str) -> str:
        """Predicts threat class for text."""
        if not self._fitted:
            return "unknown"
        features = self._vectorizer.transform([text])
        return str(self._model.predict(features)[0])

    def predict_scores(self, text: str) -> dict[str, float]:
        """Returns class probability scores."""
        if not self._fitted:
            return {"unknown": 1.0}
        features = self._vectorizer.transform([text])
        probabilities = self._model.predict_proba(features)[0]
        return {
            label: float(probabilities[index]) for index, label in enumerate(self._model.classes_)
        }
