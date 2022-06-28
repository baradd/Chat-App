const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
const date = new Date();

const xhttp = new XMLHttpRequest();
xhttp.onload = function () {
  if (this.status === 401) {
    window.location.replace('/');
  }
};
xhttp.open('POST', '/chatroom');
xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
xhttp.send(JSON.stringify({ token }));

const socket = new io();
//@Desc everything in local storage related to chatting is removed when you refresh the page or login newly
localStorage.removeItem('receiver');
localStorage.removeItem('currentChat');
localStorage.removeItem('current-group');
document.querySelector('#chat-section').style.display = 'none';
document.querySelector('#group-section').style.display = 'none';
document.querySelector('#user-name').textContent = JSON.parse(
  localStorage.getItem('user')
).username;
document
  .querySelector('#user-image')
  .setAttribute(
    'src',
    `./images/profiles/${JSON.parse(localStorage.getItem('user')).image}`
  );
//@Desc The user data will be sent to the server to update socket id and status
socket.emit('user-data', {
  user: localStorage.getItem('user'),
});

//@Desc the entered username by you is sent to database to find chat with this username
function findUserAndStartChat() {
  let searchInput = document.querySelector('#search-input').value;
  if (searchInput) {
    socket.emit('start-chat', { who: searchInput });
    document.querySelector('#search-input').value = '';
  }
}

document.querySelector('#message-image').addEventListener('change', () => {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = () => {
    if (xhttp.status === 200) {
      document.querySelector('#uploaded-image-name').style.display = 'block';
      document.querySelector('#uploaded-image-name').textContent = JSON.parse(
        xhttp.response
      ).imageName;
    }
  };
  let data = new FormData();
  data.append('image', document.querySelector('#message-image').files[0]);
  xhttp.open('POST', '/upload-message-image');
  xhttp.send(data);
});

