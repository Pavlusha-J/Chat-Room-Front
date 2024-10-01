var stompClient = null;
var username = null;

// Prisijungimas prie WebSocket
function connect() {
    username = localStorage.getItem("username"); // Imame vardą iš localStorage (nustatomas prisijungimo metu)

    if (!username) {
        alert("Vartotojas neprisijungęs");
        return;
    }
        // Išsaugome vardą į localStorage, kad būtų pasiekiamas kitame puslapyje
        localStorage.setItem("username", username);
        
    var socket = new SockJS('http://localhost:8080/chat-websocket'); // WebSocket ryšio nustatymas
    stompClient = Stomp.over(socket);
    
    // Prisijungimas prie serverio
    stompClient.connect({}, function (frame) {
        console.log('Prisijungta: ' + frame);

        // Prenumeruojame žinučių kanalą
        stompClient.subscribe('/topic/messages', function (messageOutput) {
            showMessage(JSON.parse(messageOutput.body));
        });

        // Pranešame apie prisijungimą
        stompClient.send("/app/join", {}, JSON.stringify({ sender: username }));
    });
}

// Siųsti žinutę
function sendMessage() {
    var messageInput = document.getElementById("message-input").value;
    
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/send", {}, JSON.stringify({ sender: username, content: messageInput }));
        document.getElementById("message-input").value = '';
    } else {
        console.log('WebSocket ryšys nėra prisijungęs.');
    }
}

// Palikti pokalbį
function leaveChat() {
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/leave", {}, JSON.stringify({ sender: username }));
        stompClient.disconnect();
        console.log("Atsijungta nuo WebSocket ryšio");
    }

    // Grąžiname vartotoją į prisijungimo puslapį
    window.location.href = 'login.html';
}

// Rodyti žinutę puslapyje
function showMessage(message) {
    var messageElement = document.createElement('div');
    messageElement.className = message.sender === username ? 'my-message' : 'other-message';

    var messageText = document.createElement('p');
    messageText.appendChild(document.createTextNode(message.sender + ": " + message.content + " (" + message.sentAt + ")"));
    messageElement.appendChild(messageText);

    document.getElementById("messages").appendChild(messageElement);
}

// Pradinis WebSocket ryšio užmezgimas, kai atidaromas puslapis
window.onload = function() {
    connect();
};


