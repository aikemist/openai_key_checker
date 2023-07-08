const apiUrl = '/api/check';
const preprocessUrl = '/api/preprocess';

const chatContainer = document.getElementById('chat-container');
const inputMessage = document.getElementById('input-message');
const inputOrg = document.getElementById('input-org');
const sendButton = document.getElementById('send-button');
const batchButton = document.getElementById('batch-button');
const modelSelector = document.getElementById('model-selector');

const models_gpt35turbo = []
const models_gpt4 = []
const models_others = []

sendButton.addEventListener('click', () => {
    sendMessage();
});

function sendMessage() {
    const key = `${inputMessage.value}`;
    const org = `${inputOrg.value}`;
  
    if (key.trim()) {
      callOpenAI(key, org.trim());
    }
}

batchButton.addEventListener('click', () => {
    // select a text file then read it into inputMessage
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    //accept txt json csv and so on
    fileSelector.setAttribute('accept', 'text/*');
    fileSelector.click();
    fileSelector.addEventListener('change', () => {
        const file = fileSelector.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            //inputMessage.value = event.target.result;
            preprocessKeyText(event.target.result);
        };
        reader.readAsText(file);
    });
});

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
}

function addMessageToChat(role, message) {
    const chatMessage = document.createElement('p');
    chatMessage.textContent = `${role.toUpperCase()}: ${message}`;
    chatContainer.appendChild(chatMessage);
    //chatContainer.scrollTop = chatContainer.scrollHeight;
    chatContainer.style.display = 'block';

    if(role == 'failed') {
        chatMessage.classList.add('error');
    }

    if(role == 'model') {
        chatMessage.classList.add('success');
    }
}

function clearChatMessage()
{
    chatContainer.innerHTML = '';
    chatContainer.style.display = 'none';
}

function preprocessKeyText(keyText) {
    clearChatMessage();
    addMessageToChat('system', 'checking key...')
    fetch(preprocessUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyText: keyText })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.error != null) {
            console.log(data.error);
            message = data.error;
            addMessageToChat('failed', message);
        }
        else
        {
            dataParsed = JSON.parse(data);
            if(dataParsed.keys.length > 0)
            {
                addMessageToChat('system', 'identified ' + dataParsed.keys.length + ' keys in your text:');
                dataParsed.keys.forEach(key => {
                    let hiddenKey = key.substring(0, 4) + '...' + key.substring(key.length - 4, key.length);
                    addMessageToChat('key', hiddenKey);
                });

                let delay = 0;
                dataParsed.keys.forEach(key => {
                    setTimeout(() => callOpenAI(key, true, true), delay);
                    delay += 100;  // Increase the delay for next function call by 100ms
                });                
            }
        }
        //console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });    
}

function callOpenAI(key, org, briefOutput = false, keepChatMessage = false) {
    
    if(!keepChatMessage)
    {
        clearChatMessage();
        addMessageToChat('system', 'checking key...');
    }

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: key, org: org })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.error != null) {
            console.log(data.error);
            let hiddenKey = key.substring(0, 4) + '...' + key.substring(key.length - 4, key.length);
            message = 'your key is not working: ' + data.error;
            addMessageToChat('failed', message);
        }
        else
        {
            let hiddenKey = key.substring(0, 4) + '...' + key.substring(key.length - 4, key.length);
            let hasGPT35turbo = false;
            let hasGPT4 = false;
            let hasGPT4_32K = false;

            data.data.forEach(element => {
                console.log(element.id);
                if(element.id.startsWith('gpt-4')) {

                    models_gpt4.push(element.id);

                    hasGPT4 = true;
                    if(element.id.startsWith('gpt-4-32k')) {
                        hasGPT4_32K = true;
                    }
                }
                else if(element.id.startsWith('gpt-3.5-turbo')) {
                    models_gpt35turbo.push(element.id);
                    hasGPT35turbo = true;
                }
                else
                {
                    models_others.push(element.id);
                }
            })

            if(briefOutput){
                addMessageToChat('system', 'your key ' + hiddenKey +' works with following models:');
                if(hasGPT4) {
                    addMessageToChat('model', 'GPT-4');
                }
                if(hasGPT35turbo){
                    addMessageToChat('model', 'GPT-3.5');
                }
                return;
            }
            else
            {
                addMessageToChat('system', 'your key ' + hiddenKey +' works with following models:');
                
                if(hasGPT4) {
                    addMessageToChat('category', 'GPT-4');
                    models_gpt4.forEach(element => {
                        addMessageToChat('model', element);
                    });
                }
    
                if(hasGPT35turbo){
                    addMessageToChat('category', 'GPT-3.5-Turbo');
                    models_gpt35turbo.forEach(element => {
                        addMessageToChat('model', element);
                    });
                }
                
                if(models_others.length > 0) {
                    addMessageToChat('category', 'Others');
                    models_others.forEach(element => {
                        addMessageToChat('model', element);
                    });
                }
            }

        }
        //console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}