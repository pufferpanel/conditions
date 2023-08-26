import conditions from './pkg/conditions.js'

await conditions.default() // init wasm

const {require_if} = conditions

var tests = {
    'true': {
        result: true,
        script: 'success',
        data: {'success': true}
    },
    'false': {
        result: false,
        script: 'success',
        data: {'success': false}
    },
    'test AND pass': {
        result: true,
        script: 'success && notFailed',
        data: {'success': true, 'notFailed': true}
    },
    'test OR pass': {
        result: true,
        script: 'success || notFailed',
        data: {'success': false, 'notFailed': true}
    },
    'test string pass': {
        result: true,
        script: 'name == "test"',
        data: {'name': 'test'}
    },
    'test string fail': {
        result: false,
        script: 'name == "test"',
        data: {'name': 'not test'}
    },
    'test string not match pass': {
        result: false,
        script: 'name != "test"',
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
        script: '["1", "2", "3"].contains(needle)',
        data: {'needle': '2'}
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
