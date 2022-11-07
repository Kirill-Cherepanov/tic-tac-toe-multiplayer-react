## Tic-tac-toe with singleplayer, multiplayer and AI

Deploy: https://tic-tac-toe-kirill-cherepanov.netlify.app/

Built with: React+TypeScript+Sass on frontend, Socket.io+TypeScript on backend

First of all, don't be deceived. While this project is based on tic-tac-toe which is a very simple game, my main focus was on developing a multiplayer that could be transfered to any other game and this project is meant to be centered mostly around it.

I've started this project in spring of 2022. At the time I didn't yet know React and didn't concider learning it for this project. So everything for written in vanilla TypeScript.

At first it was just a singleplayer game which you can find here: https://github.com/KissMyUSSR/tic-tac-toe-game. But I decided that stopping on it would be meaningless and thought of adding multiplayer as well as AI to it.

I didn't know much about backend and didn't even know what I needed to complete the project. Having improvised on the go, I built much of what I have right now, except for timer, search with settings and AI. But my code became very convoluted and I had a lot of vulnerabilities on the backend - anyone could easily cheat and even crush the server. So I couldn't proceed without rewriting the whole codebase. So I gave up. I didn't upload the project at the time because it was incomplete, but decided to do it now anyway. You can see it here: https://github.com/KissMyUSSR/tic-tac-toe-multiplayer.

So I have rewritten everything from scratch, making the code much more maintainable and scalable. I used React for it and decided to stick with the same stack on the backend (though I rewrote it anyways to keep up with changes on the frontend).

I learned much about subscribing to data from server as well as maintaining component states based on this data. Also, I received some experience working on the backend.

Initially I had a database in the form of a json file. But soon realized many flaws of working with such a database. Mainly about concurrent file writes. It requires some heavylifting to manage it and that's why I should have used one of the many databases that do it automatically (most of the popular ones). But since I didn't really need a database in that project all that much, I opted against it, and instead decided to keep all the data in a variable.
