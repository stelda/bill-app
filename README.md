### Description

This project, initiated as part of a software developer training program, is focused on debugging and testing a billing application.

### Launch Backend:

1. Go to the project directory : `cd Billed-app-FR-Back`
2. Install project dependencies : `npm install`
3. Run the API : `npm run run:dev`
4. Access  : `http://localhost:5678`

### Launch Frontend:

1. Go to the project directory : `cd Billed-app-FR-Front`
2. Install project dependencies : `npm install`
3. Install live-server : `npm install -g live-server`
4. Launch app  : `live-server`
5. Access : `http://127.0.0.1:8080/`

### Frontend Tests:

1. Go to the project directory : `cd Billed-app-FR-Front`
2. Run all tests : `npm run test`
3. Run one test :
    1. install jest-cli: `npm i --save-dev jest-cli`
    2. launch test: `jest src/__tests__/your_test_file.js`
4. Access : `http://127.0.0.1:8080/coverage/lcov-report/`

### Backend Credentials
```
administration :
user : admin@company.tld 
password : admin

employee :
user : employee@company.tld
password : employee
```

### Frontend Credentials
```
administration :
user : admin@test.tld 
password : admin

employee :
user : employee@test.tld
password : employee
```