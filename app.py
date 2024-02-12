
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from flask import Flask, request, jsonify
from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__)

# Load dataset
titanic_data = pd.read_csv('titanic.csv')

# Handle missing values
titanic_data = titanic_data.dropna(subset=['Embarked'])
titanic_data['Age'].fillna(titanic_data['Age'].median(), inplace=True)
# Encode categorical variables
titanic_data = pd.get_dummies(titanic_data, columns=['Sex', 'Embarked'], drop_first=True)

# Select features and target variable
X = titanic_data[['Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'Sex_male', 'Embarked_Q', 'Embarked_S']]
y = titanic_data['Survived']
#Train Test Split 
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)



# Create and train the K-Nearest Neighbors model
model = KNeighborsClassifier(n_neighbors=3)  # You can adjust the number of neighbors
model.fit(X_train, y_train)
knn_prediction = model.predict(X_test)
accuracy = accuracy_score(y_test, knn_prediction)
print("K-Nearest Neighbors Model:")
print(f'Accuracy: {accuracy:.2f}')
# Confusion Matrix and Classification Report
class_report_knn = classification_report(y_test, knn_prediction)
print('Classification Report:')
print(class_report_knn)

# Initialize model weights (assuming three models)
model_weights = np.ones(3) / 3  # Initial equal weights for each model

# Adjust weights based on accuracy relative to consensus
def update_weights(model_weights, individual_accuracies, consensus_accuracy):
    alpha = 0.1  # Weight adjustment factor

    for i in range(len(model_weights)):
        model_weights[i] *= np.exp(alpha * (individual_accuracies[i] - consensus_accuracy))

    # Normalize weights to sum to 1
    model_weights /= np.sum(model_weights)

    return model_weights

individual_accuracies = [0.77, 0.82, 0.71]  # Replace with actual accuracies
consensus_accuracy = np.mean(individual_accuracies)
model_weights = update_weights(model_weights, individual_accuracies, consensus_accuracy)
print(f"Updated Model Weights: {model_weights}")



def aliveOrDead(number):
    if(number==0):
        return 'dead'
    else:
        return 'alive'
    
#API part
# Route for prediction
@app.route('/health',methods=['GET'])
def health():
    response = {
            'message' : "Alive",
            'status' : 200
            }
    return jsonify(response)
         

@app.route('/predict', methods=['GET'])
def predict():
    pclass = 1
    age = 54.2
    sibsp = 0
    parch = 0
    fare = 68.2
    sex = 0
    embarked_q = 0
    embarked_s = 0
    method = 'knn'
    try :
        # Extracting input parameters from the request query parameters
        pclass = int(request.args.get('pclass'))
        age = float(request.args.get('age'))
        sibsp = int(request.args.get('sibsp'))
        parch = int(request.args.get('parch'))
        fare = float(request.args.get('fare'))
        sex = int(request.args.get('sex_male'))
        embarked_q = int(request.args.get('embarked_Q'))
        embarked_s = int(request.args.get('embarked_S'))
        method = str(request.args.get('method'))

        # Make a prediction using the model
        input_data = pd.DataFrame([[pclass, age, sibsp, parch, fare, sex, embarked_q,embarked_s]],
                                  columns=['Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'Sex_male', 'Embarked_Q','Embarked_S'])
        

        prediction = aliveOrDead(int(model.predict(input_data)[0]))

        # Standardized API response
        
        response = {
            'message' : f"Prediction with {method} model successful : {prediction}. Accuracy of the test : {accuracy}",
            'status' : 200
            }
        return jsonify(response)

    except Exception as e:
        # Handle errors and provide a standardized error response
        error_message = str(e)
        response = {
            'message' : f"Prediction failed: {error_message}",
            'status' : 404
        }
        return jsonify(response)
    
app.run(host="0.0.0.0")
