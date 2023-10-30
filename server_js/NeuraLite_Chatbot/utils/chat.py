import json
import torch

from utils.model_train import TranNet
from utils.nltk_utils import bag_of_words, tokenize


class BasicChatBot:
    def __init__(self, intent_file_path = 'data/demo.json' , model_file_path = "model/demo.pth"):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.file_path = intent_file_path
        
        with open( self.file_path, 'r') as json_data:
            self.intents = json.load(json_data)
            
        data = torch.load(model_file_path)

        self.input_size = data["input_size"]
        self.hidden_size = data["hidden_size"]
        self.output_size = data["output_size"]
        self.all_words = data['all_words']
        self.tags = data['tags']
        self.model_state = data["model_state"]

        self.model = TranNet(self.input_size, self.hidden_size, self.output_size).to(self.device)
        self.model.load_state_dict(self.model_state)
        self.model.eval()

    def get_bot_response(self, user_message):
        sentence = tokenize(user_message)
        X = bag_of_words(sentence, self.all_words)
        X = X.reshape(1, X.shape[0])
        X = torch.from_numpy(X).to(self.device)
        
        output = self.model(X)
        _, predicted = torch.max(output, dim=1)

        tag = self.tags[predicted.item()]
        probs = torch.softmax(output, dim=1)
        prob = probs[0][predicted.item()]
        
        if prob.item() > 0.90:
            for intent in self.intents:
                if tag == intent["tag"]:
                    return intent,prob.item()
                
        return {}, prob.item()
