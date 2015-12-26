# break-bread-node

## Set up

You should have **Node.js and MongoDB installed** before setting up this project.

1. Install dependencies: `$ npm install`
1. Run MongoDB: `$ mongod --dbpath path/of/data/dir` then install fixtures
    - `mongoimport --db break-bread --collection 'fixtureName' --file fixtures/fixtureName.json`
1. Run the Node server: `$ npm start`
1. Browse [localhost:3000](http://localhost:3000)

## About

A software reengineering of the original
[Break Bread with Friends](https://bitbucket.org/cyang001/break-bread-with-friends).
The original project was developed as a course long project for Web Site Design
at The City College of New York and used Django. This implementation envisions
the project with MongoDB, Express, and Node.js.

## Features

- [#2a76074](2a76074f61d46896e9b84a91def80f930d6241e0) Real time restaurant orders
    for restaurant owners using Socket.io and AJAX (with Jade rendering help)

![Socket IO and AJAX restaurant feed items](https://raw.githubusercontent.com/exp0nge/break-bread-node/master/public/images/qfeed.gif)

- Restaurant owners dashboard

![restaurant order dash](https://raw.githubusercontent.com/exp0nge/break-bread-node/master/public/images/restaurant-dashboard.PNG)

- Restaurant storefronts

![Storefront screenshot](https://raw.githubusercontent.com/exp0nge/break-bread-node/master/public/images/restaurant-front-page.PNG)

- Multiple reservations

![cart](https://raw.githubusercontent.com/exp0nge/break-bread-node/master/public/images/customer-cart.PNG)

- Customer order history

![order history](https://raw.githubusercontent.com/exp0nge/break-bread-node/master/public/images/customer-order-history.PNG)
