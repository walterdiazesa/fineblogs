# FINE Blogs (Firebase+Next+Redis+TypeScript)

This project has the purpose to make an easy personal scalable blog site like DEV or MEDIUM, with blogs, likes, comments, and replies with the quickest loads possibles using redis.

**Demo:** [my blog](https://www.walterdiazesa.com/blog)

## Used stack (FINE)

> (**FI**rebase + **NE**xtJs = **FINE**)

- NextJs as the React framework
- Redis for caching
- Firestore for the database
- Google Storage for the storage of the thumbnails
- Firebase Auth for authorization and authentication

## Infrastructure

![infrastructure](https://user-images.githubusercontent.com/58494087/124520827-d9038f00-ddaa-11eb-9d21-db71e0c1ec61.jpg)

## Used tools

- Typescript as the primary used language
- TailwindCSS for styling
- eslint, prettier and husky for code format automation
- [next-firebase-auth](https://github.com/gladly-team/next-firebase-auth) for the authentication and secure cookies management

## Tech justification

NextJs right now is probably the best framework to get the most out of React for creating applications. SSR is used for the /blog because its the most "CPU expensive" page on the site, plus it is the page that changes most frequently, and SSG for the specific blog's pages because they are not changing too often and ISR is used when that's the case

I choose the entire Firebase ecosystem because is one of the quickest way to add functionalities to my app, other chooses as BaaS can be Amplify (The Amazon option) or create each module by hand, maybe using Mongo for the DB, NextAuth for the auth and so on.

Used next/image for serving images in webp, for using lazy loading and overall automatic optimization of image

Firebase region setup for my particular case, in which my target audience have better times on us-east1, use the best for you.

**us-east1 over us-central1** in my case:

- Advantages: Better latency and lower costs
- Disadvantages: Disponibility and durability

  ![gcping](https://user-images.githubusercontent.com/58494087/124525860-132a5c00-ddbe-11eb-9609-4cb810610aac.jpg "Courtesy gcping")

## Firebase Config

> **Firestore Rules:**

    rules_version = '2';
    service cloud.firestore {
        match /databases/{database}/documents {
                match /blogs/{blogID} {
                allow read;
                allow write: if request.auth.token.admin == true;

                function comrepCreate() {
                    return request.auth != null &&
                    request.resource.data.body != "" &&
                    (request.resource.data.created_by == request.auth.token.email ||
                    request.resource.data.created_by == request.auth.token.phone_number)
                }
                function comrepUpDel() {
                    return request.auth.token.email == resource.data.created_by ||
                    request.auth.token.phone_number == resource.data.created_by
                }

                match /comments/{commentID} {
                    allow read;
                    allow create: if comrepCreate();
                    allow update, delete: if comrepUpDel()
                    match /likes/{likeID} {
                    allow read;
                    allow create: if request.auth != null &&
                    (request.auth.token.email == request.resource.id ||
                    request.auth.token.phone_number == request.resource.id);
                    allow update, delete: if request.auth.token.email == likeID ||
                    request.auth.token.phone_number == likeID;
                    }
                    match /replies/{replyID} {
                        allow read;
                    allow create: if comrepCreate();
                        allow update, delete: if comrepUpDel()
                    }
                }
                match /likes/{likeID} {
                    allow read;
                    allow create: if request.auth != null &&
                    !request.auth.token.admin &&
                    (request.auth.token.email == request.resource.id ||
                    request.auth.token.phone_number == request.resource.id);
                    allow update, delete: if request.auth.token.email == likeID ||
                    request.auth.token.phone_number == likeID;
                }
            }
        }
    }

> **Firestore Organization:**

> ![firestoreorganization1](https://user-images.githubusercontent.com/58494087/124527069-c6e11b00-ddc1-11eb-838a-fe75f6c8404e.jpg) > ![firestoreorganization2](https://user-images.githubusercontent.com/58494087/124527065-c6488480-ddc1-11eb-8c30-8fb8a81974a1.jpg)![firestoreorganization3](https://user-images.githubusercontent.com/58494087/124527068-c6e11b00-ddc1-11eb-999b-e0cde4a88fa1.jpg) > ![firestoreorganization3](https://user-images.githubusercontent.com/58494087/124527076-cd6f9280-ddc1-11eb-8279-e6ce3df3a9f9.jpg)

> **Storage Rules:**

    rules_version = '2';
    service firebase.storage {
        match /b/{bucket}/o {
            match /{allPaths=**} {
            allow read: if true;
            allow write: if request.auth.token.admin == true; //request.auth != null
            }
        }
    }

> **Storage Organization:**

![storageorganization](https://user-images.githubusercontent.com/58494087/124526593-8b921c80-ddc0-11eb-8754-ba5e92ce8795.jpg)

## How to use the project

    1- Clone or download the project
    2- Create your firebase project
    3- In the file .env.local.example change the vars to your use values on .env.local
    4- npm install
    5- If you're running the project on dev, you can create your redis-server on your computer, if so delete "REDIS_URL" in the .env.local file, if you have your redis instance on a external server or you're deploying to production, set "REDIS_URL" in .env.local with the specified format as .env.local.example shows

~~The project is already setup to follow the google typescript styleguides when you do a git commit~~

# Feedback and Roast

    Please feel free to give me advice or feedback about anything, im not a pro-programmer or something close, I have too much to learn so I really appreciate all that stuff, plus feel free to roast my english and give me feedback about that also, thanks for reading me
