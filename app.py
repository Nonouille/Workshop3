import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from flask import Flask, request, jsonify
from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__)

# Load dataset
titanic_data = pd.read_csv('titanic.csv')
# Explore the dataset
print(titanic_data.head())


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


### Random Forest test
rf_model = RandomForestClassifier(random_state=42)
rf_model.fit(X_train, y_train)
rf_predictions = rf_model.predict(X_test)
print("Random Forest Model:")
print("Accuracy:", accuracy_score(y_test, rf_predictions))
print("Classification Report:\n", classification_report(y_test, rf_predictions))


# Create Decision Tree model
dt_model = DecisionTreeClassifier(random_state=42,max_depth=3)
# Train the model
dt_model.fit(X_train, y_train)
# Predictions on the test set
y_pred = dt_model.predict(X_test)
# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f'Accuracy: {accuracy:.2f}')
# Confusion Matrix and Classification Report
conf_matrix = confusion_matrix(y_test, y_pred)
class_report = classification_report(y_test, y_pred)
print('Confusion Matrix:')
print(conf_matrix)
print('\nClassification Report:')
print(class_report)


#Visualize the decision tree
#from sklearn.tree import plot_tree
#plt.figure(figsize=(12, 8))
#plot_tree(dt_model, feature_names=X.columns, class_names=['Not Survived', 'Survived'], filled=True, rounded=True)
#plt.show()




#API part
def create_response(success, message, data=None):
    return {
        "success": success,
        "message": message,
        "data": data
    }

# Route for prediction


@app.route('/predict', methods=['GET'])
def predict():
    try:
        # Extracting input parameters from the request query parameters
        pclass = int(request.args.get('pclass'))
        age = float(request.args.get('age'))
        sibsp = int(request.args.get('sibsp'))
        parch = int(request.args.get('parch'))
        fare = float(request.args.get('fare'))
        sex = int(request.args.get('sex_male'))
        embarked_q = int(request.args.get('embarked_Q'))
        embarked_s = int(request.args.get('embarked_S'))

        # Make a prediction using the model
        input_data = pd.DataFrame([[pclass, age, sibsp, parch, fare, sex, embarked_q,embarked_s]],
                                  columns=['Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'Sex_male', 'Embarked_Q','Embarked_S'])
        prediction = dt_model.predict(input_data)[0]
        

        # Standardized API response
        response = create_response(success=True, message="Prediction successful", data={"prediction": prediction})
        return jsonify(response)

    except Exception as e:
        # Handle errors and provide a standardized error response
        error_message = str(e)
        response = create_response(success=False, message=f"Prediction failed: {error_message},\n Data : {input_data}")
        return jsonify(response)