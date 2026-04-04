from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        details = response.data if isinstance(response.data, dict) else {"messages": response.data}
        response.data = {
            "success": False,
            "error": {
                "code": _get_error_code(response.status_code),
                "message": _get_error_message(details),
                "details": _get_error_details(details),
            },
        }

    return response


def _get_error_code(status_code: int) -> str:
    codes = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        429: "THROTTLED",
        500: "INTERNAL_ERROR",
    }
    return codes.get(status_code, f"ERROR_{status_code}")


def _get_error_message(details: dict) -> str:
    if "detail" in details:
        return str(details["detail"])
    if "non_field_errors" in details:
        errors = details["non_field_errors"]
        return str(errors[0]) if errors else "Validation error"
    return "Validation error"


def _get_error_details(details: dict) -> dict:
    field_errors = {}
    for key, value in details.items():
        if key in ("detail", "non_field_errors"):
            continue
        if isinstance(value, list):
            field_errors[key] = [str(v) for v in value]
        else:
            field_errors[key] = [str(value)]
    return field_errors
