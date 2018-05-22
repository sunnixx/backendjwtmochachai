/* 
    These are test cases for APIs shared by the server.
    The APIs tested for public and protected routes with Token initialized.
*/

const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const server = require('../app');

chai.use(chaiHttp); //Connect Http to the server

describe('/GET Token',() => {
    it('it should not run without username and password as query string',(done) => {
        chai.request(server)
        .get('/api/login')
        .end((err,res) => {

            if(err) throw err;

            res.should.have.status(403);
            done();
        });
    });
});

describe('/GET protected APIs json patch should not be accessible without Token',() => {
    it('it should not run without Token',(done) => {
        chai.request(server)
        .get('/api/protected/jsonpatch')
        .end((err,res) => {
            if(err) throw err;

            res.should.have.status(403);
            done();
        });
    });
});

describe('/GET protected API image download and resize should not run without token',() => {
    it('it should not run without Token',(done) => {
        chai.request(server)
        .get('/api/protected/imagereq')
        .end((err,res) => {
            if(err) throw err;

            res.should.have.status(403);
            done();
        });
    });
});

describe('/GET Token with Query String', () => {
    it('it should run with query string',(done) => {
        chai.request(server)
        .get('/api/login?username=john&&password=1234')
        .end((err,res) => {
            if(err) throw err;

            res.should.have.status(200);
            done();
        });
    });
});

describe('/GET protected APIs should not be accessible without Token',() => {
    it('it should not run without Token',(done) => {
        chai.request(server)
        .get('/api/protected/jsonpatch')
        .end((err,res) => {
            if(err) throw err;

            res.should.have.status(200);
            done();
        });
    });
});