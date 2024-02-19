from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

flask_server_url = "http://<ngrok_url>/predict"

@app.route('/predict', methods=['GET'])
def get_prediction():
    try:
        data = request.get_json()
        response = requests.get(flask_server_url, json=data)

        if response.status_code == 200:
            result = response.json()
            survival_probabilities = result.get('survival_probabilities', {})

            response = {
                'message': "Prediction successful",
                'survival_probabilities': survival_probabilities,
                'status': 200
            }
            return jsonify(response)
        else:
            error_message = response.text
            response = {
                'message': f"Error from Flask server: {error_message}",
                'status': 500
            }
            return jsonify(response)

    except Exception as e:
        error_message = str(e)
        response = {
            'message': f"Prediction failed: {error_message}",
            'status': 404
        }
        return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
