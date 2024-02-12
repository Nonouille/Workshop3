import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, roc_curve, roc_auc_score, precision_recall_curve, auc
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify

# Load the Titanic dataset
titanic_data = pd.read_csv("titanic.csv")

# Selecting features (independent variables) and target (dependent variable)
X = titanic_data[['Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare']]
y = titanic_data['Survived']

# Handling missing values by replacing them with the mean for numeric columns
X.loc[:, 'Age'] = X['Age'].fillna(X['Age'].mean())
X.loc[:, 'Fare'] = X['Fare'].fillna(X['Fare'].mean())

# Convert categorical variable 'Sex' into numerical using one-hot encoding
X = pd.get_dummies(X, columns=['Sex'], drop_first=True)

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the Logistic Regression model
model_logistic = LogisticRegression()

# Train the model
model_logistic.fit(X_train, y_train)

# Make predictions on the test set
predictions = model_logistic.predict(X_test)

# Evaluate the model
accuracy = accuracy_score(y_test, predictions)
print(f"Accuracy: {accuracy}")

# Classification Report
class_report = classification_report(y_test, predictions)
print("Classification Report:")
print(class_report)

# Confusion Matrix
conf_matrix = confusion_matrix(y_test, predictions)
print("Confusion Matrix:")
print(conf_matrix)



# ROC Curve and AUC
y_prob = model_logistic.predict_proba(X_test)[:, 1]
fpr, tpr, thresholds = roc_curve(y_test, y_prob)
roc_auc = auc(fpr, tpr)

plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.2f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend(loc="lower right")
plt.show()

