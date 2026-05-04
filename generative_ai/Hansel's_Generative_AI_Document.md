# Generative AI Chat Document
COMP30830 Project  
Student Name: Hansel Oduah  
Student ID: 21511133  

This document summarises how Generative AI tools were used during the COMP30830 Dublin Bikes project. These tools were used as support tools to aid in learning, project planning and debugging.

## ChatGPT

ChatGPT was the main AI tool used during this process. Below documents troubles I encountered while implementing the frontend code and how I consulted with ChatGPT to help better understand the problems.

## 1. Modular Javascript

During the early writing stages, a basic non-modular approach was used to write javascript code. After switching to using modules for better code management and organisation, the initMap function was not exposed globally and therefore unable to run. window.initMap = initMap was unable to expose the function globally. 

**Prompt:** I used window.initMap = initMap to expose my function globally in modular javascript. The console however says initMap is not a function. Why?  

ChatGPT proceeded to list a number of possible reasons including:
- initMap isn’t defined yet (most common)
- You’re in an ES module (type="module")
- Script order problem (very common with Google Maps)

Eventually upon reviweing the code again and considering the reasons explained, I narrowed down the problem and questioned whether &callback=initMap in the HTML script tag was the culprit. I then proceeded to ask:

**Prompt:** Would callback cause this issue?  
**Response:**
``` HTML
Yes — the callback is one of the most common causes of exactly this error, especially with Google Maps.

When you see:

initMap is not a function

and you're using a URL like:
<script>https://maps.googleapis.com/maps/api/js?key=KEY&callback=initMap</script>

it means Google is trying to call window.initMap() immediately when the API finishes loading.

So the rule is very strict:

At the moment the Maps script runs its callback, window.initMap must already exist and be a function.

```
This response helped my understanding of how callback operates and how it interacts with other parts of the code. In my case, `initMap` was being called by the script tag before it existed. From this I decided to remove callback entirely and adopt another approach, using `setInterval` to wait for the script to complete loading before beginning the main javascript.

## 2. Fetched Data Bug Fixing
Upon fetching for data from the /stations API endpoint and storing it in a variable, the variable was deemed undefined when attempting to use later in the code. The answer to how this would happen was not clear as it was explicitly assigned to a value earlier in the code. I consulted with ChatGPT.

**Prompt:** I fetched for data then assigned it to a variable. When I try to use that variable later in the code it says it is undefined. Why is this?  
**Response:** 
```
This happens because your fetch is asynchronous.

So even though you “assign the data to a variable,” your code continues running before the data has arrived
```
```
✔ Option 2: Use async/await (recommended)
async function loadData() {
  const response = await fetch("/api/data");
  const data = await response.json();

  console.log(data); // ✔ works
}
```
The chat explained that fetching is an asynchronous process in javascript. This means that the code continues to run even before data from the fetch call has fully arrived, which explained why the variable was still undefined even after performing an assignment operation.
`async/await` solves issues with asynchronous activity in javascript. `async` makes a function return a promise, while `await` waits for a promise to resolve. In this way, the variable is only created after the `await` finishes and doesn't get used too early.

## 3. InfoWindow Button Issue

After creating the infoWindow popup it was tested to ensure operation was as expected. After the first implementation of the code, it was found that the "more information" button never worked when first clicked, but when subsequent infoWindow popups were opened the button worked normally. The console revealed that the button did not exist (Cannot set properties of null (setting 'onclick')) for the first infoWindow clicked but existed afterwards when more infoWindows were triggered. I consulted with ChatGPT.

 **Prompt:** I received "Cannot set properties of null (setting 'onclick')" for button within google infowindow pop up when I first open the popup but when I open subsequent popups the button exists and functionality is restored. How does this happen?  
 **Response:** 
 ```
This isn’t random—it's a timing problem.

When you use a Google Maps JavaScript API InfoWindow, the HTML you pass in isn’t immediately attached to the DOM at the moment you call setContent() or open(). So if you try to do something like:

document.getElementById("myButton").onclick = ...

right away, getElementById returns null → hence:

Cannot set properties of null
 ```
 The chat then suggested I use `domready`:
 ```
 const infoWindow = new google.maps.InfoWindow({
  content: '<button id="myButton">Click me</button>'
});

infoWindow.addListener("domready", () => {
  const btn = document.getElementById("myButton");
  if (btn) {
    btn.onclick = () => {
      console.log("Clicked!");
    };
  }
});
 ```
InfoWindow content is rendered asynchronously in relation to the rest of the code. Even when the popup shows, its content is not guaranteed to exist in the DOM. Attaching a `domready` listener to the infoWindow waits for the DOM of the popup to exist before executing the code within its block.

## 4. Search Function Implementation
The stations list was initially created to simply be a scrollable list of all the stations on the map. I realised it may also be quite beneficial to include a search function which filters through the list based on user input. However, tracking live user input in this way was not something I was familiar with.

