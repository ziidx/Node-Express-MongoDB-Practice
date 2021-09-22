Compilation of all completed FCC backend projects including the Timestamp Microservice, Request Parser Microservice, URL Shortener, Exercise Tracker, and File Metadata Microservice. Node/Express was used as the backend framework while MongoDB was used for the URL Shortener and Exercise Tracker.

Simple application that utilizes Node/Express and MongoDB for storing exercise logs for particular users. Based off this [Exercise Tracker Exercise](https://www.freecodecamp.org/learn/apis-and-microservices/apis-and-microservices-projects/exercise-tracker)

# Functionality
POST to /api/users returns a json object with the input username and its associated id in the database. If the user does not exist, creates the user and returns the username and generated id

GET to /api/users returns array of all users and their associated ids as json objects in the database.

POST to /api/users/:id/exercise takes user id parameter, exercise description, and exercise duration as required fields. Date is optional, and the current date is used if no date is supplied.
Adds the exercise to an array of user logs for the user document in the database and returns a json object containing username, id, and the exercise that is added.

GET to /api/users/:id/logs?from&to&limit requires user id parameter while from, to, and limit queries are all optional. Returns a json object containing user id of matching document,
username, the number of exercises in the logs, and a log of all exercises stored. If from/to/limit is specified, only exercises meeting those constraints will be present in the returned object. From and to will also be added as a field in the returned json object if either is specified.

Possible extensions in the future will be incorporating a react frontend in place of the html file being served
