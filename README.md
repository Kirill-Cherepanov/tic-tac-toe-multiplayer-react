# Tic-tac-toe Multiplayer

**Type:** a Multiplayer + AI game

**Technologies used:** React, Typescript, Node.js, Socket.io, Sass

**Deploy:** https://tic-tac-toe-kirill-cherepanov.netlify.app/

**Repository:** https://github.com/KissMyUSSR/tic-tac-toe-multiplayer-react

## What I've built and have learned

- Developed a fully responsive web application that is a Singleplayer + Multiplayer + AI game.
- Utilized websockets to enable bi-directional communication between clients and the server.
- Designed a minimalistic yet intuitive opponent search feature.
- Applied the mini-max algorithm to add Artificial Intelligence to keep players entertained even in the absence of other players.

## My general thoughts

First of all, don't be deceived. While this project is based on tic-tac-toe which is a very simple game, my main focus was on developing a multiplayer that could be transferred to any other game and this project is meant to be centered mostly around it. Although, in retrospect, it's still quite improvable.

I began this project in the spring of 2022. At the time I didn't yet know React and didn't consider learning it for this project. So everything was written in vanilla TypeScript.

At first it was just a single-player game that you can find [here](https://github.com/KissMyUSSR/tic-tac-toe-game). Then, I decided that stopping would be pointless, so I added multiplayer as well as AI.

I didn't know much about the back-end and didn't even know what I needed to complete the project. Having improvised on the go, I built much of what I have at this point, except for the timer, search with settings and AI. But my code became very convoluted and I had a lot of vulnerabilities on the back-end - anyone could easily cheat and even crush the server. So I couldn't proceed without rewriting the whole codebase. So I gave up. I didn't upload the project at the time because it was incomplete, but decided to do it now anyway a couple months later. You can take a look at it [here](https://github.com/KissMyUSSR/tic-tac-toe-multiplayer).

And I rewrote everything from scratch, making the code much more maintainable and scalable. I used React for it and decided to stick with the same stack on the back-end (though I had to rewrite it anyways to keep up with the changes on the front-end).

Initially I had a database in the form of a JSON file. But soon realized that there were many problems with working with such a thing. It was mainly about concurrent file writes. It requires some heavy lifting to manage it and that's why I should have used one of the many databases that do it automatically (most of the popular ones). But since I didn't really need a database in that project all that much, I opted against it, and instead decided to keep all the data in a variable.