**Prompt:** I have a long list of items and want users to be able to type the item they are looking for into a search bar. In javascript, what can I use to track user input?    
**Response:**
```
1. The main event: input

This fires every time the value changes (typing, deleting, pasting, autofill, etc.).

<input type="text" id="search" placeholder="Search items..." />
const searchBox = document.getElementById("search");

searchBox.addEventListener("input", (event) => {
  const value = event.target.value;
  console.log("User typed:", value);
});
```
From this I discovered the "input" attribute of .addEventListener. It dynamically tracks user input and thus, was applicable to my query.

## 5. Password Storage

During the design of the user signup form, it became clear that in order for users to login, their login details must first be stored in a database. This includes their password. Storing passwords in this manner seemed very unsecure and I became curious as to how real companies who take in sensitive user information such as passwords store this information.

**Prompt:** Can I store user passwords in my database?  How do companies achieve this?  
**Response:**
```
You should never store user passwords in plain text in your database. If a database leaks and passwords are stored directly, attackers instantly get access to users’ accounts (and often reused passwords elsewhere too).

Instead, companies store a cryptographic hash of the password, not the password itself.
```
ChatGPT proceeded to explain hashing techniques used in real life systems for storing passwords. I wanted to implement a similar technique into this application as, even though this application was not being deployed professionally, it would be highly beneficial to make myself familiar with techniques used in real professional settings. I asked ChatGPT for ways I can generate hashed passwords.

**Prompt:** How can I generate hashed passwords for my flask application?  
**Response:**  
```
1. Use Werkzeug (recommended)
Hash a password
from werkzeug.security import generate_password_hash

hashed_password = generate_password_hash("mysecretpassword")
print(hashed_password)
```
```
from werkzeug.security import check_password_hash

check_password_hash(hashed_password, "mysecretpassword")  # True
check_password_hash(hashed_password, "wrongpass")         # False
```
Through this I discovered `werkzeug.security`, a module in the Python `Werkzeug library` commonly used to generate hashed passwords in Python web frameworks like Flask. I then implemented this hashing method into the application.


## 6. Securing Home Page and API Routes

The home page as well as all API routes were easily accessible to users even without logging in. This defeats the purpose of having a signup/login system as users without accounts could access the home page and API route contents by simply typing the full URL. Implementing a method to protect these pages so that only users who have created an account and logged in can access the home page would be a more realistic approach.

**Prompt:** What are some ways I can protect the main page of my flask app from users who have not logged in?  
**Response:**  
```
2. Manual session-based protection (simpler apps)

If you don’t want dependencies:

Login sets session
from flask import session

@app.route("/login", methods=["POST"])
def login():
    # after verifying credentials
    session["user_id"] = user.id
    return redirect("/")
Protect route manually
from flask import session, redirect, url_for

@app.route("/")
def home():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return "Protected content"
```
After reading through the suggestions I decided to implement this protection using Flask's `session`. A Flask session is a way to store small amounts of user-specific data across such as login status. It can be used to remember whether a user is logged in while they navigate a website.

I then wanted a way to allow users to properly logout. This would involve closing the session.
**prompt:** I track user login by using Flask session. How do allow users to log out in both my flask app and javascript using a logout button.

**Response:**
```
from flask import session, redirect, url_for

@app.route("/logout")
def logout():
    session.clear()  # removes all session data
    return redirect(url_for("login"))
```
```
document.getElementById("logoutBtn").addEventListener("click", async () => {
await fetch("/logout", { method: "GET" });
window.location.href = "/login";
});
```
The methodologies above were included in the application.

## 7. README Structure
The README file was an integral part of this project. It gives the first impression of the Github repository as well as explaining the purpose and value of the project. There are many tools and blogs online which give advice on how to structure a README file which can be overwhelming. I asked ChatGPT for its opinion.

**Prompt:** How do you structure a readme file for a github repository?    
**Response:**
```
# Project Title

## Description
What your project does and why it exists.

## Features
- Key feature 1
- Key feature 2

## Installation
Steps to set up the project locally.

## Usage
How to run and use the app.

## Technologies
Tools, languages, frameworks used.

## Project Structure
(Optional) Explain folders/files.

## API / Routes (if applicable)
Explain endpoints.

## Screenshots
(Optional but helpful)

## Future Improvements
What you plan to add.

## Author
Your name

## License
(Optional)
```
The chat then proceeded to explain each of these fields in detais, highlighting what readers would expect from a README under each section. After reviewing all the fields of this output I believed this to be a great structure for this specific project. For my implemenation of the file I also included a directory tree which visually displays the structure of the entire repository.

## Summary

Generative AI was useful throughout this project as a supportive tool. It aided in code debugging when resolutions were difficult to devise, understanding technical concepts from the lecture notes, including modular javascript and fetch functions as well as understanding new concepts such as password hashing and route security. However despite its benefit, AI output was treated as guidance only. After each response, I ensured that its advice was applicable to my specific needs.
