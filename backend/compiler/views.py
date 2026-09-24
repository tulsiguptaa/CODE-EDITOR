import base64
import requests
import time

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


JUDGE0_URL = "https://ce.judge0.com"


@api_view(["POST"])
def run_code(request):

    code = request.data.get("code")
    language_id = request.data.get("language_id")
    stdin = request.data.get("stdin", "")

    if not code:
        return Response(
            {"error": "Code is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not language_id:
        return Response(
            {"error": "Language ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        language_id = int(language_id)
    except (ValueError, TypeError):
        return Response(
            {"error": "Invalid language ID"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if stdin is None:
        stdin = ""
    elif not isinstance(stdin, str):
        return Response(
            {"error": "stdin must be a string"},
            status=status.HTTP_400_BAD_REQUEST
        )


    # -----------------------------
    # Send code to Judge0
    # -----------------------------

    submission_data = {
        "source_code": base64.b64encode(code.encode("utf-8")).decode("ascii"),
        "language_id": language_id,
        "stdin": base64.b64encode(stdin.encode("utf-8")).decode("ascii")
    }


    try:

        response = requests.post(
            f"{JUDGE0_URL}/submissions",
            params={"base64_encoded": "true"},
            json=submission_data,
            timeout=15
        )


        # If Judge0 rejects request
        if response.status_code != 201:

            return Response(
                {
                    "error": "Judge0 rejected the submission",
                    "judge0_status": response.status_code,
                    "judge0_response": response.text
                },
                status=response.status_code
            )


        submission = response.json()

        token = submission.get("token")


        if not token:

            return Response(
                {
                    "error": "Judge0 did not return a submission token",
                    "response": submission
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


        # -----------------------------
        # Wait for execution
        # -----------------------------

        for _ in range(20):

            result_response = requests.get(
                f"{JUDGE0_URL}/submissions/{token}",
                timeout=10
            )

            if not result_response.ok:
                return Response(
                    {
                        "error": "Unable to read Judge0 result",
                        "judge0_status": result_response.status_code,
                        "judge0_response": result_response.text
                    },
                    status=status.HTTP_502_BAD_GATEWAY
                )

            result = result_response.json()


            status_id = result.get("status", {}).get("id")


            # 1 = In Queue
            # 2 = Processing
            # Other values = finished

            if status_id not in [1, 2]:

                return Response(result)


            time.sleep(0.5)


        return Response(
            {
                "error": "Code execution timed out",
                "details": "The program did not finish. Check for an input loop or provide all expected stdin values."
            },
            status=status.HTTP_408_REQUEST_TIMEOUT
        )


    except requests.exceptions.RequestException as e:

        return Response(
            {
                "error": "Unable to connect to Judge0",
                "details": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )