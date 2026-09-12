import re

MASK_CHAR = "\u2022"
_VISIBLE_NAME_PREFIX = 2
_VISIBLE_PHONE_SUFFIX = 3


def _mask_name(name: str) -> str:
    words = name.split(" ")
    masked_words = []

    for index, word in enumerate(words):
        if not word:
            masked_words.append(word)
            continue

        if index == 0 and len(word) > _VISIBLE_NAME_PREFIX:
            visible = word[:_VISIBLE_NAME_PREFIX]
            masked_words.append(visible + MASK_CHAR * (len(word) - _VISIBLE_NAME_PREFIX))
        else:
            masked_words.append(MASK_CHAR * len(word))

    return " ".join(masked_words)


def _mask_phone_number(phone: str) -> str:
    match = re.match(r"^(\+?\d{1,3})(\D*)(.*)$", phone)
    if not match:
        return MASK_CHAR * len(phone)

    prefix, separator, rest = match.groups()
    digit_indexes = [index for index, char in enumerate(rest) if char.isdigit()]
    keep = set(digit_indexes[-_VISIBLE_PHONE_SUFFIX:])

    masked_rest = "".join(
        char if (not char.isdigit()) or index in keep else MASK_CHAR
        for index, char in enumerate(rest)
    )

    return f"{prefix}{separator}{masked_rest}"


def mask_reservation(reservation: dict) -> dict:
    masked = dict(reservation)

    if masked.get("name"):
        masked["name"] = _mask_name(masked["name"])

    if masked.get("phone_number"):
        masked["phone_number"] = _mask_phone_number(masked["phone_number"])

    masked["comment"] = None

    return masked
