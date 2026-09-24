import base64
from unittest.mock import Mock, patch

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from .views import run_code


class RunCodeTests(TestCase):
	def setUp(self):
		self.factory = APIRequestFactory()

	@patch("compiler.views.requests.get")
	@patch("compiler.views.requests.post")
	def test_forwards_complete_stdin_once(self, post, get):
		post.return_value = Mock(status_code=201)
		post.return_value.json.return_value = {"token": "abc"}
		get.return_value = Mock(
			ok=True,
			status_code=200,
			json=lambda: {
				"status": {"id": 3, "description": "Accepted"},
				"stdout": "2\n",
			},
		)

		request = self.factory.post(
			"/api/compiler/run/",
			{
				"code": "print(input())",
				"language_id": 71,
				"stdin": "5\n1 3 5 7 9\n5",
			},
			format="json",
		)

		response = run_code(request)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["stdout"], "2\n")
		post.assert_called_once_with(
			"https://ce.judge0.com/submissions",
			params={"base64_encoded": "true"},
			json={
				"source_code": base64.b64encode(b"print(input())").decode("ascii"),
				"language_id": 71,
				"stdin": base64.b64encode(b"5\n1 3 5 7 9\n5").decode("ascii"),
			},
			timeout=15,
		)

	def test_rejects_non_string_stdin(self):
		request = self.factory.post(
			"/api/compiler/run/",
			{"code": "print(1)", "language_id": 71, "stdin": [5]},
			format="json",
		)

		response = run_code(request)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data["error"], "stdin must be a string")

# Create your tests here.