//@Desc this event is ready to get the chat with your selected user
socket.on('send-private-chat', (data) => {
  //Chatbox is update with you selected user data
  document.querySelector('#user-info-section').style.display = 'none';
  document.querySelector('#group-section').style.display = 'none';
  document.querySelector('#chat-section').style.display = 'block';
  document.querySelector('#message-input').value = '';
  let chat = JSON.parse(data.chat);
  document.querySelector('#user-or-group-name').textContent =
    data.receiver.username;
  document
    .querySelector('#user-or-group-image')
    .setAttribute('src', `./images/profiles/${data.receiver.image}`);
  document.querySelector('#chat-box').innerHTML = '';
  localStorage.removeItem('current-group');
  localStorage.setItem('receiver', JSON.stringify(data.receiver));
  localStorage.setItem('currentChat', chat._id);
  //if you texted to this user already the messages would be shown for you
  if (data.messages) {
    let sender = JSON.parse(localStorage.getItem('user'));
    data.messages.forEach((message) => {
      //you message
      let deliveryDisplay;
      message.delivered
        ? (deliveryDisplay = 'inline-block')
        : (deliveryDisplay = 'none');
      let seenDisplay;
      message.seen ? (seenDisplay = 'inline-block') : (seenDisplay = 'none');
      if (message.sender === sender._id) {
        let msg = message.body;
        if (message.image) {
          msg += `<br><img onclick="enlargeImage(this)" class="message-image" src="./images/chats/${message.image}"/>`;
        }
        document.querySelector(
          '#chat-box'
        ).innerHTML += `   <div class="chat-message-right pb-4">
    <div>
      <img src="${`./images/profiles/${sender.image}`}" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
      <div class="text-muted small text-nowrap mt-2">${message.createdAt.slice(
        11,
        16
      )}</div>
    </div>
    <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
      <div class="font-weight-bold mb-1">You </div>
      ${msg} 
      <div style="
      background-color: lightsteelblue;
      border-radius: 20%;
      width: 30px;
  ">
      <i style="display: ${deliveryDisplay};" class="fa-solid fa-check"></i><i style="display: ${seenDisplay};" class="fa-solid fa-check"></i>
      </div>
    </div>
    </div>
    `;
      } else {
        //your contact's messages
        let msg = message.body;
        if (message.image) {
          msg += `<br><img onclick="enlargeImage(this)" class="message-image" src="./images/chats/${message.image}"/>`;
        }
        document.querySelector(
          '#chat-box'
        ).innerHTML += `  <div class="chat-message-left pb-4">
        <div>
          <img src="${`./images/profiles/${data.receiver.image}`}" class="rounded-circle mr-1" alt="Not found" width="40" height="40">
          <div class="text-muted small text-nowrap mt-2">${message.createdAt.slice(
            11 - 16
          )} </div>
        </div>
        <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
          <div class="font-weight-bold mb-1">${data.receiver.username}</div>
          ${msg}
        </div>
      </div>
      
      `;
      }
    });
  }
  //your chats list on left sidebar will be updated
  if (data.chats.length > 0) {
    document.querySelector('#chats-list').innerHTML = '';
    document.querySelector(
      '#chats-list'
    ).innerHTML = ` <div class="px-4 d-none d-md-block">
    <div class="d-flex align-items-center">
      <div class="input-group mt-3">
        <input type="text" class="form-control" placeholder="Search..." id="search-input">
        <div class="input-group-append">
          <button class="btn btn-outline-primary" type="button" onclick="findUserAndStartChat()"><i class="fa fa-search"></i></button>
        </div>
      </div>
     
    </div>
  </div>

  <ul class="nav nav-tabs mt-3">
  <li class="nav-item">
    <a class="nav-link active" aria-current="page" href="#" onclick="getChatsList()">Chats</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#" onclick="getGroupsList()">Groups</a>
  </li>
  
</ul>
  `;
    data.chats.forEach((element) => {
      let person;
      if (element.users[0].user._id !== data.sender._id) {
        person = element.users[0].user;
      } else {
        person = element.users[1].user;
      }
      let chatElement = `<a href="#" onclick="setReceiver(this)" value="${person.username}" class="list-group-item list-group-item-action border-0">
      <!-- <div class="badge bg-success float-right">5</div> -->
      <div class="d-flex align-items-start">
        <img src='./images/profiles/${person.image}' class="rounded-circle mr-1" alt="Vanessa Tucker" width="40" height="40">
        <div class="flex-grow-1 ml-3">
          ${person.username}
          <div class="small"><span class="fas fa-circle chat-online"></span> ${person.status} </div>
        </div>
      </div>
    </a>`;
      document.querySelector('#chats-list').innerHTML += chatElement;
    });
  }
  document.querySelector('#chat-box').scrollTop =
    document.querySelector('#chat-box').scrollHeight -
    document.querySelector('#chat-box').clientHeight;
});

//@Desc after typing message this method send your message to database to handover to it's receiver
document.querySelector('#send-message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  let message = document.querySelector('#message-input').value;
  let image = document.querySelector('#uploaded-image-name').textContent;
  document.querySelector('#message-input').value = '';
  document.querySelector('#uploaded-image-name').style.display = 'none';
  document.querySelector('#uploaded-image-name').textContent = '';
  socket.emit('send-private-message', {
    receiver: localStorage.getItem('receiver'),
    message,
    image,
    currentChat: localStorage.getItem('currentChat'),
  });
});

