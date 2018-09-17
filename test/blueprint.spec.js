/* global describe, beforeEach, it */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('./utils/expected-files');
const ServerGenerator = require('../generators/server');

const blueprintSubGen = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important
        const jhContext = this.jhipsterContext = this.options.jhipsterContext;
        if (!jhContext) {
            this.error('This is a JHipster blueprint and should be used only like \'jhipster --blueprint decofer\')}');
        }
        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupServerOptions(this, jhContext);
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        return super._configuring();
    }

    get default() {
        return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const customPhaseSteps = {
            addDummyMavenProperty() {
                this.addMavenProperty('dummy-blueprint-property', 'foo');
            }
        };
        return Object.assign(phaseFromJHipster, customPhaseSteps);
    }

    get end() {
        return super._end();
    }
};

describe('JHipster server generator with blueprint', () => {
    describe('generate server', () => {
        beforeEach((done) => {
            helpers.run(path.join(__dirname, '../generators/server'))
                .withOptions({ skipInstall: true, blueprint: 'generator-jhipster-myblueprint', skipChecks: true })
                .withGenerators([
                    [blueprintSubGen, 'jhipster-myblueprint:server']
                ])
                .withPrompts({
                    baseName: 'jhipster',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    cacheProvider: 'ehcache',
                    enableHibernateCache: true,
                    databaseType: 'sql',
                    devDatabaseType: 'h2Memory',
                    prodDatabaseType: 'mysql',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    buildTool: 'maven',
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                    serverSideOptions: []
                })
                .on('end', done);
        });

        it('creates expected files from jhipster server generator', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.jwtServer);
            assert.file(expectedFiles.maven);
        });

        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('pom.xml', /dummy-blueprint-property/);
        });
    });
});
