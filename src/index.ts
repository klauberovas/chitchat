import './styles.css';
import { BaseResult, Channel, Message, Thread, Result } from './data-model.js';

//OBECNÉ
//získání URL parametrů
const searchParams = new URLSearchParams(window.location.search);
const channelParam = Number(searchParams.get('channel'));
const messageParam: number = Number(searchParams.get('message'));

//funkce FETCHDATA
const fetchData = async (url: string): Promise<BaseResult> => {
  const response: Response = await fetch(url);
  return await response.json();
};

const channelData = await fetchData('http://localhost:4000/api/channels');
const dataChanel = channelData.result as Channel[];

const messageData = await fetchData(
  `http://localhost:4000/api/messages?filter=channelId:eq:${channelParam}`,
);
const dataMessages = messageData.result as Message[];

const threadData = await fetchData(
  `http://localhost:4000/api/thread-messages?filter=parentId:eq:${messageParam}`,
);
const dataThreads = threadData.result as Thread[];

//fce CREATE ELEMENT
const createHTMLElement = (
  tagName: string,
  clasName: string,
  title: string,
): HTMLElement => {
  const element: HTMLElement = document.createElement(tagName);
  element.classList.add(clasName);
  element.innerHTML = `<h2 class="column-head">${title}</h2>`;

  return element;
};

const channelAside: HTMLElement = createHTMLElement(
  'aside',
  'channel',
  'Channels',
);
const main: HTMLElement = createHTMLElement('main', 'messages', 'Messages');
const threadAside: HTMLElement = createHTMLElement(
  'aside',
  'thread',
  'Threads',
);

const divThread: HTMLDivElement = document.createElement('div');
divThread.classList.add('thread-messages');

//FCE RENDER CHANNELS
const renderChannels = (channels: Channel[]): void => {
  channels.forEach((item) => {
    const { id, name, members } = item as Channel;
    const isActive = id === channelParam;
    const activeClass = isActive ? 'active' : '';

    channelAside.innerHTML += `
  <a class="channel ${activeClass}" href="?channel=${id}">
            <h3 class="channel-name">#${name}</h3>
            <p class="channel-meta">${members} members</p>
          </a>
  `;
  });
};

//FCE RENDER MESSAGES
const renderMessages = (message: Message, htmlElement: HTMLElement): void => {
  const { id, user, time, content, threadMessages } = message as Message;
  const isActiveMessage: boolean = messageParam === id;
  const activeMessage: string = isActiveMessage ? 'active' : '';

  //počet zpráv ve vlákně
  const activeThreadMessage: string =
    threadMessages > 0
      ? `<a href="?channel=${channelParam}&message=${id}" class="message-thread-link">${threadMessages} messages in thread</a>`
      : '';

  htmlElement.innerHTML += `
    <div class="message ${htmlElement === main ? activeMessage : ''}">
          <img class="message-avatar" src="assets/users/${
            user.avatarFilename
          }" alt="${user.name}" />
          <div class="message-content">
            <div class="message-head">
              <div class="message-user">${user.name} - ${user.role}</div>
              <div class="message-time">${time}</div>
            </div>
            <div class="message-text">${content}
            </div>
${htmlElement === main ? activeThreadMessage : ''}
          </div>
        </div>
    `;
};

dataMessages.forEach((item) => {
  renderMessages(item, main);
});

//hlavní zpráva ve vláknu
if (searchParams.has('message')) {
  const response: Response = await fetch(
    `http://localhost:4000/api/messages/${messageParam}`,
  );
  const data = (await response.json()) as Result;
  renderMessages(data.result, threadAside);
}
//FCE RENDER THREADS
const renderThreads = (thread: Thread[]): void | null => {
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

renderChannels(dataChanel);
renderThreads(dataThreads);

document.body.appendChild(channelAside);
document.body.appendChild(main);
document.body.appendChild(threadAside);
threadAside.appendChild(divThread);
