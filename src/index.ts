import './styles.css';
import { BaseResult, Channel, Message, Thread } from './data-model.js';

//funkce FETCHDATA
const fetchData = async (url: string): Promise<BaseResult> => {
  const response: Response = await fetch(url);
  return await response.json();
};

//získání URL parametrů
const searchParams = new URLSearchParams(window.location.search);
const channelParam = Number(searchParams.get('channel'));
const messageParam: number = Number(searchParams.get('message'));

//Channels
const channelData = await fetchData('http://localhost:4000/api/channels');
const dataChanel = channelData.result as Channel[];

const channelAside: HTMLElement = document.createElement('aside');
channelAside.classList.add('channel');
channelAside.innerHTML = '<h2 class="column-head">Channels</h2>';

dataChanel.forEach((item) => {
  if ('members' in item) {
    const { id, name, members } = item as Channel;
    const isActive = id === channelParam;
    const activeClass = isActive ? 'active' : '';

    channelAside.innerHTML += `
<a class="channel ${activeClass}" href="?channel=${id}">
          <h3 class="channel-name">#${name}</h3>
          <p class="channel-meta">${members} members</p>
        </a>
`;
  }
});

//-----------------------------------
//MESSAGES
//Stáhnutí zpráv podle channel params
const messageData = await fetchData(
  `http://localhost:4000/api/messages?filter=channelId:eq:${channelParam}`,
);
const dataMessages = messageData.result as Message[];

//Vytvoření mainu
const main: HTMLElement = document.createElement('main');
main.classList.add('messages');
main.innerHTML = '<h2 class="column-head">Messages</h2>';

//rendrování messages
const renderMessage = (messages: Message[]): void => {
  messages.forEach((item) => {
    const { id, user, time, content, threadMessages } = item as Message;

    //message param
    const isActiveMessage: boolean = messageParam === id;
    const activeMessage: string = isActiveMessage ? 'active' : '';

    //rozkliklé zprávy ve vlákně
    const isThreadMessage: boolean = threadMessages > 0;
    const activeThreadMessage: string = isThreadMessage
      ? `<a href="?channel=${channelParam}&message=${id}" class="message-thread-link">${threadMessages} messages in thread</a>`
      : '';

    main.innerHTML += `
    <div class="message ${activeMessage}">
          <img class="message-avatar" src="assets/users/${user.avatarFilename}" alt="${user.name}" />
          <div class="message-content">
            <div class="message-head">
              <div class="message-user">${user.name} - ${user.role}</div>
              <div class="message-time">${time}</div>
            </div>
            <div class="message-text">${content}
            </div>
${activeThreadMessage}
          </div>
        </div>
    `;
  });
};

//-------------------------------------------
//RENDROVÁNÍ VLÁKEN
//Stáhnutí dat podle message param
const threadData = await fetchData(
  `http://localhost:4000/api/thread-messages?filter=parentId:eq:${messageParam}`,
);
const dataThreads = threadData.result as Thread[];

//vytvoření <aside> thread
const threadAside: HTMLElement = document.createElement('aside');
threadAside.classList.add('thread');
threadAside.innerHTML = '<h2 class="column-head">Thread</h2>';

if (searchParams.has('message')) {
  console.log(searchParams);
  threadAside.innerHTML += `
  <div class="message">
      <img class="message-avatar" src="assets/users/${dataMessages[messageParam].user.avatarFilename}" alt="${dataMessages[messageParam].user.name}" />
      <div class="message-content">
        <div class="message-head">
          <div class="message-user">${dataMessages[messageParam].user.name} - ${dataMessages[messageParam].user.role}</div>
          <div class="message-time">${dataMessages[messageParam].time}</div>
        </div>
        <div class="message-text">${dataMessages[messageParam].content}
        </div>
      </div>
    </div>
  `;
}

const divThread: HTMLDivElement = document.createElement('div');
divThread.classList.add('thread-messages');

threadAside.appendChild(divThread);

const renderThread = (thread: Thread[]): void | null => {
  if (searchParams.has('message')) {
    thread.forEach((item) => {
      const { user, time, content } = item as Thread;

      return (divThread.innerHTML += `
    <div class="message thread-message">
          <img class="message-avatar" src="assets/users/${user.avatarFilename}" alt=${user.name} />
          <div class="message-content">
            <div class="message-head">
              <div class="message-user">${user.name} - ${user.role}</div>
              <div class="message-time">${time}</div>
            </div>
            <div class="message-text">${content}
            </div>
          </div>
        </div>
    `);
    });
  }
  return null;
};

//rendrování
renderMessage(dataMessages);
renderThread(dataThreads);

//zobrazení html kodu
document.body.appendChild(channelAside);
document.body.appendChild(main);
document.body.appendChild(threadAside);
