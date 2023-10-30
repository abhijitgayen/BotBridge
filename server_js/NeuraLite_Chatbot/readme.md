# About This Project **NeuraLite Chatbot**

This chatbot employs a straightforward neural network architecture, ideal for button-based interactions, ensuring rapid responses. We've employed a simplified neural network to train the model, and our team is actively enhancing this project to deliver even quicker real-time communication solutions.

When you send a message, our system identifies patterns and generates responses tailored to your specific needs. You have the flexibility to customize the bot's responses to align with your requirements. Additionally, you can leverage API calls to generate messages tailored to your preferences.

# About Our Model

Machines primarily understand numerical data, such as vectors and matrices, and not natural language text directly. 

For our project, we are employing a straightforward text-to-vector representation method known as "bag of words." This approach allows us to convert text data into numerical vectors, enabling the machine to process and work with the information effectively.

*What is bag of words ?*
```
    return bag of words array:
    1 for each known word that exists in the sentence, 0 otherwise
    example:
    sentence = ["hello", "how", "are", "you"]
    words = ["hi", "hello", "I", "you", "bye", "thank", "cool"]
    bog   = [  0 ,    1 ,    0 ,   1 ,    0 ,    0 ,      0]
```

we use only two hidden layers of neural networks

```python
class TranNet(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(TranNet, self).__init__()
                 
        self.fc1 = nn.Linear(input_size, hidden_size) 
        self.fc2 = nn.Linear(hidden_size, hidden_size) 
        self.fc3 = nn.Linear(hidden_size, num_classes)
        
        self.relu =  nn.ReLU()
    
    def forward(self, x):
        
        out = self.fc1(x)
        out = self.relu(out)      
        out = self.fc2(out)
        out = self.relu(out)
        out = self.fc3(out)
        
        return out
```
Each neuron node within our model is associated with an activation function. In this specific project, we have chosen to use the Rectified Linear Unit (ReLU) activation function.


# SetUp for this project
Try to install all dependencies
using commands

```pip install -r requirements.txt```

if you fail try to install Pytorch separately. (Noted that fast comment out Pytorch)
To install Pytorch in your system.
(Link)[https://pytorch.org/get-started/locally/]

This is a basic demonstration that can be seamlessly integrated with FastAPI and external APIs. This flexibility allows you to craft responses according to your specific needs and requirements.

# Run Code
To train and test the model in Python, please follow these steps:

> Open the `main.py` file in your Python environment.
> Review the code in the file to ensure it aligns with your specific requirements.
> Customize the code by commenting out or modifying sections of the code as needed.
> Make sure to set the correct directory paths for your data and model files.
> Once you've configured the code according to your requirements, save the file.
> Open your terminal or command prompt and navigate to the directory where `main.py` is located.
> Run the script using one of the following commands, depending on your Python version:
   ```
   python3 main.py
   ```
> The script will execute the training and testing processes based on your customizations.

Please ensure that you have all the necessary dependencies installed and the data files and model paths correctly configured for your project.