//@Desc after the messages are processed by the Server they will be sent you back
socket.on('send-message-to-receiver', (data) => {
  let receiver = JSON.parse(localStorage.getItem('receiver'));
  //@ showing message for receiver if he or she is on the same chat with receiver otherwise the messages will be shown for you when you open the chat with this sender
  if (data.currentChat === localStorage.getItem('currentChat')) {
    let msg = data.message.body;
    if (data.message.image) {
      msg += `<br><img onclick="enlargeImage(this)" class="message-image" src="./images/chats/${data.message.image}"/>`;
    }
    document.querySelector(
      '#chat-box'
    ).innerHTML += `  <div class="chat-message-left pb-4">
  <div>
    <img src="./images/profiles/${
      receiver.image
    }" class="rounded-circle mr-1" alt="Not found" width="40" height="40">
    <div class="text-muted small text-nowrap mt-2">${date.getHours()}:${date.getMinutes()} </div>
  </div>
  <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
    <div class="font-weight-bold mb-1">${receiver.username}</div>
    ${msg}
  </div>
</div>

`;
  }

  document.querySelector('#chat-box').scrollTop =
    document.querySelector('#chat-box').scrollHeight -
    document.querySelector('#chat-box').clientHeight;
});

//the messages will be shown for youself
socket.on('send-message-to-sender', (data) => {
  console.log(data);
  let deliveryDisplay, seenDisplay;
  data.delivered
    ? (deliveryDisplay = 'inline-block')
    : (deliveryDisplay = 'none');
  data.seen ? (seenDisplay = 'inline-block') : (seenDisplay = 'none');

  let sender = JSON.parse(localStorage.getItem('user'));
  let msg = data.body;
  if (data.image) {
    msg += `<br><img onclick="enlargeImage(this)" class="message-image" src="./images/chats/${data.image}"/>`;
  }
  document.querySelector(
    '#chat-box'
  ).innerHTML += `   <div class="chat-message-right pb-4">
<div>
  <img src="./images/profiles/${
    sender.image
  }" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
  <div class="text-muted small text-nowrap mt-2">${date.getHours()}:${date.getMinutes()} </div>
</div>
<div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
  <div class="font-weight-bold mb-1">You </div>
  ${msg} 
  <div style="
  background-color: lightsteelblue;
  border-radius: 20%;
  width: 30px;
">
  <i style="display: ${deliveryDisplay};" class="fa-solid fa-check"></i><i style="display: ${seenDisplay};" class="fa-solid fa-check"></i>
  </div>
  </div>
</div>
`;
  document.querySelector('#chat-box').scrollTop =
    document.querySelector('#chat-box').scrollHeight -
    document.querySelector('#chat-box').clientHeight;
});
//@Desc update your chat list in left sidebar
socket.on('update-chats-list', (data) => {
  if (data.chats.length > 0) {
    document.querySelector('#chats-list').innerHTML = '';
    document.querySelector(
      '#chats-list'
    ).innerHTML = ` <div class="px-4 d-none d-md-block">
    <div class="d-flex align-items-center">
      <div class="input-group mt-3">
        <input type="text" class="form-control" placeholder="Search..." id="search-input">
        <div class="input-group-append">
          <button class="btn btn-outline-primary" type="button" onclick="findUserAndStartChat()"><i class="fa fa-search"></i></button>
        </div>
      </div>
     
    </div>
  </div>
  
  <ul class="nav nav-tabs mt-3">
  <li class="nav-item">
    <a class="nav-link active" aria-current="page" href="#" onclick="getChatsList()">Chats</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#" onclick="getGroupsList()">Groups</a>
  </li>
  
</ul>`;
    data.chats.forEach((element) => {
      let person;
      if (element.users[0].user._id !== data.sender._id) {
        person = element.users[0].user;
      } else {
        person = element.users[1].user;
      }
      let chatElement = `<a href="#" onclick="setReceiver(this)" value="${person.username}" class="list-group-item list-group-item-action border-0">
      <!-- <div class="badge bg-success float-right">5</div> -->
      <div class="d-flex align-items-start">
        <img src="./images/profiles/${person.image}" class="rounded-circle mr-1" alt="Vanessa Tucker" width="40" height="40">
        <div class="flex-grow-1 ml-3">
          ${person.username}
          <div class="small"><span class="fas fa-circle chat-online"></span> ${person.status} </div>
        </div>
      </div>
    </a>`;
      document.querySelector('#chats-list').innerHTML += chatElement;
    });
  }
});

