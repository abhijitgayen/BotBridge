import numpy as np
import json

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from utils.nltk_utils import bag_of_words, tokenize, stem


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

class ChatDataset(Dataset):
    def __init__(self, X_train, y_train):
        self.n_samples = len(X_train)
        self.x_data = X_train
        self.y_data = y_train

    # support indexing such that dataset[i] can be used to get i-th sample
    def __getitem__(self, index):
        return self.x_data[index], self.y_data[index]

    # we can call len(dataset) to return the size
    def __len__(self):
        return self.n_samples
    
class TrainData:
    def __init__(self, data_file_path = 'data/demo.json', save_file_path = 'model/demo.pth'):
        file_path = data_file_path
        self.save_file_path = save_file_path
        with open(file_path, 'r') as f:
            intents = json.load(f)
            
        self.all_words = []
        self.tags = []
        xy = []
        # loop through each sentence in our intents patterns
        for intent in range(len(intents)):
            tag = intents[intent]['tag']
            # add to tag list
            self.tags.append(tag)
            for pattern in intents[intent]['patterns']:
                # tokenize each word in the sentence
                w = tokenize(pattern)
                # add to our words list
                self.all_words.extend(w)

                # add to xy pair
                xy.append((w, tag))

        # stem and lower each word
        ignore_words = ['?', '.', '!']
        self.all_words = [stem(w) for w in self.all_words if w not in ignore_words]
        # remove duplicates and sort
        self.all_words = sorted(set(self.all_words))
        self.tags = sorted(set(self.tags))

        print(len(xy), "patterns")
        print(len(self.tags), "tags:", self.tags)
        print(len(self.all_words), "unique stemmed words:", self.all_words)

        # create training data
        X_train = []
        y_train = []
        for (pattern_sentence, tag) in xy:
            # X: bag of words for each pattern_sentence
            bag = bag_of_words(pattern_sentence, self.all_words)
            X_train.append(bag)
            # y: PyTorch CrossEntropyLoss needs only class labels, not one-hot
            label = self.tags.index(tag)
            y_train.append(label)

        X_train = np.array(X_train)
        y_train = np.array(y_train)

        # Hyper-parameters for TranNet
        self.batch_size = 16
        self.learning_rate = 0.001
        self.input_size = len(X_train[0])
        self.hidden_size = 16
        self.output_size = len(self.tags)
        
        dataset = ChatDataset(X_train,y_train)
        self.train_loader = DataLoader(dataset=dataset,batch_size=self.batch_size,shuffle=True,num_workers=0)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        self.model = TranNet(self.input_size, self.hidden_size, self.output_size).to(self.device)

        # Loss and optimizer
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=self.learning_rate)
        
    def trainModel(self, num_epochs = 1000):
        # Train the model
        for epoch in range(num_epochs):
            for (words, labels) in self.train_loader:
                words = words.to(self.device)
                labels = labels.to(dtype=torch.long).to(self.device)
                
                # Forward pass
                outputs = self.model(words)
                # if y would be one-hot, we must apply
                # labels = torch.max(labels, 1)[1]
                loss = self.criterion(outputs, labels)
                
                # Backward and optimize
                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()
                
            if (epoch+1) % 100 == 0:
                print (f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.8f}')


        print(f'final loss: {loss.item():.8f}')

        data = {
            "model_state": self.model.state_dict(),
            "input_size": self.input_size,
            "hidden_size": self.hidden_size,
            "output_size": self.output_size,
            "all_words": self.all_words,
            "tags": self.tags
        }

        torch.save(data, self.save_file_path)

        print(f'training complete. file saved to {self.save_file_path}')
