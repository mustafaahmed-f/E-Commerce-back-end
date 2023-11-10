<!DOCTYPE html>
<html>
  <head>
    <title>Page Title</title>
    <style>
      body {
        padding: 10px;
      }
      @counter-style numberOfContents {
        system: fixed;
        symbol: 1 2 3 4 5;
        suffix: " ";
      }
      ul {
        list-style: numberOfContents;
      }
      li {
        margin: 4px;
      }
    </style>
  </head>
  <body>
    <h1 style="text-align: center">
      E-Commerce project created with
      <span
        style="
          background-color: #8fc708;
          padding: 6px;
          color: #6b6d66;
          border-radius: 5px;
        "
      >
        Node.js</span
      >
    </h1>
    <h2>Table of contents</h2>
    <hr />
    <ul id="table-contents">
      <li><a href="#About">About</a></li>
      <li><a href="#Technologies">Technologies</a></li>
      <li><a href="#Models&DB">Models&DB</a></li>
      <li><a href="#Documentation">Documentation</a></li>
      <li><a href="#Deployment">Deployment</a></li>
    </ul>
    <hr />
    <section id="About">
      <h2># About</h2>
      <p>
        This is an e-commerce project created using node.js, express.js and
        mongoDB.
      </p>
      <p>
        It is a RESTful application that allows seamless communication between
        the front-end and back-end systems. This resulted in improved
        performance and scalability of the application.
      </p>
      <p>
        Developed and integrated a secure user authentication and authorization
        system using technologies such as JSON Web Tokens (JWT) and OAuth 2.0.
      </p>
      <h3 style="margin-top: 4px">==> Features :</h3>
      <ul>
        <li>Integrated payment method using Stripe.</li>
        <li>User authentication using JWT and authorization.</li>
        <li>Social login</li>
        <li>send order invoice to users after making order.</li>
        <li>API features added to GET methods to get ordered data.</li>
      </ul>
      <h3 style="margin-top: 4px">==> How to install :</h3>
      <ul>
        <li>
          git clone :
          <a href="https://github.com/mustafaahmed-f/E-Commerce-back-end"
            >https://github.com/mustafaahmed-f/E-Commerce-back-end</a
          >
        </li>
        <li>npm install</li>
        <li>nodemon OR npm start</li>
      </ul>
      <h3 style="margin-top: 4px">==> Contact me :</h3>
      <p>
        Email :
        <a href="mailto:mostafafikry97@gmail.com">mostafafikry97@gmail.com</a>
      </p>
    </section>
    <hr />
    <section id="Technologies">
      <h2># Technologies</h2>
    </section>
  </body>
</html>
