import fs from 'fs'
import {webcrypto} from 'node:crypto'
import init, {resolve_if} from './pkg/conditions.js'

//globalThis.crypto = webcrypto

const wasmBuf = fs.readFileSync('./pkg/conditions_bg.wasm')
const wasm = await WebAssembly.compile(wasmBuf)
await init(wasm)

var tests = {
    'true': {
        result: true,
        script: 'vars.success',
        data: {'success': true}
    },
    'false': {
        result: false,
        script: 'vars.success',
        data: {'success': false}
    },
    'test AND pass': {
        result: true,
        script: 'vars.success && vars.notFailed',
        data: {'success': true, 'notFailed': true}
    },
    'test OR pass': {
        result: true,
        script: 'vars.success || vars.notFailed',
        data: {'success': false, 'notFailed': true}
    },
    'test string pass': {
        result: true,
        script: 'vars.name == "test"',
        data: {'name': 'test'}
    },
    'test string fail': {
        result: false,
        script: 'vars.name == "test"',
        data: {'name': 'not test'}
    },
    'test string not match pass': {
        result: false,
        script: 'vars.name != "test"',
        data: {'name': 'test'}
    },
    'throws if invalid': {
        result: false,
        script: '==',
        data: {},
        throws: true
    },
    'test arrays': {
        result: true,
        script: '["1", "2", "3"].contains(vars.needle)',
        data: {'needle': '2'}
    },
    'test single quotes': {
        result: true,
        script: 'vars.loader == \'vanilla\'',
        data: {'loader': 'vanilla'}
    },
    'test map reference': {
        result: true,
        script: 'vars["loader"] == "vanilla"',
        data: {'loader': 'vanilla'}
    }
}

for (const testsKey in tests) {
    let test = tests[testsKey]

    let threw = false
    let result = false;

    console.log('------------------------------------')

    try {
        result = resolve_if(test.script, test.data)
    } catch (e) {
        console.log(e)
        threw = true
    }

    console.log('Test: ' + testsKey)
    console.log('Expected: ' + test.result)
    console.log('Actual: ' + result)
    console.log('Threw: ' + threw)

    if (threw && !test.throws) {
        throw 'test threw an error, was not expected'
    } else if (test.result !== result) {
        throw 'Test failed'
    }
}

console.log('------------------------------------')
console.log('Tests passed')
