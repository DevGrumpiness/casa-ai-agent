import argparse
import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

load_dotenv(ROOT_DIR / ".env")

VAPI_API_URL = "https://api.vapi.ai"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def require_env(name: str) -> str:
    value = os.getenv(name)

    if not value:
        raise RuntimeError(
            f"Missing environment variable: {name}"
        )

    return value


def replace_env_vars(value):
    if isinstance(value, dict):
        return {
            key: replace_env_vars(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [
            replace_env_vars(item)
            for item in value
        ]

    if isinstance(value, str):
        if value.startswith("${") and value.endswith("}"):
            variable_name = value[2:-1]
            return require_env(variable_name)

    return value


def update_tool(
    tool_id: str,
    config: dict,
    headers: dict,
) -> None:
    response = requests.patch(
        f"{VAPI_API_URL}/tool/{tool_id}",
        headers=headers,
        json=config,
        timeout=30,
    )

    response.raise_for_status()

    print("✓ Vapi tool updated")


def update_assistant(
    assistant_id: str,
    config: dict,
    headers: dict,
) -> None:
    response = requests.patch(
        f"{VAPI_API_URL}/assistant/{assistant_id}",
        headers=headers,
        json=config,
        timeout=30,
    )

    if not response.ok:
        print("\n✗ Vapi assistant update failed")
        print(f"HTTP {response.status_code}")
        print("Response:")
        print(response.text)
        response.raise_for_status()

    print("✓ Vapi assistant updated")


def main():
    parser = argparse.ArgumentParser(
        description="Render and sync Vapi configuration."
    )

    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply the configuration to Vapi.",
    )

    args = parser.parse_args()

    tool_config = load_json(
        BASE_DIR / "tools" / "set-reservation.json"
    )

    assistant_config = load_json(
        BASE_DIR / "assistant.json"
    )

    tool_config = replace_env_vars(tool_config)
    assistant_config = replace_env_vars(
        assistant_config
    )

    print("TOOL CONFIG:")
    print(
        json.dumps(
            tool_config,
            indent=2,
            ensure_ascii=False,
        )
    )

    print("\nASSISTANT CONFIG:")
    print(
        json.dumps(
            assistant_config,
            indent=2,
            ensure_ascii=False,
        )
    )

    if not args.apply:
        print(
            "\ntest run only. "
        )
        print(
            "Run with --apply to update Vapi."
        )
        return

    vapi_private_key = require_env(
        "VAPI_PRIVATE_KEY"
    )

    vapi_tool_id = require_env(
        "VAPI_TOOL_ID"
    )

    vapi_assistant_id = require_env(
        "VAPI_ASSISTANT_ID"
    )

    headers = {
        "Authorization": (
            f"Bearer {vapi_private_key}"
        ),
        "Content-Type": "application/json",
    }

    print("\nApplying configuration...")

    update_tool(
        tool_id=vapi_tool_id,
        config=tool_config,
        headers=headers,
    )

    update_assistant(
        assistant_id=vapi_assistant_id,
        config=assistant_config,
        headers=headers,
    )

    print("✓ Vapi sync completed")


if __name__ == "__main__":
    main()