//@Desc if you click on one of your past chats this method will find the receiver for you
function setReceiver(e) {
  socket.emit('start-chat', { who: e.getAttribute('value') });
}

//@Desc if you press any key in message input field a typing status will send to the server to show your receiver you are typing something
document.querySelector('#message-input').addEventListener('keydown', () => {
  socket.emit('typing', {
    currentChat: localStorage.getItem('currentChat'),
    receiver: localStorage.getItem('receiver'),
  });
});

socket.on('typing', (data) => {
  if (data.currentChat === localStorage.getItem('currentChat')) {
    document.querySelector('#user-typing').textContent = 'Typing...';
    setTimeout(() => {
      document.querySelector('#user-typing').textContent = '';
    }, 1000);
  }
});

//@Desc create new group

document.querySelector('#create-group-form').addEventListener('submit', (e) => {
  e.preventDefault();
  let groupName = document.querySelector('#group-name').value,
    groupBio = document.querySelector('#group-bio').value,
    groupImage = document.querySelector('#group-image').files[0];

  if (groupName) {
    socket.emit('upload-group-image', groupImage, (status) => {
      if (status.message === 'success') {
        socket.emit(
          'create-group',
          JSON.stringify({ groupName, groupBio, groupImage: status.imageName })
        );
        groupName = '';
        groupBio = '';
        document.getElementById('create-group-modal').style.display = 'none';
      }
    });
  }
});

function getChatsList(e) {
  socket.emit('get-chats-list');
}

function getGroupsList(e) {
  socket.emit('get-groups-list');
}

socket.on('get-groups-list', (data) => {
  document.querySelector('#chats-list').innerHTML = '';
  document.querySelector(
    '#chats-list'
  ).innerHTML = ` <div class="px-4 d-none d-md-block">
  <div class="d-flex align-items-center">
    <div class="input-group mt-3">
      <input type="text" class="form-control" placeholder="Search..." id="search-input">
      <div class="input-group-append">
        <button class="btn btn-outline-primary" type="button" onclick="findUserAndStartChat()"><i class="fa fa-search"></i></button>
      </div>
    </div>
   
  </div>
</div>

<ul class="nav nav-tabs mt-3">
<li class="nav-item">
  <a class="nav-link" aria-current="page" href="#" onclick="getChatsList()">Chats</a>
</li>
<li class="nav-item">
  <a class="nav-link active" href="#" onclick="getGroupsList()">Groups</a>
</li>

</ul>`;
  data.groups.forEach((group) => {
    let groupElement = `<a href="#" onclick="setGroup(this)" value="${group._id}" class="list-group-item list-group-item-action border-0">
    <!-- <div class="badge bg-success float-right">5</div> -->
    <div class="d-flex align-items-start">
      <img src="./images/groups/${group.image}" class="rounded-circle mr-1" alt="Vanessa Tucker" width="40" height="40">
      <div class="flex-grow-1 ml-3">
      <strong>
      ${group.name}
      </strong>
        <div class="small"><span class="fas fa-circle chat-online"></span> ${group.members.length} Persion in  group </div>
      </div>
    </div>
  </a>`;
    document.querySelector('#chats-list').innerHTML += groupElement;
  });
});

function setGroup(e) {
  socket.emit(
    'join-group',
    JSON.stringify({ groupId: e.getAttribute('value') })
  );
  localStorage.removeItem('receiver');
  localStorage.removeItem('currentChat');
  localStorage.setItem('current-group', e.getAttribute('value'));
}

