const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
    console.log("fuck!");

const app = http.createServer((request, response) => {
    const queryData = url.parse(request.url, true).query;
    const pathname = url.parse(request.url, true).pathname;
    if(pathname === '/' && queryData.id !== undefined){
        let description = fs.readFileSync(path.join(__dirname, 'description', queryData.id), 'utf8');
        let template = `
        <h1><a href="/">About Cat</a></h1>
        <ol>
            <li><a href="/?id=1">picture 1</a></li>
            <li><a href="/?id=2">picture 2</a></li>
            <li><a href="/?id=3">picture 3</a></li>
        </ol>
        <h2>cat ${queryData.id}</h2>
        <p>${description}</p>
        `;
        response.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        response.end(template);
    }
    else if(pathname === '/' && queryData.id === undefined){
        let description = fs.readFileSync(path.join(__dirname, 'description', 'home'), 'utf8');
        let template = `
        <h1><a href="/">About Cat</a></h1>
        <ol>
            <li><a href="/?id=1">cat 1</a></li>
            <li><a href="/?id=2">cat 2</a></li>
            <li><a href="/?id=3">cat 3</a></li>
        </ol>
        <h2>home</h2>
        <p>${description}</p>
        `;
        response.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        response.end(template);
    }
    else{
        response.writeHead(404, {'content-type': 'text/html; charset=utf-8'});
        response.end('page not found');
    }

});

app.listen(3000, () => {
    console.log("success");
});