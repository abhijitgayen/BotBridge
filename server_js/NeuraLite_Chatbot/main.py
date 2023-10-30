from utils.chat import BasicChatBot
from utils.model_train import TrainData

import random

####################################
## personal chatbot for response ###
####################################

# train model
chat_bot_train = TrainData(data_file_path = 'data/personal_assistant.json', save_file_path = 'model/personal_assistant.pth')
chat_bot_train.trainModel()

# test model
chat_bot_response = BasicChatBot(intent_file_path = 'data/personal_assistant.json' , model_file_path = "model/personal_assistant.pth")

while True:
    user_message = input('User Message : ')
    if user_message.lower() == 'exit':
        break
    else:
        bot_response, _ = chat_bot_response.get_bot_response(user_message)
        print('Bot Response : ',bot_response.get('responses',[{}])[0].get('answer', 'Sorry i am still learning'))

################################################
## mental health doctor chatbot for response ###
################################################

# train model
# chat_bot_train = TrainData(data_file_path = 'data/mental_health_doctor.json', save_file_path = 'model/mental_health_doctor.pth')
# chat_bot_train.trainModel()

# test model
# chat_bot_response = BasicChatBot(intent_file_path = 'data/mental_health_doctor.json' , model_file_path = "model/mental_health_doctor.pth")

# while True:
#     user_message = input('User Message : ')
#     if user_message.lower() == 'exit':
#         break
#     else:
#         bot_response_output, _ = chat_bot_response.get_bot_response(user_message)
#         bot_response = random.choice(bot_response_output.get('responses') or ['Sorry i am still learning'])
#         print('Bot Response :', bot_response)
