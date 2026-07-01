"""Settings tests."""

from mythos.config.settings import Settings


def test_settings_define_default_api_prefix() -> None:
    settings = Settings()
    assert settings.api_prefix == "/api/v1"