socket.on('joined-group', (data) => {
  let { group, groupMessages } = data;
  document.querySelector('#user-info-section').style.display = 'none';
  document.querySelector('#chat-section').style.display = 'none';
  document.querySelector('#group-section').style.display = 'block';
  document.querySelector('#group-message-input').value = '';
  document.querySelector('#group-chat-box').innerHTML = '';
  document.querySelector('#group-namee').textContent = group.name;
  document
    .querySelector('#group-image')
    .setAttribute('src', `./images/groups/${group.image}`);
  if (groupMessages.length > 0) {
    let user = JSON.parse(localStorage.getItem('user'));
    groupMessages.forEach((groupMessage) => {
      if (groupMessage.sender._id === user._id) {
        document.querySelector(
          '#group-chat-box'
        ).innerHTML += `   <div class="chat-message-right pb-4">
      <div>
        <img src="./images/profiles/${
          user.image
        }" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
        <div class="text-muted small text-nowrap mt-2">${groupMessage.createdAt.slice(
          11,
          16
        )} </div>
      </div>
      <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
        <div class="font-weight-bold mb-1">You</div>
        ${groupMessage.body}
      </div>
      </div>
      `;
      } else {
        document.querySelector(
          '#group-chat-box'
        ).innerHTML += `  <div class="chat-message-left pb-4">
      <div>
        <img src="./images/profiles/${
          groupMessage.sender.image
        }" class="rounded-circle mr-1" alt="Not found" width="40" height="40">
        <div class="text-muted small text-nowrap mt-2">${groupMessage.createdAt.slice(
          11,
          16
        )}</div>
      </div>
      <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
        <div class="font-weight-bold mb-1">${groupMessage.sender.username}</div>
        ${groupMessage.body}
      </div>
    </div>
    
    `;
      }
    });
  }
});

document
  .querySelector('#send-group-message-form')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    let groupMessage = document.querySelector('#group-message-input').value;
    if (groupMessage) {
      let currentGroup = localStorage.getItem('current-group');
      socket.emit(
        'send-message-to-group',
        JSON.stringify({ groupMessage, currentGroup })
      );
      document.querySelector('#group-message-input').value = '';
    }
  });

socket.on('send-message-to-group', (data) => {
  let user = JSON.parse(localStorage.getItem('user'));
  let { currentGroup, sender, groupMessage } = data;
  if (currentGroup === localStorage.getItem('current-group')) {
    if (user._id === sender._id) {
      document.querySelector(
        '#group-chat-box'
      ).innerHTML += `   <div class="chat-message-right pb-4">
    <div>
      <img src="./images/profiles/${
        sender.image
      }" class="rounded-circle mr-1" alt="Chris Wood" width="40" height="40">
      <div class="text-muted small text-nowrap mt-2">${date.getHours()}:${date.getMinutes()} </div>
    </div>
    <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
      <div class="font-weight-bold mb-1">You</div>
      ${groupMessage}
    </div>
    </div>
    `;
    } else {
      document.querySelector(
        '#group-chat-box'
      ).innerHTML += `  <div class="chat-message-left pb-4">
    <div>
      <img src="./images/profiles/${
        sender.image
      }" class="rounded-circle mr-1" alt="Not found" width="40" height="40">
      <div class="text-muted small text-nowrap mt-2">${date.getHours()}:${date.getMinutes()} </div>
    </div>
    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
      <div class="font-weight-bold mb-1">${sender.username}</div>
      ${groupMessage}
    </div>
  </div>
  `;
    }
  }
});

document
  .querySelector('#add-user-to-group-form')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    let username = document.querySelector('#user-to-add-group-input').value;
    socket.emit('add-user-to-group', {
      username,
      currentGroup: localStorage.getItem('current-group'),
    });
  });

socket.on('user-added-to-group', (data) => {
  console.log('hi added');
  document.querySelector(
    '#group-chat-box'
  ).innerHTML += `<blockquote class="blockquote text-center">
  <p class="mb-0 bg-info">${data} added to group</p>
</blockquote>`;
});
socket.on('add-user-to-group-result', (data) => {
  document.querySelector('#user-to-add-group-input').value = '';
  document.querySelector('#add-user-to-group-result').textContent =
    data.message;
});
